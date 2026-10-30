// CA com empilhamento, ataques e agarrar (fase 5). Regra: bônus do mesmo tipo não se somam
// (vale o maior); esquiva e bônus sem tipo somam; penalidades sempre se aplicam (PHB 3.5).
import { describe, it, expect } from 'vitest'
import { equipmentStats, armorClass, stackBonuses, grapple, attackTotal, damageBonus } from '../../shared/rules/combat.js'
import { aggregateEffects } from '../../shared/rules/effects.js'
import { computeSheet } from '../../shared/rules/sheet.js'
import { abilityMod } from '../../shared/rules/abilities.js'

const abil = (o = {}) => Object.fromEntries(Object.entries({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10, ...o })
  .map(([k, v]) => [k, { score: v, mod: abilityMod(v) }]))
const item = (name, ac_type, ac_bonus, extra = {}) => ({ name, ac_type, ac_bonus, location: 'neck', ...extra })
const ac = (c, items, a = abil()) => armorClass(c, a, equipmentStats(items))

describe('stackBonuses', () => {
  it('max: só o maior positivo; penalidades somam', () => {
    expect(stackBonuses('max', 2, [{ name: 'Anel', value: 3 }, { name: 'X', value: -1 }]).value).toBe(2)
    expect(stackBonuses('max', 0, []).value).toBe(0)
  })
  it('base+max: base manual soma com o maior item', () => {
    expect(stackBonuses('base+max', 3, [{ name: 'Amuleto', value: 2 }, { name: 'Casca', value: 4 }]).value).toBe(7)
  })
  it('sum: tudo soma', () => {
    expect(stackBonuses('sum', 1, [{ name: 'a', value: 1 }, { name: 'b', value: 2 }]).value).toBe(4)
  })
})

describe('armorClass com empilhamento', () => {
  it('dois bônus de deflexão: vale o maior, também no toque', () => {
    // Anel de Proteção +2 equipado + Escudo da Fé +3 no campo manual
    const r = ac({ ac_deflection: 3 }, [item('Anel de Proteção', 'deflection', 2, { location: 'ring1' })])
    expect(r.parts.deflection).toBe(3)
    expect(r.computed).toBe(13)
    expect(r.touch).toBe(13)
    expect(r.ignored).toEqual([{ type: 'deflection', name: 'Anel de Proteção', value: 2 }])
  })

  it('armadura do item e Armadura Arcana (manual) não somam', () => {
    const r = ac({ ac_armor: 4 }, [item('Camisão de Cota', 'armor', 4, { location: 'armor', max_dex: 4 })], abil({ dex: 14 }))
    expect(r.parts.armor).toBe(4)
    expect(r.computed).toBe(10 + 4 + 2)
    expect(r.flatFooted).toBe(14)
    // empate: conta uma vez só; fica a primeira fonte (o campo manual) e o item aparece como ignorado
    expect(r.ignored).toEqual([{ type: 'armor', name: 'Camisão de Cota', value: 4 }])
  })

  it('natural: armadura natural racial (manual) + maior melhoria de item', () => {
    const r = ac({ ac_natural: 2 }, [item('Amuleto de Armadura Natural', 'natural', 1), item('Casca de Árvore', 'natural', 3, { location: 'other' })])
    expect(r.parts.natural).toBe(5)
    expect(r.ignored).toEqual([{ type: 'natural', name: 'Amuleto de Armadura Natural', value: 1 }])
  })

  it('esquiva e outros somam; temporário entra em outros', () => {
    const r = ac({ ac_dodge: 1, ac_misc: 1, ac_temp: 2 }, [item('Botas', 'dodge', 1, { location: 'feet' }), item('Manto', 'misc', 1)])
    expect(r.parts.dodge).toBe(2)
    expect(r.parts.misc).toBe(4)
    expect(r.computed).toBe(16)
    expect(r.flatFooted).toBe(14) // perde esquiva
    expect(r.ignored).toEqual([])
  })

  it('itens na mochila não contam; override só troca o total', () => {
    const r = ac({ ac_override: 20 }, [item('Anel guardado', 'deflection', 5, { location: 'backpack' })])
    expect(r.computed).toBe(10)
    expect(r.total).toBe(20)
  })

  it('penalidade do mesmo tipo é aplicada mesmo com bônus maior', () => {
    const r = ac({ ac_shield: 2 }, [item('Escudo amaldiçoado', 'shield', -1, { location: 'offhand' })])
    expect(r.parts.shield).toBe(1)
  })
})

describe('efeitos de talentos em ataque e agarrar', () => {
  const ref = new Map([
    ['flaw_shaky', { id: 'flaw_shaky', efeitos: [{ tipo: 'bonus_attack', alvo: 'ranged', valor: -2 }] }],
    ['phb_point_blank_shot', { id: 'phb_point_blank_shot', efeitos: [{ tipo: 'bonus_attack', alvo: 'ranged_close', valor: 1 }, { tipo: 'bonus_damage', alvo: 'ranged_close', valor: 1 }] }],
    ['phb_improved_grapple', { id: 'phb_improved_grapple', efeitos: [{ tipo: 'bonus_grapple', alvo: '', valor: 4 }] }],
  ])
  const fx = aggregateEffects([{ ref_id: 'flaw_shaky' }, { ref_id: 'phb_point_blank_shot' }, { ref_id: 'phb_improved_grapple' }], ref)

  it('incondicional entra; situacional (Tiro Certeiro, 9 m) vira nota', () => {
    expect(fx.attack).toEqual({ ranged: -2 })
    expect(fx.damage).toEqual({})
    expect(fx.notes.map(x => x.text)).toEqual(['+1 ataque (ranged_close)', '+1 dano (ranged_close)'])
  })

  it('o efeito vale para cada arma do tipo certo', () => {
    const a = abil({ dex: 14, str: 12 })
    expect(attackTotal({ kind: 'ranged' }, 3, a, {}, fx)).toBe(3 + 2 - 2)
    expect(attackTotal({ kind: 'melee' }, 3, a, {}, fx)).toBe(3 + 1)
    expect(damageBonus({ kind: 'melee', damage_ability: 'str' }, a, fx)).toBe(1)
  })

  it('Agarrar Aprimorado: +4 no agarrar (SRD)', () => {
    expect(grapple({ size: 'medium' }, 2, abil({ str: 14 }), fx)).toBe(2 + 2 + 4)
    expect(grapple({ size: 'small' }, 2, abil({ str: 14 }))).toBe(2 + 2 - 4)
  })

  it('computeSheet passa os efeitos para ataques e agarrar', () => {
    const s = computeSheet({
      str_base: 10, dex_base: 10, classes: [{ id: 1, class_id: 'fighter', level: 1 }],
      feats: [{ ref_id: 'flaw_shaky' }, { ref_id: 'phb_improved_grapple' }],
      attacks: [{ id: 9, name: 'Arco', kind: 'ranged' }], items: [], skills: [],
    }, ref)
    expect(s.attacks[0].total).toBe(1 - 2)
    expect(s.grapple).toBe(1 + 4)
  })
})
