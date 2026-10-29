import { SKILLS } from '../shared/constants/skills.js'
import { RESOURCES, defaultResourcesFor } from '../shared/rules/resources.js'

// Cria uma linha por perícia do PHB (como a ficha Roll20), exceto as que já existem
export function ensureSkillRows(db, characterId) {
  const have = new Set(db.prepare('SELECT skill_id FROM skills WHERE character_id = ?').all(characterId).map(r => r.skill_id))
  const insert = db.prepare('INSERT INTO skills (character_id, position, skill_id) VALUES (?, ?, ?)')
  SKILLS.forEach((s, i) => { if (!have.has(s.id)) insert.run(characterId, i, s.id) })
}

/**
 * Sincroniza os recursos automáticos com as classes do personagem: cria os que faltam.
 * Recursos de uma classe removida somem pelo ON DELETE CASCADE de class_row_id.
 * Recursos personalizados (key nula) nunca são tocados.
 */
export function syncResources(db, characterId) {
  const classes = db.prepare('SELECT * FROM character_classes WHERE character_id = ?').all(characterId)
  const existing = db.prepare('SELECT key, class_row_id FROM class_resources WHERE character_id = ? AND key IS NOT NULL').all(characterId)
  const have = new Set(existing.map(r => `${r.key}:${r.class_row_id}`))
  const insert = db.prepare(`INSERT INTO class_resources (character_id, position, key, class_row_id, icon, kind)
    VALUES (?, ?, ?, ?, ?, ?)`)
  let pos = existing.length
  for (const { key, classRowId } of defaultResourcesFor(classes)) {
    if (have.has(`${key}:${classRowId}`)) continue
    const def = RESOURCES[key]
    insert.run(characterId, pos++, key, classRowId, def.icon, def.kind)
  }
}
