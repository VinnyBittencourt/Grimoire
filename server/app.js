import express from 'express'
import { join } from 'path'
import { z } from 'zod'
import { createRepo, HttpError } from './repo.js'
import { COLLECTIONS, characterFields, createCharacter, slotPatch, usePatch, restBody, preparedReplace } from './schemas.js'
import { exportCharacter, importCharacter } from './exchange.js'
import { IMAGE_TYPES, detectImageExt, savePhotoBuffer, deletePhoto } from './photos.js'
import { exportRoll20, importRoll20 } from './roll20/index.js'

const REF_TABLES = new Set(['ref_talentos', 'ref_falhas', 'ref_racas', 'ref_classes', 'ref_criaturas'])
const REF_JSON = ['categoria', 'efeitos', 'atributos', 'habilidades', 'saves', 'fonte']

const id = v => {
  const n = Number(v)
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, 'invalid_id', `id inválido: ${v}`)
  return n
}

// A API não tem autenticação; o bind em 127.0.0.1 não impede que uma página aberta no navegador
// faça requisições para cá. Por isso:
// - Host precisa ser local (bloqueia DNS rebinding);
// - escritas com Origin precisam vir de origem local (bloqueia CSRF de outros sites).
// Requisições sem Origin (curl, testes, GET de mesma origem) passam.
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

function hostnameOf(value) {
  try { return new URL(value.includes('://') ? value : `http://${value}`).hostname } catch { return null }
}

function localOnly(req, res, next) {
  const fail = message => res.status(403).json({ error: { code: 'forbidden_origin', message } })
  if (!LOCAL_HOSTS.has(hostnameOf(req.headers.host ?? ''))) return fail('Host não permitido')
  const origin = req.headers.origin
  if (!SAFE_METHODS.has(req.method)) {
    if (origin !== undefined && !LOCAL_HOSTS.has(hostnameOf(origin))) return fail('Origem não permitida')
    if (req.headers['sec-fetch-site'] === 'cross-site') return fail('Origem não permitida')
  }
  res.setHeader('X-Content-Type-Options', 'nosniff')
  next()
}

/**
 * Cria o app Express. opts: { db, dataDir (null em testes), backupper, onWrite() }
 */
