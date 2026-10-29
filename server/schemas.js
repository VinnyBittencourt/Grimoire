// Validação (zod) de tudo que entra pela API. Os schemas são também a whitelist de colunas:
// nenhuma chave fora daqui chega ao SQL.
import { z } from 'zod'
import { ABILITIES, ALIGNMENTS, GENDERS } from '../shared/constants/abilities.js'
import { SIZE_IDS } from '../shared/constants/sizes.js'
import { CLASS_IDS } from '../shared/constants/classes.js'

const int = z.number().int()
const intN = int.nullable()
const num = z.number()
const text = (max = 2000) => z.string().max(max).nullable()
const bool01 = z.union([z.boolean(), z.literal(0), z.literal(1)]).transform(v => (v ? 1 : 0))
const bool01N = bool01.nullable()
const ability = z.enum(ABILITIES)
const prog = z.enum(['good', 'avg', 'poor'])
const saveProg = z.enum(['good', 'poor'])

const abilityFields = Object.fromEntries(ABILITIES.flatMap(a =>
  ['base', 'enh', 'misc', 'temp', 'damage', 'drain'].map(p => [`${a}_${p}`, int.min(-99).max(99)])))
const saveFields = Object.fromEntries(['fort', 'ref', 'will'].flatMap(s =>
  ['magic', 'misc', 'temp'].map(p => [`${s}_${p}`, int])))

export const characterFields = z.object({
  name: z.string().max(200),
  player: text(200), race_id: text(60), race_name: text(200),
  alignment: z.enum(ALIGNMENTS).nullable(), deity: text(200), gender: z.enum(GENDERS).nullable(),
  age: text(40), height: text(40), weight: text(40), eyes: text(60), hair: text(60), skin: text(60),
  languages: text(1000),
  size: z.enum(SIZE_IDS), speed_ft: int.min(0).max(1000), xp: int.min(0),
  personality: text(5000), flaw: text(500), background: text(100000),
  cp: int, sp: int, gp: int, pp: int,
  hp_max: int, hp_current: int, hp_temp: int.min(0), nonlethal: int.min(0),
  ...abilityFields,
  ac_armor: int, ac_shield: int, ac_natural: int, ac_deflection: int, ac_dodge: int, ac_misc: int, ac_temp: int,
  ac_override: intN,
  ...saveFields,
  init_misc: int, grapple_misc: int, melee_misc: int, ranged_misc: int, bab_override: intN,
  sr: int.min(0), dr: text(200),
}).partial().strict()

const classFields = {
  class_id: z.enum(CLASS_IDS), custom_name: text(200), level: int.min(0).max(40),
  hd: intN, bab_prog: prog.nullable(), fort_prog: saveProg.nullable(), ref_prog: saveProg.nullable(),
  will_prog: saveProg.nullable(), caster_ability: ability.nullable(), domains: text(500),
  advances_id: intN, advance_levels: intN,
}

export const createCharacter = characterFields.extend({
  classes: z.array(z.object(classFields).partial().required({ class_id: true, level: true }).strict()).max(20).default([]),
}).strict()

/**
 * Coleções filhas de um personagem: rota /api/characters/:id/<nome>.
 *   table: tabela SQL; fields: schema dos campos editáveis; required: obrigatórios na criação
 *   owned: colunas que referenciam outra tabela do MESMO personagem (verificadas na escrita)
 */
export const COLLECTIONS = {
  classes: { table: 'character_classes', fields: classFields, required: ['class_id'],
    owned: { advances_id: 'character_classes' } },
  skills: { table: 'skills', required: ['skill_id'], fields: {
    skill_id: z.string().max(40), custom_name: text(200), ability: ability.nullable(),
    ranks: num.min(0).max(80), class_skill: bool01N, misc: int } },
  attacks: { table: 'attacks', fields: {
    name: z.string().max(200), kind: z.enum(['melee', 'ranged']), ability: ability.nullable(),
    enh: int, misc: int, damage_dice: text(60), damage_ability: ability.nullable(), damage_mult: num.min(0).max(3).nullable(),
    damage_misc: int, crit_range: int.min(2).max(20), crit_mult: int.min(1).max(6), range_ft: intN,
    damage_type: text(60), ammo: intN, notes: text(5000) } },
  items: { table: 'items', fields: {
    location: z.string().max(40), icon: text(16), name: z.string().max(200), qty: num.min(0), weight_lb: num.min(0),
    cost_gp: num.min(0).nullable(), notes: text(5000),
    ac_type: z.enum(['armor', 'shield', 'natural', 'deflection', 'dodge', 'misc']).nullable(),
    ac_bonus: intN, max_dex: intN, acp: intN, spell_failure: intN } },
  feats: { table: 'feats', fields: {
    ref_id: text(80), kind: z.enum(['feat', 'flaw', 'trait', 'feature']), name: z.string().max(200),
    description: text(10000) } },
  resources: { table: 'class_resources', owned: { class_row_id: 'character_classes' }, fields: {
    key: text(60), class_row_id: intN, name: text(200), icon: text(16), kind: z.enum(['uses', 'pool']),
    total_override: intN, pool_used: int.min(0), notes: text(5000) } },
  spells: { table: 'spells', owned: { class_row_id: 'character_classes' }, fields: {
    class_row_id: intN, level: int.min(0).max(9), name: z.string().max(200), school: text(60),
    description: text(10000), builtin_key: text(200), is_domain: bool01 } },
  prepared: { table: 'spells_prepared', required: ['spell_id'],
    owned: { spell_id: 'spells', class_row_id: 'character_classes' }, fields: {
      spell_id: int, class_row_id: intN, level: int.min(0).max(9), is_domain: bool01, used: bool01 } },
  summons: { table: 'summons', fields: {
    name: z.string().max(200), ref_creature_id: text(80), data: text(20000), hp_current: int, hp_max: int,
    spell_level: intN, rounds_left: intN } },
  players: { table: 'players', fields: { name: z.string().max(200), class: text(200), race: text(200), notes: text(10000) } },
  npcs: { table: 'npcs', fields: { name: z.string().max(200), gender: text(40), occupation: text(200), notes: text(20000) } },
  places: { table: 'places', fields: { name: z.string().max(200), notes: text(20000) } },
  quests: { table: 'quests', owned: { place_id: 'places' }, fields: {
    name: z.string().max(200), place_id: intN, kind: z.enum(['main', 'side']), status: z.enum(['open', 'done', 'failed']),
    reward: text(2000), notes: text(20000), npc_ids: z.array(int).max(200) } },
  notes: { table: 'notes', fields: { title: z.string().max(300), content: text(500000), session_date: text(20) } },
}

for (const c of Object.values(COLLECTIONS)) {
  c.fields.position = int.min(0)
  c.patch = z.object(c.fields).partial().strict()
  const shape = z.object(c.fields).partial()
  c.create = (c.required?.length ? shape.required(Object.fromEntries(c.required.map(k => [k, true]))) : shape).strict()
}

export const slotPatch = z.object({ bonus: int.min(-20).max(20), used: int.min(0).max(50) }).partial().strict()
export const usePatch = z.object({ used: bool01, note: text(1000) }).partial().strict()
export const restBody = z.object({ heal: z.boolean().default(false) }).strict()
export const preparedReplace = z.object({
  class_row_id: int,
  slots: z.array(z.object({ spell_id: int, level: int.min(0).max(9), is_domain: bool01.default(0), used: bool01.default(0) }).strict()).max(200),
}).strict()
