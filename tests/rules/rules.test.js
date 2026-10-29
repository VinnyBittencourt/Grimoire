import { describe, it, expect } from 'vitest'
import { abilityMod, abilityScore } from '../../shared/rules/abilities.js'
import { baseAttackBonus, baseSaves, iterativeAttacks } from '../../shared/rules/progression.js'
import { bonusSpells, castingFor, effectiveCasterLevels } from '../../shared/rules/spellcasting.js'
import { resourceTotal, defaultResourcesFor } from '../../shared/rules/resources.js'
import { heavyLoad, loadLimits, carriedWeight, loadStatus } from '../../shared/rules/encumbrance.js'
import { maxRanks, skillTotal, skillPointsAvailable } from '../../shared/rules/skills.js'
import { aggregateEffects } from '../../shared/rules/effects.js'
import { suggestedMaxHp, hpStatus } from '../../shared/rules/hp.js'
import { computeSheet } from '../../shared/rules/sheet.js'

const cls = (class_id, level, extra = {}) => ({ id: `${class_id}-${level}`, class_id, level, ...extra })
const scores = (o = {}) => ({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10, ...o })
const abil = o => Object.fromEntries(Object.entries(scores(o)).map(([k, v]) => [k, { score: v, mod: abilityMod(v) }]))

describe('atributos', () => {
  it('modificador', () => {
    expect(abilityMod(10)).toBe(0)
    expect(abilityMod(11)).toBe(0)
    expect(abilityMod(9)).toBe(-1)
    expect(abilityMod(18)).toBe(4)
    expect(abilityMod(21)).toBe(5)
    expect(abilityMod(1)).toBe(-5)
  })
  it('valor soma componentes e subtrai dano/dreno', () => {
    expect(abilityScore({ str_base: 14, str_enh: 4, str_temp: 2, str_damage: 3 }, 'str')).toBe(17)
    expect(abilityScore({}, 'dex')).toBe(10)
  })
})

describe('BAB e saves (multiclasse soma por classe)', () => {
  it('Clérigo 3 / Guerreiro 2', () => {
    const classes = [cls('cleric', 3), cls('fighter', 2)]
    expect(baseAttackBonus(classes)).toBe(4)
    expect(baseSaves(classes)).toEqual({ fort: 6, ref: 1, will: 3 })
  })
  it('progressões', () => {
    expect(baseAttackBonus([cls('wizard', 20)])).toBe(10)
    expect(baseAttackBonus([cls('rogue', 20)])).toBe(15)
    expect(baseSaves([cls('monk', 1)])).toEqual({ fort: 2, ref: 2, will: 2 })
  })
  it('ataques iterativos', () => {
    expect(iterativeAttacks(6)).toEqual([6, 1])
    expect(iterativeAttacks(5)).toEqual([5])
    expect(iterativeAttacks(16)).toEqual([16, 11, 6, 1])
    expect(iterativeAttacks(20)).toEqual([20, 15, 10, 5])
    expect(iterativeAttacks(6, 9)).toEqual([9, 4])
  })
})

