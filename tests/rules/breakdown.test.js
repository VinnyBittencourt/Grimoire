// Composição dos valores (sheet.breakdown): a soma das parcelas tem que bater com o total do motor.
import { describe, it, expect } from 'vitest'
import { computeSheet } from '../../shared/rules/sheet.js'
import { sumParts } from '../../shared/rules/breakdown.js'
import { applyDamage, applyHealing } from '../../shared/rules/hp.js'

const base = {
  str_base: 14, dex_base: 16, con_base: 12, int_base: 10, wis_base: 13, cha_base: 8,
  size: 'small', init_misc: 2, grapple_misc: 1, melee_misc: -1, ranged_misc: 1,
  fort_misc: 1, ref_temp: 2, will_magic: 1, ac_natural: 1, ac_misc: 1, ac_temp: 2, ac_deflection: 1,
  classes: [{ id: 1, class_id: 'fighter', level: 3, position: 0 }, { id: 2, class_id: 'wizard', level: 2, position: 1 }],
  items: [
    { name: 'Cota', location: 'armor', ac_type: 'armor', ac_bonus: 5, max_dex: 2, acp: 5 },
    { name: 'Anel', location: 'ring1', ac_type: 'deflection', ac_bonus: 2 },
  ],
  attacks: [{ id: 7, name: 'Espada', kind: 'melee', enh: 1, misc: 2 }, { id: 8, name: 'Arco', kind: 'ranged', ability: 'dex' }],
  skills: [
    { id: 11, skill_id: 'swim', ranks: 2, misc: 1 },
    { id: 12, skill_id: 'hide', ranks: 3 },
    { id: 13, skill_id: 'tumble', ranks: 5 },
    { id: 14, skill_id: 'balance', ranks: 0 },
  ],
}

describe('sheet.breakdown', () => {
  const s = computeSheet(base)
  const b = s.breakdown

  it('CA: 10 + parcelas = calculado (Des limitada pela armadura, misc inclui temp)', () => {
    expect(sumParts(b.ac)).toBe(s.ac.computed)
    expect(b.ac.find(p => p.key === 'ac_dex').value).toBe(2)
    expect(b.ac.find(p => p.key === 'ac_misc').value).toBe(3)
  })

  it('saves, iniciativa, agarrar, corpo a corpo e distância fecham a conta', () => {
    for (const k of ['fort', 'ref', 'will']) expect(sumParts(b.saves[k])).toBe(s.saves[k].total)
    expect(sumParts(b.initiative)).toBe(s.initiative)
    expect(sumParts(b.grapple)).toBe(s.grapple)
    expect(sumParts(b.melee)).toBe(s.attack.melee)
    expect(sumParts(b.ranged)).toBe(s.attack.ranged)
  })

  it('BBA multiclasse: uma parcela por classe somando o total (PHB p. 59)', () => {
    expect(b.bab.map(p => p.value)).toEqual([3, 1])
    expect(sumParts(b.bab)).toBe(s.bab.computed)
  })

  it('cada ataque e cada perícia fecham a conta (Natação ×2 de armadura, sinergia de Acrobacia)', () => {
    for (const a of s.attacks) expect(sumParts(b.attacks[a.id])).toBe(a.total)
    for (const sk of s.skills) expect(sumParts(b.skills[sk.id])).toBe(sk.total)
    expect(b.skills[11].find(p => p.key === 'acp').value).toBe(-10)
    expect(b.skills[14].find(p => p.key === 'synergy').value).toBe(2)
  })

  it('com BBA manual, as parcelas por classe continuam as calculadas e o override fica marcado', () => {
    const o = computeSheet({ ...base, bab_override: 9 })
    expect(o.breakdown.babOverridden).toBe(true)
    expect(sumParts(o.breakdown.bab)).toBe(o.bab.computed)
    expect(sumParts(o.breakdown.melee)).toBe(o.attack.melee)
  })
})

describe('dano e cura (PHB: PV temporários primeiro; cura remove não letal)', () => {
  it('dano consome PV temporários antes dos normais', () => {
    expect(applyDamage({ hp_current: 10, hp_temp: 3 }, 5)).toEqual({ patch: { hp_temp: 0, hp_current: 8 }, absorbed: 3 })
    expect(applyDamage({ hp_current: 10, hp_temp: 0 }, 4).patch).toEqual({ hp_temp: 0, hp_current: 6 })
  })
  it('dano não letal só soma em nonlethal; zero ou inválido não muda nada', () => {
    expect(applyDamage({ nonlethal: 2 }, 3, { nonlethal: true }).patch).toEqual({ nonlethal: 5 })
    expect(applyDamage({ hp_current: 5 }, 0).patch).toEqual({})
    expect(applyDamage({ hp_current: 5 }, 'x').patch).toEqual({})
  })
  it('cura não passa do máximo e tira dano não letal', () => {
    expect(applyHealing({ hp_current: 3, hp_max: 10, nonlethal: 4 }, 9)).toEqual({ hp_current: 10, nonlethal: 0 })
    expect(applyHealing({ hp_current: 12, hp_max: 10, nonlethal: 0 }, 2)).toEqual({ hp_current: 12, nonlethal: 0 })
    expect(applyHealing({ hp_current: -3, hp_max: 10 }, 5)).toEqual({ hp_current: 2, nonlethal: 0 })
  })
})
