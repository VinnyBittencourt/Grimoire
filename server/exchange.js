// Export/import de personagem no formato próprio do Grimoire (JSON versionado).
// O import cria um personagem NOVO e remapeia todos os ids internos
// (classes, magias, locais, NPCs, recursos), inclusive as referências cruzadas.
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { COLLECTIONS, characterFields } from './schemas.js'
import { HttpError } from './repo.js'
import { savePhotoBuffer, parseImageDataUrl } from './photos.js'

export const FORMAT = 'grimoire-character'
export const VERSION = 2

const ORDER = ['classes', 'skills', 'attacks', 'items', 'feats', 'resources', 'spells', 'prepared', 'summons',
  'players', 'npcs', 'places', 'quests', 'notes']

const STRIP = ['id', 'character_id']

function photoToDataUrl(photosDir, file) {
  if (!file) return null
  const path = join(photosDir, file)
  if (!existsSync(path)) return null
  const ext = file.split('.').pop()
  const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`
  return `data:${mime};base64,${readFileSync(path).toString('base64')}`
}

export function exportCharacter(repo, photosDir, id) {
  const sheet = repo.getSheet(id)
  const journal = repo.getJournal(id)
  const { photo, ...character } = repo.getCharacterRow(id)
  const out = {
    format: FORMAT, version: VERSION, exported_at: new Date().toISOString(),
    character: { ...character, photo_data: photoToDataUrl(photosDir, photo) },
  }
  for (const name of ORDER) {
    const rows = sheet[name] ?? journal[name] ?? []
    out[name] = name === 'npcs'
      ? rows.map(({ photo: p, ...r }) => ({ ...r, photo_data: photoToDataUrl(photosDir, p) }))
      : rows
  }
  out.spell_slots = sheet.spell_slots
  return out
}

// Foto embutida: só jpg/png/webp/gif conferidos pelo conteúdo. Foto inválida dá 400 (não é descartada em silêncio).
function dataUrlToBuffer(dataUrl, where) {
  if (!dataUrl) return null
  const img = parseImageDataUrl(dataUrl)
  if (!img) throw new HttpError(400, 'invalid_image', `Foto inválida em ${where} (aceitas: jpg, png, webp, gif)`)
  return img
}

const pick = (obj, allowed) => Object.fromEntries(Object.entries(obj ?? {}).filter(([k]) => allowed.has(k)))

export function importCharacter(db, repo, photosDir, payload) {
  if (payload?.format !== FORMAT) throw new HttpError(400, 'invalid_format', 'Arquivo não é um export do Grimoire')
  if (payload.version > VERSION) throw new HttpError(400, 'invalid_format', `Versão ${payload.version} mais nova que a suportada (${VERSION})`)

  const charAllowed = new Set(Object.keys(characterFields.shape))
  return db.transaction(() => {
    const charValues = characterFields.parse(pick(payload.character, charAllowed))
    const img = dataUrlToBuffer(payload.character?.photo_data, 'character')
    if (img) charValues.photo = savePhotoBuffer(photosDir, img.buffer, img.ext)
    const newId = repo.insertRow('characters', charValues)

    const maps = { classes: new Map(), spells: new Map(), places: new Map(), npcs: new Map(), resources: new Map() }
    const remap = (map, v) => (v == null ? null : map.get(v) ?? null)

    for (const name of ORDER) {
      const def = COLLECTIONS[name]
      const allowed = new Set(Object.keys(def.fields))
      for (const raw of payload[name] ?? []) {
        const values = pick(raw, allowed)
        for (const k of STRIP) delete values[k]
        if ('class_row_id' in values) values.class_row_id = remap(maps.classes, raw.class_row_id)
        if (name === 'classes') values.advances_id = null // ligado na segunda passada
        if (name === 'prepared') {
          values.spell_id = remap(maps.spells, raw.spell_id)
          if (values.spell_id == null) continue
        }
        if (name === 'quests') {
          values.place_id = remap(maps.places, raw.place_id)
          values.npc_ids = (raw.npc_ids ?? []).map(n => maps.npcs.get(n)).filter(Boolean)
        }
        const parsed = def.patch.parse(values)
        const { npc_ids: npcIds, ...cols } = parsed
        if (name === 'npcs') {
          const nimg = dataUrlToBuffer(raw.photo_data, `npcs (${raw.name ?? raw.id})`)
          if (nimg) cols.photo = savePhotoBuffer(photosDir, nimg.buffer, nimg.ext)
        }
        const rowId = repo.insertRow(def.table, { ...cols, character_id: newId })
        if (maps[name]) maps[name].set(raw.id, rowId)
        if (name === 'quests' && npcIds?.length) {
          const ins = db.prepare('INSERT OR IGNORE INTO quest_npcs (quest_id, npc_id) VALUES (?, ?)')
          for (const nid of npcIds) ins.run(rowId, nid)
        }
        if (name === 'resources') {
          const ins = db.prepare('INSERT INTO resource_uses (resource_id, idx, used, note) VALUES (?, ?, ?, ?)')
          for (const u of raw.uses ?? []) ins.run(rowId, Number(u.idx) || 0, u.used ? 1 : 0, u.note ?? null)
        }
      }
    }
    // Segunda passada: classes de prestígio que avançam outra classe
    for (const raw of payload.classes ?? []) {
      if (raw.advances_id != null && maps.classes.has(raw.advances_id)) {
        db.prepare('UPDATE character_classes SET advances_id = ? WHERE id = ?')
          .run(maps.classes.get(raw.advances_id), maps.classes.get(raw.id))
      }
    }
    for (const s of payload.spell_slots ?? []) {
      const classRowId = maps.classes.get(s.class_row_id)
      if (!classRowId) continue
      db.prepare('INSERT INTO spell_slots (character_id, class_row_id, level, bonus, used) VALUES (?, ?, ?, ?, ?)')
        .run(newId, classRowId, s.level, Number(s.bonus) || 0, Number(s.used) || 0)
    }
    return repo.getSheet(newId)
  })()
}
