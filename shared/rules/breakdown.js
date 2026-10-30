import { SIZES } from '../constants/sizes.js'
import { SAVE_ABILITY } from '../constants/abilities.js'
import { babFor, classDef } from './progression.js'

/**
 * Composição dos valores derivados (o "de onde vem esse número" da UI).
 * Cada lista é [{ key, value, ref? }]: `key` é o id da parcela (a UI traduz em breakdown.parts.<key>),
 * `ref` dá contexto (atributo, id da linha de classe, nome do item). A soma das parcelas é igual ao total
 * calculado pelas funções de combat.js/skills.js (há teste). Só exibição: nada aqui muda regra.
 */
const n = v => Number(v) || 0

export function sheetBreakdown(ch, { classes, abilities, effects, bab, babOverridden, ac, saves, skills }) {
  const size = SIZES[ch.size ?? 'medium'] ?? SIZES.medium
  const feat = v => n(v)

  const babParts = classes.map(row => ({ key: 'class', value: babFor(classDef(row).bab, n(row.level)), ref: row.id }))

  const attackRoll = (abilityId, misc, featBonus) => [
    { key: 'bab', value: bab },
    { key: 'ability', value: abilities[abilityId].mod, ref: abilityId },
    { key: 'size', value: size.mod },
    { key: 'misc', value: n(misc) },
    { key: 'feats', value: feat(featBonus) },
  ]

  const out = {
    bab: babParts,
    babOverridden,
    initiative: [
      { key: 'ability', value: abilities.dex.mod, ref: 'dex' },
      { key: 'misc', value: n(ch.init_misc) },
      { key: 'feats', value: feat(effects?.initiative) },
    ],
    grapple: [
      { key: 'bab', value: bab },
      { key: 'ability', value: abilities.str.mod, ref: 'str' },
      { key: 'sizeGrapple', value: size.grapple },
      { key: 'misc', value: n(ch.grapple_misc) },
      { key: 'feats', value: feat(effects?.grapple) },
    ],
    melee: attackRoll('str', ch.melee_misc, effects?.attack?.melee),
    ranged: attackRoll('dex', ch.ranged_misc, effects?.attack?.ranged),
    ac: [
      { key: 'base', value: 10 },
      ...['armor', 'shield', 'dex', 'size', 'natural', 'deflection', 'dodge', 'misc'].map(k => ({ key: `ac_${k}`, value: ac.parts[k] })),
    ],
    saves: {},
    attacks: {},
    skills: {},
  }

  for (const s of ['fort', 'ref', 'will']) {
    const sv = saves[s]
    out.saves[s] = [
      { key: 'base', value: sv.base },
      { key: 'ability', value: sv.ability, ref: SAVE_ABILITY[s] },
      { key: 'magic', value: sv.magic },
      { key: 'misc', value: n(ch[`${s}_misc`]) },
      { key: 'temp', value: n(ch[`${s}_temp`]) },
      { key: 'feats', value: feat(effects?.saves?.[s]) },
      { key: 'divineGrace', value: sv.grace ?? 0 },
    ]
  }

  for (const a of ch.attacks ?? []) {
    const abilityId = a.ability ?? (a.kind === 'ranged' ? 'dex' : 'str')
    const kind = a.kind === 'ranged' ? 'ranged' : 'melee'
    out.attacks[a.id] = [
      { key: 'bab', value: bab },
      { key: 'ability', value: abilities[abilityId]?.mod ?? 0, ref: abilityId },
      { key: 'size', value: size.mod },
      { key: 'enh', value: n(a.enh) },
      { key: 'misc', value: n(a.misc) },
      { key: 'feats', value: feat(effects?.attack?.[kind]) },
    ]
  }

  for (const sk of skills) {
    const row = (ch.skills ?? []).find(r => r.id === sk.id)
    out.skills[sk.id] = [
      { key: 'ranks', value: sk.ranks },
      { key: 'ability', value: sk.ability, ref: sk.abilityId },
      { key: 'misc', value: n(row?.misc) },
      { key: 'feats', value: sk.misc - n(row?.misc) },
      { key: 'synergy', value: sk.synergy },
      { key: 'size', value: sk.size },
      { key: 'acp', value: -sk.acp },
    ]
  }
  return out
}

export const sumParts = parts => parts.reduce((a, p) => a + p.value, 0)