describe('conjuração', () => {
  it('magias bônus (PHB tabela 1-1)', () => {
    expect([1, 2, 3, 4].map(l => bonusSpells(4, l))).toEqual([1, 1, 1, 1])
    expect([1, 2, 3, 4, 5].map(l => bonusSpells(5, l))).toEqual([2, 1, 1, 1, 1])
    expect(bonusSpells(5, 0)).toBe(0)
    expect(bonusSpells(2, 3)).toBe(0)
  })

  it('Clérigo 5, Sab 16: tabela + bônus + slot de domínio + CD', () => {
    const c = castingFor(cls('cleric', 5), 5, scores({ wis: 16 }))
    expect(c.perDay.slice(0, 5)).toEqual([5, 4, 3, 2, null])
    expect(c.domain.slice(0, 5)).toEqual([0, 1, 1, 1, 0])
    expect(c.dc[1]).toBe(14)
    expect(c.maxLevel).toBe(3)
  })

  it('atributo baixo impede o nível de magia (Clérigo 5, Sab 12)', () => {
    const c = castingFor(cls('cleric', 5), 5, scores({ wis: 12 }))
    expect(c.perDay.slice(0, 4)).toEqual([5, 4, 2, 0])
    expect(c.domain[3]).toBe(0)
  })

  it('Dynamic Priest: Clérigo 3 usando Car 21 (Bonar)', () => {
    const c = castingFor(cls('cleric', 3, { caster_ability: 'cha' }), 3, scores({ cha: 21, wis: 10 }))
    expect(c.ability).toBe('cha')
    expect(c.perDay.slice(0, 4)).toEqual([4, 4, 2, null])
    expect(c.domain.slice(0, 3)).toEqual([0, 1, 1])
  })

  it('Paladino: nada até o 4º, só bônus no 4º, meio nível de conjurador', () => {
    expect(castingFor(cls('paladin', 3), 3, scores({ wis: 14 })).maxLevel).toBe(-1)
    const p4 = castingFor(cls('paladin', 4), 4, scores({ wis: 12 }))
    expect(p4.perDay.slice(0, 2)).toEqual([null, 1])
    expect(p4.casterLevel).toBe(2)
    expect(castingFor(cls('paladin', 4), 4, scores({ wis: 11 })).perDay[1]).toBe(0)
    const p14 = castingFor(cls('paladin', 14), 14, scores({ wis: 14 }))
    expect(p14.perDay.slice(0, 5)).toEqual([null, 3, 2, 1, 0])
  })

  it('Ranger 8 e 10 (PHB)', () => {
    expect(castingFor(cls('ranger', 8), 8, scores({ wis: 13 })).perDay.slice(1, 3)).toEqual([2, 0])
    expect(castingFor(cls('ranger', 10), 10, scores({ wis: 12 })).perDay.slice(1, 3)).toEqual([2, 1])
  })

  it('Bardo 16 tem magias de 6º nível e é espontâneo', () => {
    const b = castingFor(cls('bard', 16), 16, scores({ cha: 16 }))
    expect(b.type).toBe('spontaneous')
    expect(b.perDay.slice(0, 8)).toEqual([4, 5, 5, 4, 3, 2, 0, null])
    expect(b.known.slice(0, 7)).toEqual([6, 5, 4, 4, 4, 4, 2])
  })

  it('Feiticeiro 4: por dia e conhecidas', () => {
    const s = castingFor(cls('sorcerer', 4), 4, scores({ cha: 12 }))
    expect(s.perDay.slice(0, 3)).toEqual([6, 7, 3])
    // Car 10 não alcança o 1º nível (precisa de 11)
    expect(castingFor(cls('sorcerer', 4), 4, scores({ cha: 10 })).perDay[1]).toBe(0)
    expect(s.known.slice(0, 3)).toEqual([6, 3, 1])
  })

  it('multiclasse usa o nível da própria classe, não o total', () => {
    const sheet = computeSheet({
      wis_base: 14,
      classes: [cls('cleric', 3, { position: 0 }), cls('fighter', 2, { position: 1 })],
    })
    expect(sheet.casting).toHaveLength(1)
    expect(sheet.casting[0].level).toBe(3)
    expect(sheet.casting[0].perDay.slice(0, 4)).toEqual([4, 3, 2, null])
  })

  it('classe de prestígio avança o nível de conjuração', () => {
    const wiz = cls('wizard', 5)
    const theurge = cls('mystic_theurge', 2, { advances_id: wiz.id })
    expect(effectiveCasterLevels([wiz, theurge])[wiz.id]).toBe(7)
  })

  it('bônus manual de slots soma onde há acesso', () => {
    const c = castingFor(cls('cleric', 1), 1, scores({ wis: 12 }), [{ level: 1, bonus: 1, used: 0 }])
    expect(c.perDay.slice(0, 3)).toEqual([3, 3, null])
  })
})

