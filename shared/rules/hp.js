import { classDef } from './progression.js'

/**
 * PV máximos sugeridos: dado cheio no 1º nível (primeira classe da lista), média arredondada
 * para cima (hd/2 + 1) nos demais, + mod. Con por nível (mín. 1 PV por nível), + talentos.
 * O valor guardado em characters.hp_max continua sendo o do jogador (dados rolados).
 */
export function suggestedMaxHp(classes, conMod, bonusHp = 0) {
  let total = 0
  let first = true
  for (const row of classes) {
    const hd = classDef(row).hd
    for (let i = 0; i < (Number(row.level) || 0); i++) {
      const roll = first ? hd : hd / 2 + 1
      total += Math.max(1, roll + conMod)
      first = false
    }
  }
  return total + bonusHp
}

// Estado de saúde (PHB p. 145): incapacitado em 0, morrendo de −1 a −9, morto em −10
export function hpStatus(c) {
  const hp = Number(c.hp_current) || 0
  const nonlethal = Number(c.nonlethal) || 0
  if (hp <= -10) return 'dead'
  if (hp < 0) return 'dying'
  if (hp === 0) return 'disabled'
  if (nonlethal >= hp) return nonlethal === hp ? 'staggered' : 'unconscious'
  return 'ok'
}
