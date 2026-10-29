import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import request from 'supertest'
import { mkdtempSync, rmSync, existsSync, readdirSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { openDatabase } from '../../server/db.js'
import { createApp } from '../../server/app.js'

const opened = []
async function setup() {
  const dataDir = mkdtempSync(join(tmpdir(), 'grimoire-test-'))
  const { db, backupper } = await openDatabase(dataDir)
  opened.push({ db, dataDir })
  return { db, api: request(createApp({ db, dataDir, backupper })), dataDir }
}
// No Windows o arquivo .db fica travado enquanto a conexão está aberta
afterAll(() => {
  for (const { db, dataDir } of opened) {
    db.close()
    rmSync(dataDir, { recursive: true, force: true })
  }
})

let api, db, dataDir
beforeEach(async () => { ({ api, db, dataDir } = await setup()) })

const newCleric = (extra = {}) => api.post('/api/characters').send({
  name: 'Bonar', wis_base: 16, cha_base: 14, hp_max: 20,
  classes: [{ class_id: 'cleric', level: 5 }], ...extra,
})

describe('personagens', () => {
  it('cria com perícias e recursos padrão, PV atual = máximo', async () => {
    const res = await newCleric()
    expect(res.status).toBe(201)
    expect(res.body.skills).toHaveLength(44)
    expect(res.body.resources.map(r => r.key)).toEqual(['turnundead'])
    expect(res.body.hp_current).toBe(20)
  })

  it('lista e busca a ficha', async () => {
    const { body } = await newCleric()
    const list = await api.get('/api/characters')
    expect(list.body[0]).toMatchObject({ id: body.id, name: 'Bonar' })
    expect(list.body[0].classes[0].class_id).toBe('cleric')
    expect((await api.get(`/api/characters/${body.id}`)).body.name).toBe('Bonar')
    expect((await api.get('/api/characters/999')).status).toBe(404)
  })

  it('PATCH só aceita campos conhecidos (whitelist)', async () => {
    const { body } = await newCleric()
    const ok = await api.patch(`/api/characters/${body.id}`).send({ hp_current: 7, str_base: 18 })
    expect(ok.status).toBe(200)
    expect(ok.body).toMatchObject({ hp_current: 7, str_base: 18 })
    const bad = await api.patch(`/api/characters/${body.id}`).send({ 'name" = 1; DROP TABLE characters; --': 'x' })
    expect(bad.status).toBe(400)
    expect(bad.body.error.code).toBe('validation')
    const badType = await api.patch(`/api/characters/${body.id}`).send({ hp_current: 'muito' })
    expect(badType.status).toBe(400)
  })

  it('DELETE remove tudo em cascata', async () => {
    const { body } = await newCleric()
    await api.post(`/api/characters/${body.id}/npcs`).send({ name: 'Elminster' })
    await api.post(`/api/characters/${body.id}/spells`).send({ name: 'Bênção', level: 1 })
    expect((await api.delete(`/api/characters/${body.id}`)).status).toBe(204)
    for (const t of ['characters', 'skills', 'npcs', 'spells', 'class_resources', 'character_classes']) {
      expect(db.prepare(`SELECT COUNT(*) c FROM ${t}`).get().c).toBe(0)
    }
  })
})

describe('coleções', () => {
  it('CRUD genérico com posição automática', async () => {
    const { body: ch } = await newCleric()
    const a = await api.post(`/api/characters/${ch.id}/items`).send({ name: 'Corda', weight_lb: 10 })
    const b = await api.post(`/api/characters/${ch.id}/items`).send({ name: 'Tocha' })
    expect(a.status).toBe(201)
    expect(b.body.position).toBe(a.body.position + 1)
    const upd = await api.patch(`/api/characters/${ch.id}/items/${a.body.id}`).send({ qty: 2 })
    expect(upd.body.qty).toBe(2)
    expect((await api.delete(`/api/characters/${ch.id}/items/${b.body.id}`)).status).toBe(204)
    expect((await api.get(`/api/characters/${ch.id}/items`)).body).toHaveLength(1)
  })

  it('não deixa mexer em linhas de outro personagem', async () => {
    const { body: a } = await newCleric()
    const { body: b } = await newCleric({ name: 'Outro' })
    const item = await api.post(`/api/characters/${a.id}/items`).send({ name: 'Espada' })
    expect((await api.patch(`/api/characters/${b.id}/items/${item.body.id}`).send({ qty: 3 })).status).toBe(404)
    const spell = await api.post(`/api/characters/${a.id}/spells`).send({ name: 'Luz', level: 0 })
    const prep = await api.post(`/api/characters/${b.id}/prepared`).send({ spell_id: spell.body.id })
    expect(prep.status).toBe(400)
    expect(prep.body.error.code).toBe('invalid_reference')
  })

  it('coleção desconhecida → 404', async () => {
    const { body: ch } = await newCleric()
    expect((await api.post(`/api/characters/${ch.id}/sqlite_master`).send({})).status).toBe(404)
  })

  it('adicionar classe cria recursos; remover classe remove os recursos dela', async () => {
    const { body: ch } = await newCleric()
    const cls = await api.post(`/api/characters/${ch.id}/classes`).send({ class_id: 'barbarian', level: 1 })
    let sheet = (await api.get(`/api/characters/${ch.id}`)).body
    expect(sheet.resources.map(r => r.key).sort()).toEqual(['rage', 'turnundead'])
    await api.delete(`/api/characters/${ch.id}/classes/${cls.body.id}`)
    sheet = (await api.get(`/api/characters/${ch.id}`)).body
    expect(sheet.resources.map(r => r.key)).toEqual(['turnundead'])
  })

  it('quests guardam NPCs ligados', async () => {
    const { body: ch } = await newCleric()
    const npc = await api.post(`/api/characters/${ch.id}/npcs`).send({ name: 'Drizzt' })
    const place = await api.post(`/api/characters/${ch.id}/places`).send({ name: 'Menzoberranzan' })
    const quest = await api.post(`/api/characters/${ch.id}/quests`).send({ name: 'Fuga', kind: 'main', place_id: place.body.id, npc_ids: [npc.body.id, 9999] })
    expect(quest.body.npc_ids).toEqual([npc.body.id])
    const journal = (await api.get(`/api/characters/${ch.id}/journal`)).body
    expect(journal.quests[0]).toMatchObject({ name: 'Fuga', place_id: place.body.id, npc_ids: [npc.body.id] })
  })
})

describe('magias, recursos e descanso', () => {
  it('prepara, conjura e Novo Dia restaura sem apagar', async () => {
    const { body: ch } = await newCleric()
    const cls = ch.classes[0]
    const spell = (await api.post(`/api/characters/${ch.id}/spells`).send({ name: 'Bênção', level: 1, class_row_id: cls.id })).body
    const prep = await api.put(`/api/characters/${ch.id}/prepared`).send({
      class_row_id: cls.id, slots: [{ spell_id: spell.id, level: 1 }, { spell_id: spell.id, level: 1, is_domain: 1 }],
    })
    expect(prep.body).toHaveLength(2)
    await api.patch(`/api/characters/${ch.id}/prepared/${prep.body[0].id}`).send({ used: true })
    const res = (await api.get(`/api/characters/${ch.id}`)).body.resources[0]
    await api.put(`/api/characters/${ch.id}/resources/${res.id}/uses/0`).send({ used: 1, note: 'zumbis' })
    await api.put(`/api/characters/${ch.id}/spell-slots/${cls.id}/1`).send({ bonus: 1 })
    await api.patch(`/api/characters/${ch.id}`).send({ hp_current: 10, nonlethal: 3 })

    const rested = (await api.post(`/api/characters/${ch.id}/rest`).send({ heal: true })).body
    expect(rested.prepared).toHaveLength(2)
    expect(rested.prepared.every(p => p.used === 0)).toBe(true)
    expect(rested.resources[0].uses).toEqual([])
    expect(rested.spell_slots[0]).toMatchObject({ level: 1, bonus: 1, used: 0 })
    expect(rested.hp_current).toBe(15)
    expect(rested.nonlethal).toBe(0)
  })
})

describe('fotos', () => {
  it('upload binário vira arquivo e troca remove o antigo', async () => {
    const { body: ch } = await newCleric()
    const png = Buffer.from('89504e470d0a1a0a', 'hex')
    const up1 = await api.put(`/api/characters/${ch.id}/photo`).set('Content-Type', 'image/png').send(png)
    expect(up1.status).toBe(200)
    expect(existsSync(join(dataDir, 'photos', up1.body.photo))).toBe(true)
    const up2 = await api.put(`/api/characters/${ch.id}/photo`).set('Content-Type', 'image/png').send(png)
    expect(existsSync(join(dataDir, 'photos', up1.body.photo))).toBe(false)
    expect(readdirSync(join(dataDir, 'photos'))).toEqual([up2.body.photo])
    expect((await api.put(`/api/characters/${ch.id}/photo`).set('Content-Type', 'text/plain').send('x')).status).toBe(400)
  })
})

describe('export/import Grimoire', () => {
  it('round-trip remapeia ids e preserva referências', async () => {
    const { body: ch } = await newCleric()
    const cls = ch.classes[0]
    const spell = (await api.post(`/api/characters/${ch.id}/spells`).send({ name: 'Luz', level: 0, class_row_id: cls.id })).body
    await api.put(`/api/characters/${ch.id}/prepared`).send({ class_row_id: cls.id, slots: [{ spell_id: spell.id, level: 0 }] })
    const npc = (await api.post(`/api/characters/${ch.id}/npcs`).send({ name: 'Ulaa' })).body
    const place = (await api.post(`/api/characters/${ch.id}/places`).send({ name: 'Templo' })).body
    await api.post(`/api/characters/${ch.id}/quests`).send({ name: 'Q', place_id: place.id, npc_ids: [npc.id] })
    const res = (await api.get(`/api/characters/${ch.id}`)).body.resources[0]
    await api.put(`/api/characters/${ch.id}/resources/${res.id}/uses/1`).send({ used: 1 })

    const exported = (await api.get(`/api/characters/${ch.id}/export`)).body
    expect(exported.format).toBe('grimoire-character')
    const imported = await api.post('/api/import').send(exported)
    expect(imported.status).toBe(201)
    const copy = imported.body
    expect(copy.id).not.toBe(ch.id)
    expect(copy.classes[0].id).not.toBe(cls.id)
    expect(copy.spells[0].class_row_id).toBe(copy.classes[0].id)
    expect(copy.prepared[0].spell_id).toBe(copy.spells[0].id)
    expect(copy.resources.find(r => r.key === 'turnundead').uses).toMatchObject([{ idx: 1, used: 1 }])
    const journal = (await api.get(`/api/characters/${copy.id}/journal`)).body
    expect(journal.quests[0].place_id).toBe(journal.places[0].id)
    expect(journal.quests[0].npc_ids).toEqual([journal.npcs[0].id])
  })

  it('rejeita arquivo de outro formato', async () => {
    expect((await api.post('/api/import').send({ foo: 1 })).status).toBe(400)
  })
})

describe('referência', () => {
  it('seed automático no boot, com JSON já parseado', async () => {
    const feats = (await api.get('/api/ref/ref_talentos')).body
    expect(feats.length).toBeGreaterThan(300)
    expect(Array.isArray(feats[0].efeitos)).toBe(true)
    const classes = (await api.get('/api/ref/ref_classes')).body
    expect(classes.find(c => c.id === 'cleric')).toMatchObject({ bab: 'avg' })
    expect((await api.get('/api/ref/characters')).status).toBe(404)
  })
})
