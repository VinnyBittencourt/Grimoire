import { computeAbilities } from './abilities.js'
import { characterLevel, baseAttackBonus, iterativeAttacks, classDef } from './progression.js'
import { aggregateEffects } from './effects.js'
import { equipmentStats, armorClass, savingThrows, initiative, grapple, attackBonuses, attackTotal, damageBonus } from './combat.js'
import { skillTotal, maxRanks, defaultClassSkills, skillPointsAvailable, skillPointsSpent } from './skills.js'
import { castingFor, effectiveCasterLevels } from './spellcasting.js'
import { resourceTotal } from './resources.js'
import { loadLimits, carriedWeight, loadStatus } from './encumbrance.js'
import { suggestedMaxHp, hpStatus } from './hp.js'

/**
 * Calcula todos os valores derivados da ficha a partir do agregado do personagem
 * (GET /api/characters/:id) e dos talentos de referência (Map ref_id → ref_talentos/ref_falhas).
 * Função pura: mesma entrada → mesma saída. Usada no front e nos testes.
 */
export function computeSheet(ch, refFeats = new Map()) {
  const classes = [...(ch.classes ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
  const level = characterLevel(classes)
  const abilities = computeAbilities(ch)
  const scores = Object.fromEntries(Object.entries(abilities).map(([k, v]) => [k, v.score]))
  const effects = aggregateEffects(ch.feats ?? [], refFeats, level)
  const equip = equipmentStats(ch.items ?? [])

  const computedBab = baseAttackBonus(classes)
  const hasBabOverride = ch.bab_override != null && ch.bab_override !== ''
  const bab = hasBabOverride ? Number(ch.bab_override) : computedBab
  const attacks = attackBonuses(ch, bab, abilities, effects)

  // Conjuração: talentos de slot extra vão para a primeira classe conjuradora
  const casterLevels = effectiveCasterLevels(classes)
  const slotRows = ch.spell_slots ?? []
  let featSlotsGiven = false
  const casting = []
  for (const row of classes) {
    if (!classDef(row).caster) continue
    const featSlots = featSlotsGiven ? null : effects.slots
    featSlotsGiven = true
    casting.push(castingFor(row, casterLevels[row.id], scores, slotRows.filter(s => s.class_row_id === row.id), featSlots))
  }

  // Perícias
  const classSkillSet = defaultClassSkills(classes)
  const ranksById = {}
  for (const s of ch.skills ?? []) ranksById[s.skill_id] = (ranksById[s.skill_id] ?? 0) + (Number(s.ranks) || 0)
  const skillCtx = { abilities, effects, acp: equip.acp, size: ch.size, ranksById }
  const skills = (ch.skills ?? []).map(row => {
    const isClass = row.class_skill == null ? classSkillSet.has(row.skill_id) : Boolean(row.class_skill)
    return { ...skillTotal(row, skillCtx), id: row.id, classSkill: isClass, maxRanks: maxRanks(level, isClass) }
  })

  const resourceCtx = { abilities, effects }
  const resources = (ch.resources ?? []).map(r => ({ id: r.id, total: resourceTotal(r, classes, resourceCtx) }))

  const limits = loadLimits(abilities.str.score, ch.size ?? 'medium')
  const weight = carriedWeight(ch.items ?? [], ch)

  return {
    level,
    abilities,
    effects,
    equipment: equip,
    bab: { total: bab, computed: computedBab, overridden: hasBabOverride, iterative: iterativeAttacks(bab) },
    attack: { ...attacks, meleeIterative: iterativeAttacks(bab, attacks.melee), rangedIterative: iterativeAttacks(bab, attacks.ranged) },
    attacks: (ch.attacks ?? []).map(a => {
      const total = attackTotal(a, bab, abilities, ch)
      return { id: a.id, total, iterative: iterativeAttacks(bab, total), damage: damageBonus(a, abilities) }
    }),
    grapple: grapple(ch, bab, abilities),
    initiative: initiative(ch, abilities, effects),
    ac: armorClass(ch, abilities, equip),
    saves: savingThrows(ch, classes, abilities, effects),
    hp: {
      max: Number(ch.hp_max) || 0,
      suggestedMax: suggestedMaxHp(classes, abilities.con.mod, effects.hp),
      status: hpStatus(ch),
    },
    skills,
    skillPoints: {
      available: skillPointsAvailable(classes, abilities.int.mod, ch.race_id === 'humano'),
      spent: skillPointsSpent(ch.skills ?? [], classSkillSet),
    },
    casting,
    resources,
    load: { ...limits, weight, status: loadStatus(weight, limits) },
  }
}
