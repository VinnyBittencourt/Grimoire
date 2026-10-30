import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import request from 'supertest'
import { mkdtempSync, rmSync, existsSync, readdirSync, writeFileSync, mkdirSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { openDatabase } from '../../server/db.js'
import { createApp } from '../../server/app.js'
import { createBackupper } from '../../server/backup.js'
import { detectImageExt } from '../../server/photos.js'

const PNG_B64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
const PNG = Buffer.from(PNG_B64, 'base64')
const HTML_B64 = Buffer.from('<html><script>alert(1)</script></html>').toString('base64')

const opened = []
async function setup() {
  const dataDir = mkdtempSync(join(tmpdir(), 'grimoire-sec-'))
  const { db, backupper } = await openDatabase(dataDir)
  opened.push({ db, dataDir })
  return { db, backupper, api: request(createApp({ db, dataDir, backupper })), dataDir }
}
afterAll(() => {
  for (const { db, dataDir } of opened) {
    db.close()
    rmSync(dataDir, { recursive: true, force: true })
  }
})

let api, db, backupper, dataDir
beforeEach(async () => { ({ api, db, backupper, dataDir } = await setup()) })
const newChar = () => api.post('/api/characters').send({ name: 'Teste', classes: [{ class_id: 'fighter', level: 1 }] })
const photos = () => (existsSync(join(dataDir, 'photos')) ? readdirSync(join(dataDir, 'photos')) : [])

describe('Origin e Host', () => {
  it('escrita com Origin externo dá 403; Origin local e sem Origin passam', async () => {
    const evil = await api.post('/api/characters').set('Origin', 'https://evil.example').send({ name: 'x' })
    expect(evil.status).toBe(403)
    expect(evil.body.error.code).toBe('forbidden_origin')
    expect((await api.post('/api/backup').set('Origin', 'null')).status).toBe(403)
    expect((await api.post('/api/characters').set('Sec-Fetch-Site', 'cross-site').send({ name: 'x' })).status).toBe(403)

    // Front pelo proxy do Vite: Origin http://localhost:3003
    const ok = await api.post('/api/characters').set('Origin', 'http://localhost:3003').send({ name: 'Local' })
    expect(ok.status).toBe(201)
    expect((await api.post('/api/characters').set('Origin', 'http://[::1]:3003').send({ name: 'IPv6' })).status).toBe(201)
    expect((await newChar()).status).toBe(201)
  })

  it('Host não local (DNS rebinding) dá 403 até em GET', async () => {
    expect((await api.get('/api/characters').set('Host', 'evil.example:3005')).status).toBe(403)
    expect((await api.get('/api/characters').set('Host', 'localhost:3003')).status).toBe(200)
  })

  it('respostas levam nosniff', async () => {
    expect((await api.get('/api/characters')).headers['x-content-type-options']).toBe('nosniff')
  })
})

describe('fotos', () => {
  it('detecta a extensão pelo conteúdo', () => {
    expect(detectImageExt(PNG)).toBe('png')
    expect(detectImageExt(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]))).toBe('jpg')
    expect(detectImageExt(Buffer.from('GIF89a......'))).toBe('gif')
    expect(detectImageExt(Buffer.from('RIFF\0\0\0\0WEBPVP8 '))).toBe('webp')
    expect(detectImageExt(Buffer.from('<svg xmlns="x"></svg>'))).toBe(null)
  })

  it('upload com Content-Type de imagem mas conteúdo HTML dá 400', async () => {
    const { body: ch } = await newChar()
    const res = await api.put(`/api/characters/${ch.id}/photo`).set('Content-Type', 'image/png').send(Buffer.from(HTML_B64, 'base64'))
    expect(res.status).toBe(400)
    expect(photos()).toEqual([])
  })

  it('import com photo_data .html ou .svg dá 400 e não grava nada', async () => {
    const { body: ch } = await newChar()
    const exported = (await api.get(`/api/characters/${ch.id}/export`)).body
    for (const dataUrl of [`data:image/html;base64,${HTML_B64}`, `data:image/svg+xml;base64,${HTML_B64}`]) {
      const res = await api.post('/api/import').send({ ...exported, character: { ...exported.character, photo_data: dataUrl } })
      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('invalid_image')
    }
    const npcBad = await api.post('/api/import').send({ ...exported, npcs: [{ id: 1, name: 'N', photo_data: `data:image/png;base64,${HTML_B64}` }] })
    expect(npcBad.status).toBe(400)
    expect(photos()).toEqual([])
    expect((await api.get('/api/characters')).body).toHaveLength(1) // a transação desfez o personagem
  })

  it('import com foto válida usa a extensão detectada', async () => {
    const { body: ch } = await newChar()
    const exported = (await api.get(`/api/characters/${ch.id}/export`)).body
    // MIME declarado errado (gif), conteúdo PNG → salvo como .png
    const res = await api.post('/api/import').send({ ...exported, character: { ...exported.character, photo_data: `data:image/gif;base64,${PNG_B64}` } })
    expect(res.status).toBe(201)
    expect(res.body.photo).toMatch(/\.png$/)
  })

  it('excluir personagem apaga também as fotos dos NPCs', async () => {
    const { body: ch } = await newChar()
    await api.put(`/api/characters/${ch.id}/photo`).set('Content-Type', 'image/png').send(PNG)
    const { body: npc } = await api.post(`/api/characters/${ch.id}/npcs`).send({ name: 'Aldeão' })
    await api.put(`/api/characters/${ch.id}/npcs/${npc.id}/photo`).set('Content-Type', 'image/png').send(PNG)
    expect(photos()).toHaveLength(2)
    expect((await api.delete(`/api/characters/${ch.id}`)).status).toBe(204)
    expect(photos()).toEqual([])
  })

  it('/photos só serve imagens e com CSP sandbox', async () => {
    const { body: ch } = await newChar()
    const { body } = await api.put(`/api/characters/${ch.id}/photo`).set('Content-Type', 'image/png').send(PNG)
    const img = await api.get(`/photos/${body.photo}`)
    expect(img.status).toBe(200)
    expect(img.headers['content-security-policy']).toContain('sandbox')
    expect(img.headers['x-content-type-options']).toBe('nosniff')
    writeFileSync(join(dataDir, 'photos', 'x.html'), '<script>1</script>')
    expect((await api.get('/photos/x.html')).status).toBe(404)
  })
})

