import { SPELLS_PER_DAY, SPELLS_KNOWN } from '../constants/spellTables.js'
import { classDef } from './progression.js'
import { abilityMod } from './abilities.js'

// Magias bônus por atributo alto (PHB tabela 1-1): só níveis 1–9
export function bonusSpells(mod, spellLevel) {
  if (spellLevel === 0 || mod < spellLevel) return 0
  return Math.floor((mod - spellLevel) / 4) + 1
}

/**
 * Nível efetivo de conjuração de cada linha conjuradora: nível da própria classe + níveis de
 * classes de prestígio que apontam para ela (character_classes.advances_id).
 */
export function effectiveCasterLevels(classes) {
  const out = {}
  for (const row of classes) out[row.id] = Number(row.level) || 0
  for (const row of classes) {
    if (row.advances_id && out[row.advances_id] != null) {
      const adv = row.advance_levels ?? row.level
      out[row.advances_id] += Number(adv) || 0
    }
  }
  return out
}

/**
 * Conjuração de uma linha de character_classes.
 * scores: { str: 14, ... } (valores de atributo); slotRows: linhas de spell_slots dessa classe
 * ({ level, bonus, used }); featSlots: array[10] de bônus de talentos (aplicado só na classe
 * marcada como principal, ver computeSheet).
 */
export function castingFor(row, effectiveLevel, scores, slotRows = [], featSlots = null) {
  const def = classDef(row)
  if (!def.caster) return null
  const caster = def.caster
  const abilityId = row.caster_ability ?? caster.ability
  const score = scores[abilityId] ?? 10
  const mod = abilityMod(score)
  const lvl = Math.min(20, Math.max(0, effectiveLevel))

  const bonusByLevel = Array(10).fill(0)
  const usedByLevel = Array(10).fill(0)
  for (const s of slotRows) {
    bonusByLevel[s.level] += Number(s.bonus) || 0
    usedByLevel[s.level] += Number(s.used) || 0
  }

  const tableRow = caster.table && lvl > 0 ? SPELLS_PER_DAY[caster.table][lvl - 1] : null
  const knownRow = caster.known && lvl > 0 ? SPELLS_KNOWN[caster.known][lvl - 1] : null

  const perDay = []
  const domain = []
  const dc = []
  for (let L = 0; L <= 9; L++) {
    dc.push(10 + L + mod)
    const canCastLevel = score >= 10 + L // PHB p. 8
    const manual = bonusByLevel[L] + (featSlots?.[L] ?? 0)

    if (!caster.table) {
      // Classe sem tabela no app: slots totalmente manuais
      perDay.push(manual > 0 ? manual : null)
      domain.push(0)
      continue
    }
    const base = tableRow?.[L] ?? null
    if (base === null) {
      perDay.push(null)
      domain.push(0)
      continue
    }
    if (!canCastLevel) {
      perDay.push(0)
      domain.push(0)
      continue
    }
    perDay.push(base + bonusSpells(mod, L) + manual)
    domain.push(caster.domain && L >= 1 ? 1 : 0)
  }

  const casterLevel = caster.half ? (lvl >= 4 ? Math.floor(lvl / 2) : 0) : lvl
  const maxLevel = perDay.reduce((m, v, i) => (v != null && (v > 0 || domain[i] > 0) ? i : m), -1)

  return {
    rowId: row.id,
    classId: row.class_id,
    type: caster.type,
    list: caster.list,
    ability: abilityId,
    score,
    mod,
    level: lvl,
    casterLevel,
    perDay,
    domain,
    known: knownRow,
    used: usedByLevel,
    dc,
    maxLevel,
    manual: !caster.table,
  }
}
