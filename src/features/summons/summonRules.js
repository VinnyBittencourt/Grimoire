import { abilityMod } from '../../../shared/rules/abilities.js'

const ROMAN = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9 }
export const ROMAN_NUMERALS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX']

// "Convocar Monstro III" / "Summon Monster III" → 3 (null se não for convocação)
export function summonLevel(name) {
  const m = /(?:convocar monstro|summon monster)\s+([IVX]+)/i.exec(name ?? '')
  return m ? ROMAN[m[1].toUpperCase()] ?? null : null
}

// "4d8" (ou "4d8+8") → PV médios: média do dado arredondada para baixo + mod. de Con por DV
export function averageHp(pv, conScore) {
  const m = /(\d+)d(\d+)/.exec(String(pv ?? ''))
  if (!m) return Number(pv) || 1
  const [n, d] = [Number(m[1]), Number(m[2])]
  return Math.max(1, Math.floor((n * (d + 1)) / 2) + n * abilityMod(conScore ?? 10))
}