describe('recursos de classe', () => {
  const ctx = (o = {}) => ({ abilities: abil(o), effects: { resources: {}, turning: 0 } })
  const total = (key, class_id, level, o) => {
    const row = cls(class_id, level)
    return resourceTotal({ key, class_row_id: row.id }, [row], ctx(o))
  }
  it('Fúria 1 + ⌊n/4⌋', () => {
    expect(total('rage', 'barbarian', 3)).toBe(1)
    expect(total('rage', 'barbarian', 4)).toBe(2)
    expect(total('rage', 'barbarian', 20)).toBe(6)
  })
  it('Expulsar Mortos-Vivos = 3 + Car', () => {
    expect(total('turnundead', 'cleric', 1, { cha: 21 })).toBe(8)
    expect(total('turnundead', 'cleric', 1, { cha: 6 })).toBe(1)
  })
  it('Cura pelas Mãos é reserva Car × nível', () => {
    expect(total('layonhands', 'paladin', 5, { cha: 14 })).toBe(10)
    expect(total('layonhands', 'paladin', 1, { cha: 14 })).toBe(0)
  })
  it('Forma Selvagem por nível de druida', () => {
    expect([4, 5, 6, 7, 10, 14, 18].map(n => total('wildshape', 'druid', n))).toEqual([0, 1, 2, 3, 4, 5, 6])
  })
  it('override manual vence a fórmula', () => {
    expect(resourceTotal({ key: 'rage', total_override: 9 }, [cls('barbarian', 1)], ctx())).toBe(9)
  })
  it('recursos padrão respeitam nível mínimo', () => {
    expect(defaultResourcesFor([cls('paladin', 3)]).map(r => r.key).sort()).toEqual(['layonhands', 'smite'])
    expect(defaultResourcesFor([cls('paladin', 4)]).map(r => r.key)).toContain('turnundead_paladin')
  })
})

describe('carga', () => {
  it('tabela 9-1', () => {
    expect(loadLimits(10)).toEqual({ light: 33, medium: 66, heavy: 100 })
    expect(loadLimits(11)).toEqual({ light: 38, medium: 76, heavy: 115 })
    expect(heavyLoad(30)).toBe(1600)
    expect(loadLimits(10, 'small').heavy).toBe(75)
  })
  it('peso carregado inclui moedas (50 = 1 lb)', () => {
    expect(carriedWeight([{ weight_lb: 30, qty: 1 }, { weight_lb: 1, qty: 3 }], { gp: 100 })).toBe(35)
    expect(loadStatus(40, loadLimits(10))).toBe('medium')
  })
})

describe('perícias', () => {
  it('graduações máximas', () => {
    expect(maxRanks(3, true)).toBe(6)
    expect(maxRanks(3, false)).toBe(3)
  })
  it('total com penalidade de armadura (Natação dobrada), sinergia e talento', () => {
    const ctx = { abilities: abil({ str: 14 }), effects: { skills: { swim: 2 } }, acp: 3, size: 'medium', ranksById: {} }
    expect(skillTotal({ skill_id: 'swim', ranks: 4 }, ctx).total).toBe(4 + 2 + 2 - 6)
    const ctx2 = { abilities: abil({ cha: 12 }), effects: {}, acp: 0, ranksById: { bluff: 5 } }
    expect(skillTotal({ skill_id: 'diplomacy', ranks: 1 }, ctx2).total).toBe(1 + 1 + 2)
  })
  it('perícia só treinada sem graduação fica bloqueada', () => {
    const ctx = { abilities: abil(), effects: {}, acp: 0, ranksById: {} }
    expect(skillTotal({ skill_id: 'tumble', ranks: 0 }, ctx).untrainedBlocked).toBe(true)
  })
  it('pontos de perícia: ×4 no 1º nível, humano +1/nível', () => {
    expect(skillPointsAvailable([cls('rogue', 1)], 0, false)).toBe(32)
    expect(skillPointsAvailable([cls('fighter', 2)], 1, true)).toBe(16 + 4)
    expect(skillPointsAvailable([cls('wizard', 1)], -3, false)).toBe(4)
  })
})

