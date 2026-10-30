import { SKILL_BY_ID, SYNERGIES } from '../constants/skills.js'
import { SIZES } from '../constants/sizes.js'
import { CLASSES } from '../constants/classes.js'

const n = v => Number(v) || 0

export function maxRanks(level, classSkill) {
  return classSkill ? level + 3 : (level + 3) / 2
}

// Perícias de classe padrão vindas das classes do personagem (o jogador pode marcar outras)
export function defaultClassSkills(classes) {
  const set = new Set()
  for (const row of classes) for (const s of CLASSES[row.class_id]?.skills ?? []) set.add(s)
  return set
}

/**
 * Total de uma perícia (linha da tabela skills).
 * ctx: { abilities, effects, acp, size, ranksById }
 */
export function skillTotal(row, ctx) {
  const def = SKILL_BY_ID[row.skill_id] ?? { ability: row.ability ?? 'int' }
  const abilityId = row.ability ?? def.ability
  const ability = ctx.abilities[abilityId]?.mod ?? 0
  const ranks = n(row.ranks)
  const acp = def.acp ? def.acp * ctx.acp : 0
  const size = def.size ? (SIZES[ctx.size ?? 'medium']?.hide ?? 0) : 0
  const feat = ctx.effects?.skills?.[row.skill_id] ?? 0
  const synergy = SYNERGIES
    .filter(([from, to]) => to === row.skill_id && (ctx.ranksById?.[from] ?? 0) >= 5)
    .length * 2
  const total = ranks + ability + n(row.misc) + feat + synergy + size - acp
  return {
    total,
    ranks,
    ability,
    abilityId,
    misc: n(row.misc) + feat,
    synergy,
    acp,
    size,
    untrainedBlocked: def.trained && ranks <= 0,
  }
}

/**
 * intMod: use o modificador do Int BASE (sem melhoria, temporário, dano ou dreno). Pelo PHB ("Changing Ability
 * Scores"), aumentar a Int não dá pontos retroativos para os níveis anteriores; como a ficha não guarda o histórico,
 * o Grimoire assume o Int base desde o 1º nível e deixa um ajuste manual (characters.skill_points_adjust) para os
 * aumentos posteriores (interpretação do Grimoire).
 * Pontos de perícia disponíveis (PHB p. 62): por nível de classe (sp + mod. Int, mín. 1),
 * ×4 no 1º nível de personagem (primeira classe da lista); humanos +1 por nível e +4 no 1º.
 */
export function skillPointsAvailable(classes, intMod, isHuman) {
  let total = 0
  let first = true
  for (const row of classes) {
    const sp = CLASSES[row.class_id]?.sp ?? 2
    for (let i = 0; i < (Number(row.level) || 0); i++) {
      const perLevel = Math.max(1, sp + intMod) + (isHuman ? 1 : 0)
      total += first ? perLevel * 4 : perLevel
      first = false
    }
  }
  return total
}

export function skillPointsSpent(skillRows, classSkillSet) {
  return skillRows.reduce((acc, row) => {
    const isClass = row.class_skill ?? classSkillSet.has(row.skill_id)
    return acc + n(row.ranks) * (isClass ? 1 : 2)
  }, 0)
}