export function createApp({ db, dataDir, backupper, onWrite = () => {} }) {
  const repo = createRepo(db)
  const photosDir = join(dataDir ?? process.cwd(), dataDir ? 'photos' : '.tmp-photos')
  const app = express()
  app.disable('x-powered-by')
  app.use(localOnly)
  app.use(express.json({ limit: '25mb' })) // import de personagem com fotos embutidas
  const rawImage = express.raw({ type: Object.keys(IMAGE_TYPES), limit: '10mb' })

  // Qualquer escrita bem-sucedida marca o banco como "sujo" para o backup periódico
  app.use((req, res, next) => {
    if (req.method !== 'GET') res.on('finish', () => { if (res.statusCode < 400) onWrite() })
    next()
  })

  const r = express.Router()

  // ── Personagens ───────────────────────────────────────────────────────────
  r.get('/characters', (req, res) => res.json(repo.listCharacters()))
  r.post('/characters', (req, res) => res.status(201).json(repo.createCharacter(createCharacter.parse(req.body))))
  r.get('/characters/:id', (req, res) => res.json(repo.getSheet(id(req.params.id))))
  r.patch('/characters/:id', (req, res) => res.json(repo.updateCharacter(id(req.params.id), characterFields.parse(req.body))))
  r.delete('/characters/:id', (req, res) => {
    const cid = id(req.params.id)
    const npcPhotos = repo.listChildren('npcs', cid).map(n => n.photo) // o cascade não apaga arquivos
    const row = repo.deleteCharacter(cid)
    for (const file of [row.photo, ...npcPhotos]) deletePhoto(photosDir, file)
    res.status(204).end()
  })
  r.get('/characters/:id/journal', (req, res) => res.json(repo.getJournal(id(req.params.id))))
  r.post('/characters/:id/rest', (req, res) => res.json(repo.rest(id(req.params.id), restBody.parse(req.body ?? {}))))

  // ── Fotos ─────────────────────────────────────────────────────────────────
  function putPhoto(req, current) {
    // A extensão sai do conteúdo; o Content-Type só serve para o express.raw aceitar o corpo
    const ext = detectImageExt(req.body)
    if (!ext) throw new HttpError(400, 'invalid_image', 'Envie a imagem como corpo binário (image/jpeg, png, webp ou gif)')
    const file = savePhotoBuffer(photosDir, req.body, ext)
    deletePhoto(photosDir, current)
    return file
  }
  r.put('/characters/:id/photo', rawImage, (req, res) => {
    const cid = id(req.params.id)
    const file = putPhoto(req, repo.getCharacterRow(cid).photo)
    repo.updateRow('characters', cid, { photo: file })
    res.json(repo.getCharacterRow(cid))
  })
  r.delete('/characters/:id/photo', (req, res) => {
    const cid = id(req.params.id)
    deletePhoto(photosDir, repo.getCharacterRow(cid).photo)
    repo.updateRow('characters', cid, { photo: null })
    res.json(repo.getCharacterRow(cid))
  })
  r.put('/characters/:id/npcs/:rowId/photo', rawImage, (req, res) => {
    const cid = id(req.params.id), nid = id(req.params.rowId)
    const file = putPhoto(req, repo.getChild('npcs', cid, nid).photo)
    repo.updateRow('npcs', nid, { photo: file })
    res.json(repo.getChild('npcs', cid, nid))
  })

  // ── Ações específicas ─────────────────────────────────────────────────────
  r.put('/characters/:id/spell-slots/:classRowId/:level', (req, res) => {
    const level = z.coerce.number().int().min(0).max(9).parse(req.params.level)
    res.json(repo.upsertSlot(id(req.params.id), id(req.params.classRowId), level, slotPatch.parse(req.body)))
  })
  r.put('/characters/:id/prepared', (req, res) => res.json(repo.replacePrepared(id(req.params.id), preparedReplace.parse(req.body))))
  r.put('/characters/:id/resources/:rowId/uses/:idx', (req, res) => {
    const idx = z.coerce.number().int().min(0).max(200).parse(req.params.idx)
    res.json(repo.upsertUse(id(req.params.id), id(req.params.rowId), idx, usePatch.parse(req.body)))
  })
  r.post('/characters/:id/resources/:rowId/reset', (req, res) => res.json(repo.resetResource(id(req.params.id), id(req.params.rowId))))

  // ── Troca de dados (antes das coleções genéricas: /:id/export não é coleção) ──
  r.get('/characters/:id/export', (req, res) => {
    const data = exportCharacter(repo, photosDir, id(req.params.id))
    const name = (data.character.name || 'personagem').replace(/[^a-z0-9]+/gi, '_')
    res.setHeader('Content-Disposition', `attachment; filename="${name}.grimoire.json"`)
    res.json(data)
  })
  r.get('/characters/:id/export/roll20', (req, res) => {
    const data = exportRoll20(repo.getSheet(id(req.params.id)), db)
    const name = (data.character.name || 'personagem').replace(/[^a-z0-9]+/gi, '_')
    res.setHeader('Content-Disposition', `attachment; filename="${name}.roll20.json"`)
    res.json(data)
  })
  r.post('/import', (req, res) => res.status(201).json(importCharacter(db, repo, photosDir, req.body)))
  r.post('/import/roll20', (req, res) => res.status(201).json(importRoll20(db, repo, req.body)))

  // ── Coleções genéricas ────────────────────────────────────────────────────
  const collection = name => {
    if (!COLLECTIONS[name]) throw new HttpError(404, 'not_found', `Coleção desconhecida: ${name}`)
    return COLLECTIONS[name]
  }
  r.get('/characters/:id/:collection', (req, res) => {
    collection(req.params.collection)
    repo.getCharacterRow(id(req.params.id))
    res.json(repo.listChildren(req.params.collection, id(req.params.id)))
  })
  r.post('/characters/:id/:collection', (req, res) => {
    const def = collection(req.params.collection)
    res.status(201).json(repo.createChild(req.params.collection, id(req.params.id), def.create.parse(req.body)))
  })
  r.patch('/characters/:id/:collection/:rowId', (req, res) => {
    const def = collection(req.params.collection)
    res.json(repo.updateChild(req.params.collection, id(req.params.id), id(req.params.rowId), def.patch.parse(req.body)))
  })
  r.delete('/characters/:id/:collection/:rowId', (req, res) => {
    collection(req.params.collection)
    const row = repo.deleteChild(req.params.collection, id(req.params.id), id(req.params.rowId))
    if (req.params.collection === 'npcs') deletePhoto(photosDir, row.photo)
    res.status(204).end()
  })

  // ── Referência ────────────────────────────────────────────────────────────
  r.get('/ref/:table', (req, res) => {
    if (!REF_TABLES.has(req.params.table)) throw new HttpError(404, 'not_found', 'Tabela não encontrada')
    const rows = db.prepare(`SELECT * FROM ${req.params.table}`).all().map(row => {
      const out = { ...row }
      for (const k of REF_JSON) if (typeof out[k] === 'string') { try { out[k] = JSON.parse(out[k]) } catch { /* texto livre */ } }
      return out
    })
    res.json(rows)
  })

  // ── Backup manual ─────────────────────────────────────────────────────────
  r.post('/backup', async (req, res) => {
    if (!backupper) throw new HttpError(400, 'unavailable', 'Backup indisponível (banco em memória)')
    res.json({ file: await backupper.backup(db, 'manual') })
  })

  app.use('/api', r)
  // sandbox: mesmo que um arquivo não-imagem chegue à pasta, o navegador não executa script dele
  const PHOTO_EXT = /\.(jpg|png|webp|gif)$/i
  if (dataDir) {
    app.use('/photos', (req, res, next) => (PHOTO_EXT.test(req.path) ? next() : res.status(404).end()),
      express.static(photosDir, {
        maxAge: '1y', immutable: true,
        setHeaders: res => res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox"),
      }))
  }

  app.use('/api', (req, res) => res.status(404).json({ error: { code: 'not_found', message: 'Rota não encontrada' } }))

  // ── Erros: formato único { error: { code, message, fields? } } ────────────
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        error: { code: 'validation', message: 'Dados inválidos', fields: err.issues.map(i => ({ path: i.path.join('.'), message: i.message })) },
      })
    }
    if (err instanceof HttpError) return res.status(err.status).json({ error: { code: err.code, message: err.message } })
    if (err.type === 'entity.too.large') return res.status(413).json({ error: { code: 'too_large', message: 'Arquivo grande demais' } })
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: { code: 'invalid_json', message: 'JSON inválido' } })
    if (/SQLITE_CONSTRAINT/.test(err.code ?? '')) return res.status(400).json({ error: { code: 'constraint', message: err.message } })
    console.error(err)
    res.status(500).json({ error: { code: 'internal', message: 'Erro interno' } })
  })

  return app
}
