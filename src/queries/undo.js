// Campos que podem ser recriados ao "Desfazer" uma exclusão. Precisam estar na whitelist
// das coleções (server/schemas.js, .strict()); o teste tests/api/undo.test.js confere.
// Só coleções sem dependentes entram aqui: recriar não perde nada além do id (que muda).
export const UNDO_FIELDS = {
  attacks: ['name', 'kind', 'ability', 'enh', 'misc', 'damage_dice', 'damage_ability', 'damage_mult', 'damage_misc', 'crit_range', 'crit_mult', 'range_ft', 'damage_type', 'ammo', 'notes'],
  items: ['location', 'icon', 'name', 'qty', 'weight_lb', 'cost_gp', 'notes', 'ac_type', 'ac_bonus', 'max_dex', 'acp', 'spell_failure'],
  feats: ['ref_id', 'kind', 'name', 'description'],
  skills: ['skill_id', 'custom_name', 'ability', 'ranks', 'class_skill', 'misc'],
  summons: ['name', 'ref_creature_id', 'data', 'hp_current', 'hp_max', 'spell_level', 'rounds_left'],
  players: ['name', 'class', 'race', 'notes'],
  places: ['name', 'notes'],
  notes: ['title', 'content', 'session_date'],
}

export function snapshotFor(collection, row) {
  const fields = UNDO_FIELDS[collection]
  if (!fields) return null
  return Object.fromEntries(fields.filter(k => row[k] !== undefined).map(k => [k, row[k]]))
}
