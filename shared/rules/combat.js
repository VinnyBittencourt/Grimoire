import { SIZES } from '../constants/sizes.js'
import { SAVES, SAVE_ABILITY } from '../constants/abilities.js'
import { baseSaves } from './progression.js'

const n = v => Number(v) || 0

export const isEquipped = item => item.location && item.location !== 'backpack'

// Contribuições dos itens equipados para CA, Des máxima, penalidade e falha arcana
export function equipmentStats(items = []) {
  const out = { armor: 0, shield: 0, natural: 0, deflection: 0, dodge: 0, misc: 0, maxDex: null, acp: 0, spellFailure: 0 }
  for (const it of items) {
    if (!isEquipped(it)) continue
    if (it.ac_type && it.ac_type in out) out[it.ac_type] += n(it.ac_bonus)
    if (it.max_dex != null && it.max_dex !== '') {
      out.maxDex = out.maxDex == null ? n(it.max_dex) : Math.min(out.maxDex, n(it.max_dex))
    }
    out.acp += Math.abs(n(it.acp))
    out.spellFailure += n(it.spell_failure)
  }
  return out
}

/**
 * CA total, toque e surpresa (PHB p. 136).
 * Bônus do mesmo tipo de itens e de campos manuais somam (a ficha não aplica a regra de
 * não-empilhamento; o jogador ajusta pelo campo manual se precisar).
 */
export function armorClass(c, abilities, equip) {
  const size = SIZES[c.size ?? 'medium']?.mod ?? 0
  const dexRaw = abilities.dex.mod
  const dex = equip.maxDex == null ? dexRaw : Math.min(dexRaw, equip.maxDex)
  const parts = {
    armor: n(c.ac_armor) + equip.armor,
    shield: n(c.ac_shield) + equip.shield,
    dex,
    size,
    natural: n(c.ac_natural) + equip.natural,
    deflection: n(c.ac_deflection) + equip.deflection,
    dodge: n(c.ac_dodge) + equip.dodge,
    misc: n(c.ac_misc) + equip.misc + n(c.ac_temp),
  }
  const computed = 10 + Object.values(parts).reduce((a, b) => a + b, 0)
  const touch = 10 + parts.dex + parts.size + parts.deflection + parts.dodge + parts.misc
  const flatFooted = computed - Math.max(parts.dex, 0) - parts.dodge
  const hasOverride = c.ac_override != null && c.ac_override !== ''
  return {
    total: hasOverride ? n(c.ac_override) : computed,
    computed,
    touch,
    flatFooted,
    parts,
    overridden: hasOverride,
  }
}

export function savingThrows(c, classes, abilities, effects) {
  const base = baseSaves(classes)
  const out = {}
  for (const s of SAVES) {
    const ability = abilities[SAVE_ABILITY[s]].mod
    const magic = n(c[`${s}_magic`])
    const misc = n(c[`${s}_misc`]) + n(c[`${s}_temp`]) + (effects?.saves?.[s] ?? 0)
    out[s] = { base: base[s], ability, magic, misc, total: base[s] + ability + magic + misc }
  }
  return out
}

export function initiative(c, abilities, effects) {
  return abilities.dex.mod + n(c.init_misc) + (effects?.initiative ?? 0)
}

export function grapple(c, bab, abilities) {
  const size = SIZES[c.size ?? 'medium']?.grapple ?? 0
  return bab + abilities.str.mod + size + n(c.grapple_misc)
}

export function attackBonuses(c, bab, abilities, effects) {
  const size = SIZES[c.size ?? 'medium']?.mod ?? 0
  return {
    melee: bab + abilities.str.mod + size + n(c.melee_misc) + (effects?.attack?.melee ?? 0),
    ranged: bab + abilities.dex.mod + size + n(c.ranged_misc) + (effects?.attack?.ranged ?? 0),
  }
}

/**
 * Bônus total de um ataque da tabela `attacks`.
 * attack.ability: 'str' | 'dex' | outro atributo; attack.kind: 'melee' | 'ranged'
 */
export function attackTotal(attack, bab, abilities, c) {
  const size = SIZES[c.size ?? 'medium']?.mod ?? 0
  const ability = attack.ability ?? (attack.kind === 'ranged' ? 'dex' : 'str')
  const mod = abilities[ability]?.mod ?? 0
  return bab + mod + size + n(attack.enh) + n(attack.misc)
}

export function damageBonus(attack, abilities) {
  if (!attack.damage_ability) return n(attack.enh) + n(attack.damage_misc)
  const mod = abilities[attack.damage_ability]?.mod ?? 0
  const mult = Number(attack.damage_mult) || 1 // 1.5 para duas mãos, 0.5 para mão inábil
  // Multiplicador vale só para bônus; penalidade de For entra inteira (PHB p. 134)
  const fromAbility = mod < 0 ? mod : Math.floor(mod * mult)
  return fromAbility + n(attack.enh) + n(attack.damage_misc)
}
