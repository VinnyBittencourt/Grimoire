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

/**
 * Dano letal: consome primeiro os PV temporários (PHB p. 146, como já citado no HpTracker).
 * Dano não letal soma em `nonlethal`. Devolve { patch, absorbed }: `patch` tem só os campos do
 * personagem que mudam (vai direto para o PATCH), `absorbed` é quanto os temporários seguraram.
 */
export function applyDamage(c, amount, { nonlethal = false } = {}) {
  const dmg = Math.max(0, Math.trunc(Number(amount) || 0))
  if (!dmg) return { patch: {}, absorbed: 0 }
  if (nonlethal) return { patch: { nonlethal: (Number(c.nonlethal) || 0) + dmg }, absorbed: 0 }
  const temp = Number(c.hp_temp) || 0
  const absorbed = Math.min(temp, dmg)
  return { patch: { hp_temp: temp - absorbed, hp_current: (Number(c.hp_current) || 0) - (dmg - absorbed) }, absorbed }
}

/**
 * Cura: não passa do máximo (nem reduz quem já está acima dele) e remove a mesma quantidade
 * de dano não letal (regra de dano não letal do PHB). Devolve só os campos que mudam.
 */
export function applyHealing(c, amount) {
  const heal = Math.max(0, Math.trunc(Number(amount) || 0))
  if (!heal) return {}
  const max = Number(c.hp_max) || 0
  const current = Number(c.hp_current) || 0
  return { hp_current: Math.max(current, Math.min(max, current + heal)), nonlethal: Math.max(0, (Number(c.nonlethal) || 0) - heal) }
}
