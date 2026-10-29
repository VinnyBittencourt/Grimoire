import { ABILITIES } from '../constants/abilities.js'

const n = v => Number(v) || 0

// Valor do atributo = base + melhoria + outros + temporário − dano − dreno
export function abilityScore(c, ab) {
  const base = c[`${ab}_base`] ?? 10
  return n(base) + n(c[`${ab}_enh`]) + n(c[`${ab}_misc`]) + n(c[`${ab}_temp`])
    - n(c[`${ab}_damage`]) - n(c[`${ab}_drain`])
}

export function abilityMod(score) {
  return Math.floor((score - 10) / 2)
}

export function computeAbilities(c) {
  const out = {}
  for (const ab of ABILITIES) {
    const score = abilityScore(c, ab)
    out[ab] = { score, mod: abilityMod(score) }
  }
  return out
}
