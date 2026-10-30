// Três regras apontadas no teste com fichas da comunidade (docs/testes/RELATORIO_FICHAS_COMUNIDADE.md, R1–R3):
// Graça Divina (SRD, Paladin), efeitos da carga (SRD, Carrying Loads / Reduced Speed / Lifting and Dragging)
// e pontos de perícia sem retroativo (PHB, "Changing Ability Scores").
import { describe, it, expect } from 'vitest'
import { computeSheet } from '../../shared/rules/sheet.js'
import { reducedSpeed, speedWithLoad } from '../../shared/rules/encumbrance.js'
import { sumParts } from '../../shared/rules/breakdown.js'

const cls = (class_id, level, id = 1) => ({ id, class_id, level, position: id })

describe('Graça Divina (paladino 2+: bônus de Car nos saves)', () => {
  const pal = (level, cha, extra = []) => computeSheet({ con_base: 16, wis_base: 13, cha_base: cha, classes: [cls('paladin', level), ...extra] })

  it('caso do Jogador 4: Paladino 6, Car 14 → Fort/Ref/Von 10/4/5 (SRD)', () => {
    const s = pal(6, 14)
    expect([s.saves.fort.total, s.saves.ref.total, s.saves.will.total]).toEqual([10, 4, 5])
    expect(s.saves.fort.grace).toBe(2)
    expect(sumParts(s.breakdown.saves.fort)).toBe(10)
  })
  it('nível 1 não tem; Car negativo não tira nada ("bonus, if any")', () => {
    expect(pal(1, 14).saves.fort.grace).toBe(0)
    expect(pal(4, 8).saves.will.grace).toBe(0)
  })
  it('multiclasse: conta o nível de paladino, uma vez só', () => {
    const s = pal(2, 16, [cls('fighter', 3, 2)])
    expect(s.saves.ref.grace).toBe(3)
    expect(computeSheet({ cha_base: 16, classes: [cls('fighter', 5)] }).saves.ref.grace).toBe(0)
  })
})

describe('efeitos da carga', () => {
  it('tabela Reduced Speed do SRD', () => {
    expect([20, 30, 40, 50, 60, 70, 80, 90, 100].map(reducedSpeed)).toEqual([15, 20, 30, 35, 40, 50, 55, 60, 70])
  })
  it('anão não perde deslocamento com carga média/pesada; acima da pesada, 5 ft para todos', () => {
    expect(speedWithLoad(20, 'heavy', { ignoresLoad: true })).toBe(20)
    expect(speedWithLoad(30, 'medium')).toBe(20)
    expect(speedWithLoad(30, 'light')).toBe(30)
    expect(speedWithLoad(20, 'over', { ignoresLoad: true })).toBe(5)
  })

  // Halfling do Jogador 3: For 10 Pequeno (limites 25/50/75), Des 21, camisão de mitral (Des máx. 6, sem penalidade)
  const halfling = gold => computeSheet({
    size: 'small', speed_ft: 20, str_base: 10, dex_base: 21, gp: gold,
    classes: [cls('rogue', 5)],
    items: [{ name: 'Camisão de mitral', location: 'armor', ac_type: 'armor', ac_bonus: 5, max_dex: 6, acp: 0, weight_lb: 6.25, qty: 1 }],
    skills: [{ id: 1, skill_id: 'hide', ranks: 5 }],
  })

  it('carga média: Des máx. +3, penalidade −3 e deslocamento 20 → 15', () => {
    const light = halfling(0)
    const medium = halfling(1000) // +20 lb em moedas → 26,25 lb
    expect(light.load.status).toBe('light')
    expect(medium.load.status).toBe('medium')
    expect(light.ac.parts.dex).toBe(5)
    expect(medium.ac.parts.dex).toBe(3)
    expect(medium.skills[0].acp).toBe(3)
    expect(medium.skills[0].total).toBe(light.skills[0].total - 3)
    expect(medium.speed).toEqual({ base: 20, current: 15, reduced: true })
  })

  it('com armadura vale o pior de cada um, sem somar (placas: Des máx. 1, −6, mesmo com carga média)', () => {
    const s = computeSheet({
      str_base: 10, dex_base: 14, gp: 2500,
      classes: [cls('fighter', 1)],
      items: [{ name: 'Placas', location: 'armor', ac_type: 'armor', ac_bonus: 8, max_dex: 1, acp: 6, weight_lb: 0, qty: 1 }],
      skills: [{ id: 1, skill_id: 'climb', ranks: 0 }],
    })
    expect(s.load.status).toBe('medium')
    expect(s.ac.parts.dex).toBe(1)
    expect(s.skills[0].acp).toBe(6)
  })

  it('acima da pesada: perde o bônus de Des na CA e anda 5 ft', () => {
    const s = halfling(5000) // +100 lb
    expect(s.load.status).toBe('over')
    expect(s.ac.parts.dex).toBe(0)
    expect(s.speed.current).toBe(5)
  })
})

describe('pontos de perícia sem retroativo', () => {
  it('caso do Jogador 1: Mago 7 humano, Int base 17 + Tiara +2 → 60, não 70', () => {
    const s = computeSheet({ race_id: 'humano', int_base: 17, int_enh: 2, classes: [cls('wizard', 7)] })
    expect(s.abilities.int.mod).toBe(4)
    expect(s.skillPoints).toMatchObject({ fromLevels: 60, adjust: 0, available: 60 })
  })
  it('o ajuste manual cobre aumentos de Int depois do 1º nível', () => {
    const s = computeSheet({ race_id: 'humano', int_base: 17, skill_points_adjust: 3, classes: [cls('wizard', 7)] })
    expect(s.skillPoints.available).toBe(63)
  })
  it('dano e dreno temporários de Int não tiram pontos já ganhos', () => {
    const base = computeSheet({ int_base: 14, classes: [cls('rogue', 3)] }).skillPoints.available
    expect(computeSheet({ int_base: 14, int_damage: 6, classes: [cls('rogue', 3)] }).skillPoints.available).toBe(base)
  })
})
