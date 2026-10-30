import { SIZES } from '../constants/sizes.js'
import { SAVES, SAVE_ABILITY } from '../constants/abilities.js'
import { baseSaves } from './progression.js'

const n = v => Number(v) || 0

export const isEquipped = item => item.location && item.location !== 'backpack'

export const AC_TYPES = ['armor', 'shield', 'natural', 'deflection', 'dodge', 'misc']

// Contribuições dos itens equipados: bônus de CA por tipo (cada item é uma fonte), Des máxima,
// penalidade e falha arcana. O empilhamento dos bônus é decidido em armorClass.
export function equipmentStats(items = []) {
  const sources = Object.fromEntries(AC_TYPES.map(t => [t, []]))
  const out = { sources, maxDex: null, acp: 0, spellFailure: 0 }
  for (const it of items) {
    if (!isEquipped(it)) continue
    if (it.ac_type && sources[it.ac_type] && n(it.ac_bonus)) sources[it.ac_type].push({ name: it.name, value: n(it.ac_bonus) })
    if (it.max_dex != null && it.max_dex !== '') {
      out.maxDex = out.maxDex == null ? n(it.max_dex) : Math.min(out.maxDex, n(it.max_dex))
    }
    out.acp += Math.abs(n(it.acp))
    out.spellFailure += n(it.spell_failure)
  }
  return out
}

// Empilhamento (regra oficial do PHB 3.5): bônus do mesmo tipo não se somam, vale o maior;
// esquiva e bônus sem tipo (misc) somam. Penalidades (valores negativos) sempre se aplicam.
// Mapeamento dos campos (interpretação do Grimoire, documentada no CLAUDE.md):
//   - armadura, escudo, deflexão: campo manual e cada item são fontes do mesmo tipo → maior;
//   - natural: o campo manual é a armadura natural base (racial) e soma com o MAIOR item
//     (amuleto, casca de árvore = bônus de melhoria na armadura natural, que não somam entre si).
const AC_STACKING = { armor: 'max', shield: 'max', deflection: 'max', natural: 'base+max', dodge: 'sum', misc: 'sum' }

export function stackBonuses(mode, manual, items) {
  const sum = list => list.reduce((a, x) => a + x.value, 0)
  const manualSource = manual ? [{ name: null, value: manual }] : []
  if (mode === 'sum') return { value: sum([...manualSource, ...items]), ignored: [] }
  const pool = mode === 'base+max' ? items : [...manualSource, ...items]
  const fixed = mode === 'base+max' ? manual : 0
  const best = pool.filter(x => x.value > 0).reduce((b, x) => (!b || x.value > b.value ? x : b), null)
  const penalties = pool.filter(x => x.value < 0)
  return { value: fixed + (best?.value ?? 0) + sum(penalties), ignored: pool.filter(x => x.value > 0 && x !== best) }
}

/**
 * CA total, toque e surpresa (PHB p. 136), com a regra de empilhamento acima.
 * `ignored`: bônus que não entraram no total por não empilhar ({ type, name, value }; name null = campo manual).
 */
export function armorClass(c, abilities, equip) {
  const size = SIZES[c.size ?? 'medium']?.mod ?? 0
  const dexRaw = abilities.dex.mod
  const dex = equip.maxDex == null ? dexRaw : Math.min(dexRaw, equip.maxDex)
  const ignored = []
  const typed = {}
  for (const type of AC_TYPES) {
    const manual = n(c[`ac_${type}`]) + (type === 'misc' ? n(c.ac_temp) : 0)
    const r = stackBonuses(AC_STACKING[type], manual, equip.sources?.[type] ?? [])
    typed[type] = r.value
    for (const x of r.ignored) ignored.push({ type, ...x })
  }
  const parts = {
    armor: typed.armor,
    shield: typed.shield,
    dex,
    size,
    natural: typed.natural,
    deflection: typed.deflection,
    dodge: typed.dodge,
    misc: typed.misc,
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
    ignored,
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

export function grapple(c, bab, abilities, effects) {
  const size = SIZES[c.size ?? 'medium']?.grapple ?? 0
  return bab + abilities.str.mod + size + n(c.grapple_misc) + (effects?.grapple ?? 0)
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
// effects.attack/damage só têm 'melee' e 'ranged' (incondicionais); situacionais viram nota
const kindOf = attack => (attack.kind === 'ranged' ? 'ranged' : 'melee')

export function attackTotal(attack, bab, abilities, c, effects) {
  const size = SIZES[c.size ?? 'medium']?.mod ?? 0
  const ability = attack.ability ?? (attack.kind === 'ranged' ? 'dex' : 'str')
  const mod = abilities[ability]?.mod ?? 0
  return bab + mod + size + n(attack.enh) + n(attack.misc) + (effects?.attack?.[kindOf(attack)] ?? 0)
}

export function damageBonus(attack, abilities, effects) {
  const fromFeats = effects?.damage?.[kindOf(attack)] ?? 0
  if (!attack.damage_ability) return n(attack.enh) + n(attack.damage_misc) + fromFeats
  const mod = abilities[attack.damage_ability]?.mod ?? 0
  const mult = Number(attack.damage_mult) || 1 // 1.5 para duas mãos, 0.5 para mão inábil
  // Multiplicador vale só para bônus; penalidade de For entra inteira (PHB p. 134)
  const fromAbility = mod < 0 ? mod : Math.floor(mod * mult)
  return fromAbility + n(attack.enh) + n(attack.damage_misc) + fromFeats
}