describe('efeitos de talentos', () => {
  const ref = new Map([
    ['phb_great_fortitude', { id: 'phb_great_fortitude', efeitos: [{ tipo: 'bonus_save', alvo: 'fortitude', valor: 2 }] }],
    ['phb_toughness', { id: 'phb_toughness', efeitos: [{ tipo: 'bonus_hp', alvo: '', valor: 3 }] }],
    ['flaw_frail', { id: 'flaw_frail', efeitos: [{ tipo: 'bonus_hp', alvo: '', valor: -1, nota: '-1 PV por nível de personagem' }] }],
    ['phb_alertness', { id: 'phb_alertness', efeitos: [{ tipo: 'bonus_skill', alvo: 'Ouvir', valor: 2 }, { tipo: 'bonus_skill', alvo: 'Procurar (armadilhas)', valor: 2 }] }],
  ])
  it('não empilha talento repetido, exceto os repetíveis', () => {
    const fx = aggregateEffects([{ ref_id: 'phb_great_fortitude' }, { ref_id: 'phb_great_fortitude' }, { ref_id: 'phb_toughness' }, { ref_id: 'phb_toughness' }], ref)
    expect(fx.saves.fort).toBe(2)
    expect(fx.hp).toBe(6)
  })
  it('PV por nível e alvos situacionais viram nota', () => {
    const fx = aggregateEffects([{ ref_id: 'flaw_frail' }, { ref_id: 'phb_alertness' }], ref, 5)
    expect(fx.hp).toBe(-5)
    expect(fx.skills.listen).toBe(2)
    expect(fx.notes).toHaveLength(1)
  })
  it('talentos customizados (sem ref_id) são ignorados', () => {
    expect(aggregateEffects([{ name: 'Homebrew' }], ref).hp).toBe(0)
  })
})

describe('PV', () => {
  it('sugestão: dado cheio no 1º, média arredondada para cima depois', () => {
    expect(suggestedMaxHp([cls('fighter', 1)], 2)).toBe(12)
    expect(suggestedMaxHp([cls('fighter', 2)], 2)).toBe(20)
    expect(suggestedMaxHp([cls('cleric', 3)], 2)).toBe(10 + 7 + 7)
    expect(suggestedMaxHp([cls('wizard', 2)], -3)).toBe(1 + 1)
  })
  it('estados', () => {
    expect(hpStatus({ hp_current: 0 })).toBe('disabled')
    expect(hpStatus({ hp_current: -3 })).toBe('dying')
    expect(hpStatus({ hp_current: -10 })).toBe('dead')
    expect(hpStatus({ hp_current: 5, nonlethal: 5 })).toBe('staggered')
    expect(hpStatus({ hp_current: 5, nonlethal: 7 })).toBe('unconscious')
    expect(hpStatus({ hp_current: 5 })).toBe('ok')
  })
})

describe('computeSheet: Bonar Telanophe (dados reais do v1)', () => {
  const bonar = {
    str_base: 12, dex_base: 18, con_base: 14, int_base: 10, wis_base: 10, cha_base: 21,
    size: 'medium', hp_max: 24, hp_current: 24, race_id: 'humano',
    classes: [cls('cleric', 3, { caster_ability: 'cha', position: 0 })],
    items: [{ location: 'armor', name: 'Breastplate', ac_type: 'armor', ac_bonus: 5, max_dex: 3, acp: 4, weight_lb: 30, qty: 1 }],
    skills: [{ id: 1, skill_id: 'concentration', ranks: 6 }, { id: 2, skill_id: 'swim', ranks: 0 }],
    resources: [{ id: 1, key: 'turnundead', class_row_id: 'cleric-3' }],
  }
  const s = computeSheet(bonar)
  it('CA 18 (igual à ficha v1): Des limitada a +3 pelo peitoral', () => {
    expect(s.ac.total).toBe(18)
    expect(s.ac.touch).toBe(13)
    expect(s.ac.flatFooted).toBe(15)
  })
  it('combate e saves', () => {
    expect(s.bab.total).toBe(2)
    expect(s.initiative).toBe(4)
    expect(s.grapple).toBe(3)
    expect(s.saves.fort.total).toBe(3 + 2)
    expect(s.saves.ref.total).toBe(1 + 4)
    expect(s.saves.will.total).toBe(3 + 0)
  })
  it('perícias com penalidade de armadura', () => {
    expect(s.skills.find(k => k.id === 1).total).toBe(8)
    expect(s.skills.find(k => k.id === 2).total).toBe(1 - 8)
    expect(s.skills.find(k => k.id === 1).classSkill).toBe(true)
  })
  it('recursos e magias', () => {
    expect(s.resources[0].total).toBe(8)
    expect(s.casting[0].perDay.slice(0, 3)).toEqual([4, 4, 2])
  })
})
