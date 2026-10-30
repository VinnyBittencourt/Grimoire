// Acesso a dados. Nomes de tabela/coluna vêm SEMPRE de COLLECTIONS/schemas (whitelist),
// nunca do corpo da requisição.
import { COLLECTIONS } from './schemas.js'
import { ensureSkillRows, syncResources } from './defaults.js'

export class HttpError extends Error {
  constructor(status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }
}

const notFound = what => new HttpError(404, 'not_found', `${what} não encontrado`)

const SHEET_COLLECTIONS = ['classes', 'skills', 'attacks', 'items', 'feats', 'resources', 'spells', 'prepared', 'summons']

export function createRepo(db) {
  const q = sql => db.prepare(sql)

  function getCharacterRow(id) {
    const row = q('SELECT * FROM characters WHERE id = ?').get(id)
    if (!row) throw notFound('Personagem')
    return row
  }

  function touch(id) {
    q("UPDATE characters SET updated_at = datetime('now') WHERE id = ?").run(id)
  }

  function listChildren(name, characterId) {
    const { table } = COLLECTIONS[name]
    return q(`SELECT * FROM ${table} WHERE character_id = ? ORDER BY position, id`).all(characterId)
  }

  function resourcesWithUses(characterId) {
    const rows = listChildren('resources', characterId)
    const uses = q(`SELECT u.* FROM resource_uses u JOIN class_resources r ON r.id = u.resource_id
      WHERE r.character_id = ? ORDER BY u.idx`).all(characterId)
    return rows.map(r => ({ ...r, uses: uses.filter(u => u.resource_id === r.id) }))
  }

  function getSheet(id) {
    const out = { ...getCharacterRow(id) }
    for (const name of SHEET_COLLECTIONS) out[name] = name === 'resources' ? resourcesWithUses(id) : listChildren(name, id)
    out.spell_slots = q('SELECT * FROM spell_slots WHERE character_id = ?').all(id)
    return out
  }

  function getJournal(id) {
    getCharacterRow(id)
    const quests = listChildren('quests', id)
    const links = q(`SELECT qn.* FROM quest_npcs qn JOIN quests qu ON qu.id = qn.quest_id WHERE qu.character_id = ?`).all(id)
    return {
      background: q('SELECT background FROM characters WHERE id = ?').get(id).background,
      players: listChildren('players', id),
      npcs: listChildren('npcs', id),
      places: listChildren('places', id),
      quests: quests.map(qu => ({ ...qu, npc_ids: links.filter(l => l.quest_id === qu.id).map(l => l.npc_id) })),
      notes: q('SELECT * FROM notes WHERE character_id = ? ORDER BY session_date DESC, id DESC').all(id),
    }
  }

  function listCharacters() {
    const chars = q('SELECT id, name, photo, race_id, race_name, updated_at FROM characters ORDER BY updated_at DESC').all()
    const classes = q('SELECT character_id, class_id, custom_name, level FROM character_classes ORDER BY position').all()
    return chars.map(c => ({ ...c, classes: classes.filter(k => k.character_id === c.id) }))
  }

  function insertRow(table, values) {
    const cols = Object.keys(values)
    const info = q(`INSERT INTO ${table} (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`)
      .run(cols.map(c => values[c]))
    return Number(info.lastInsertRowid)
  }

  function updateRow(table, id, values) {
    const cols = Object.keys(values)
    if (!cols.length) return
    q(`UPDATE ${table} SET ${cols.map(c => `"${c}" = ?`).join(', ')} WHERE id = ?`).run([...cols.map(c => values[c]), id])
  }

  function createCharacter(data) {
    const { classes, ...fields } = data
    return db.transaction(() => {
      if (fields.hp_max != null && fields.hp_current == null) fields.hp_current = fields.hp_max
      const id = insertRow('characters', fields)
      classes.forEach((c, i) => insertRow('character_classes', { ...c, character_id: id, position: i }))
      ensureSkillRows(db, id)
      syncResources(db, id)
      return getSheet(id)
    })()
  }

  function updateCharacter(id, fields) {
    getCharacterRow(id)
    updateRow('characters', id, fields)
    touch(id)
    return getCharacterRow(id)
  }

  function deleteCharacter(id) {
    const row = getCharacterRow(id)
    q('DELETE FROM characters WHERE id = ?').run(id)
    return row
  }

  // Garante que referências (class_row_id, spell_id, ...) apontam para linhas do mesmo personagem
  function checkOwned(name, characterId, values) {
    for (const [col, table] of Object.entries(COLLECTIONS[name].owned ?? {})) {
      if (values[col] == null) continue
      const ok = q(`SELECT 1 FROM ${table} WHERE id = ? AND character_id = ?`).get(values[col], characterId)
      if (!ok) throw new HttpError(400, 'invalid_reference', `${col} ${values[col]} não pertence a este personagem`)
    }
  }

  function getChild(name, characterId, rowId) {
    const { table } = COLLECTIONS[name]
    const row = q(`SELECT * FROM ${table} WHERE id = ? AND character_id = ?`).get(rowId, characterId)
    if (!row) throw notFound('Registro')
    return row
  }

  function setQuestNpcs(questId, characterId, npcIds) {
    q('DELETE FROM quest_npcs WHERE quest_id = ?').run(questId)
    const ok = q('SELECT 1 FROM npcs WHERE id = ? AND character_id = ?')
    const ins = q('INSERT OR IGNORE INTO quest_npcs (quest_id, npc_id) VALUES (?, ?)')
    for (const nid of npcIds) if (ok.get(nid, characterId)) ins.run(questId, nid)
  }

  function decorate(name, characterId, row) {
    if (name === 'quests') {
      return { ...row, npc_ids: q('SELECT npc_id FROM quest_npcs WHERE quest_id = ?').all(row.id).map(r => r.npc_id) }
    }
    if (name === 'resources') return { ...row, uses: q('SELECT * FROM resource_uses WHERE resource_id = ? ORDER BY idx').all(row.id) }
    return row
  }

  function afterWrite(name, characterId) {
    if (name === 'classes') syncResources(db, characterId)
    touch(characterId)
  }

  function createChild(name, characterId, values) {
    getCharacterRow(characterId)
    checkOwned(name, characterId, values)
    return db.transaction(() => {
      const { npc_ids: npcIds, ...cols } = values
      if (cols.position == null) {
        const { table } = COLLECTIONS[name]
        cols.position = (q(`SELECT MAX(position) m FROM ${table} WHERE character_id = ?`).get(characterId).m ?? -1) + 1
      }
      const id = insertRow(COLLECTIONS[name].table, { ...cols, character_id: characterId })
      if (name === 'quests' && npcIds) setQuestNpcs(id, characterId, npcIds)
      afterWrite(name, characterId)
      return decorate(name, characterId, getChild(name, characterId, id))
    })()
  }

  function updateChild(name, characterId, rowId, values) {
    getChild(name, characterId, rowId)
    checkOwned(name, characterId, values)
    if (name === 'classes' && values.advances_id === rowId) {
      throw new HttpError(400, 'invalid_reference', 'Uma classe não pode avançar a si mesma')
    }
    return db.transaction(() => {
      const { npc_ids: npcIds, ...cols } = values
      updateRow(COLLECTIONS[name].table, rowId, cols)
      if (name === 'quests' && npcIds) setQuestNpcs(rowId, characterId, npcIds)
      if (name === 'notes') q("UPDATE notes SET updated_at = datetime('now') WHERE id = ?").run(rowId)
      afterWrite(name, characterId)
      return decorate(name, characterId, getChild(name, characterId, rowId))
    })()
  }

  function deleteChild(name, characterId, rowId) {
    const row = getChild(name, characterId, rowId)
    q(`DELETE FROM ${COLLECTIONS[name].table} WHERE id = ?`).run(rowId)
    afterWrite(name, characterId)
    return row
  }

  function upsertSlot(characterId, classRowId, level, values) {
    checkOwned('prepared', characterId, { class_row_id: classRowId })
    q(`INSERT INTO spell_slots (character_id, class_row_id, level) VALUES (?, ?, ?)
      ON CONFLICT(class_row_id, level) DO NOTHING`).run(characterId, classRowId, level)
    const cols = Object.keys(values)
    if (cols.length) {
      q(`UPDATE spell_slots SET ${cols.map(c => `"${c}" = ?`).join(', ')} WHERE class_row_id = ? AND level = ?`)
        .run([...cols.map(c => values[c]), classRowId, level])
    }
    touch(characterId)
    return q('SELECT * FROM spell_slots WHERE class_row_id = ? AND level = ?').get(classRowId, level)
  }

  function upsertUse(characterId, resourceId, idx, values) {
    getChild('resources', characterId, resourceId)
    q(`INSERT INTO resource_uses (resource_id, idx) VALUES (?, ?) ON CONFLICT(resource_id, idx) DO NOTHING`).run(resourceId, idx)
    const cols = Object.keys(values)
    if (cols.length) {
      q(`UPDATE resource_uses SET ${cols.map(c => `"${c}" = ?`).join(', ')} WHERE resource_id = ? AND idx = ?`)
        .run([...cols.map(c => values[c]), resourceId, idx])
    }
    touch(characterId)
    return decorate('resources', characterId, getChild('resources', characterId, resourceId))
  }

  function resetResource(characterId, resourceId) {
    getChild('resources', characterId, resourceId)
    q('DELETE FROM resource_uses WHERE resource_id = ?').run(resourceId)
    q('UPDATE class_resources SET pool_used = 0 WHERE id = ?').run(resourceId)
    touch(characterId)
    return decorate('resources', characterId, getChild('resources', characterId, resourceId))
  }

  // Preparação de uma classe inteira de uma vez (modal de preparação)
  function replacePrepared(characterId, { class_row_id: classRowId, slots }) {
    checkOwned('prepared', characterId, { class_row_id: classRowId })
    for (const s of slots) checkOwned('prepared', characterId, { spell_id: s.spell_id })
    db.transaction(() => {
      q('DELETE FROM spells_prepared WHERE character_id = ? AND class_row_id = ?').run(characterId, classRowId)
      slots.forEach((s, i) => insertRow('spells_prepared', { ...s, character_id: characterId, class_row_id: classRowId, position: i }))
      touch(characterId)
    })()
    return listChildren('prepared', characterId)
  }

  /**
   * Novo dia / descanso: restaura magias preparadas, slots espontâneos e recursos DIÁRIOS
   * (period = 'day'). Recursos por semana e cargas ficam como estão, com as anotações.
   * heal: cura natural de 8 h (PHB p. 146) = nível de personagem em PV e em dano não letal.
   */
  function rest(characterId, { heal }) {
    getCharacterRow(characterId)
    db.transaction(() => {
      q('UPDATE spells_prepared SET used = 0 WHERE character_id = ?').run(characterId)
      q('UPDATE spell_slots SET used = 0 WHERE character_id = ?').run(characterId)
      q("DELETE FROM resource_uses WHERE resource_id IN (SELECT id FROM class_resources WHERE character_id = ? AND period = 'day')").run(characterId)
      q("UPDATE class_resources SET pool_used = 0 WHERE character_id = ? AND period = 'day'").run(characterId)
      if (heal) {
        const level = q('SELECT COALESCE(SUM(level), 0) l FROM character_classes WHERE character_id = ?').get(characterId).l || 1
        q('UPDATE characters SET hp_current = MIN(hp_max, hp_current + ?), nonlethal = MAX(0, nonlethal - ?) WHERE id = ?')
          .run(level, level, characterId)
      }
      touch(characterId)
    })()
    return getSheet(characterId)
  }

  return {
    getCharacterRow, getSheet, getJournal, listCharacters, createCharacter, updateCharacter, deleteCharacter,
    createChild, updateChild, deleteChild, getChild, upsertSlot, upsertUse, resetResource, replacePrepared, rest,
    insertRow, updateRow, listChildren, touch,
  }
}