describe('backup', () => {
  const files = () => readdirSync(backupper.dir).filter(f => f.endsWith('.db')).sort()

  it('prune por tipo nunca apaga pre-migration, manual nem pre-v2.db', async () => {
    mkdirSync(backupper.dir, { recursive: true })
    const keep = ['grimoire-20200101-0000-pre-migration-v0.db', 'grimoire-20200101-0001-manual.db', 'pre-v2.db']
    for (const f of keep) writeFileSync(join(backupper.dir, f), '')
    for (let i = 0; i < 25; i++) writeFileSync(join(backupper.dir, `grimoire-20200102-${String(i).padStart(4, '0')}-boot.db`), '')
    for (let i = 0; i < 3; i++) writeFileSync(join(backupper.dir, `grimoire-20200103-${String(i).padStart(4, '0')}-auto.db`), '')

    for (let i = 0; i < 25; i++) await backupper.backup(db, 'manual') // vários manuais no mesmo minuto

    const all = files()
    for (const f of keep) expect(all).toContain(f)
    expect(all.filter(f => f.endsWith('-boot.db'))).toHaveLength(20)
    expect(all).toContain('grimoire-20200102-0024-boot.db') // ficam os mais recentes
    expect(all.filter(f => f.endsWith('-auto.db'))).toHaveLength(3)
  })

  it('onlyIfChanged pula backup idêntico e volta a fazer depois de uma escrita', async () => {
    const first = await backupper.backup(db, 'boot', { onlyIfChanged: true })
    expect(first).toBeTruthy()
    expect(await backupper.backup(db, 'boot', { onlyIfChanged: true })).toBe(null)
    await newChar()
    expect(await backupper.backup(db, 'boot', { onlyIfChanged: true })).toBeTruthy()
  })

  it('backup manual via API continua funcionando com Origin local', async () => {
    const res = await api.post('/api/backup').set('Origin', 'http://localhost:3003')
    expect(res.status).toBe(200)
    expect(existsSync(res.body.file)).toBe(true)
  })
})

// Sanidade: a fábrica também funciona isolada (sem openDatabase)
it('createBackupper cria a pasta de backups', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'grimoire-bk-'))
  const { db: mem } = await openDatabase(null)
  const bk = createBackupper(dir)
  expect(await bk.backup(mem, 'auto')).toBeTruthy()
  mem.close()
  rmSync(dir, { recursive: true, force: true })
})
