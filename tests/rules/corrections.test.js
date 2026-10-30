// Correções de regras da fase 2 da auditoria (2026-10-29). Fonte de cada caso no comentário.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { SPELLS_PER_DAY } from '../../shared/constants/spellTables.js'
import { CLASSES } from '../../shared/constants/classes.js'
import { SKILL_FROM_PT } from '../../shared/constants/skills.js'
import { castingFor } from '../../shared/rules/spellcasting.js'
import { skillTotal } from '../../shared/rules/skills.js'
import { aggregateEffects } from '../../shared/rules/effects.js'
import { abilityMod } from '../../shared/rules/abilities.js'
import { openDatabase } from '../../server/db.js'

const json = p => JSON.parse(readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8'))
const feats = json('src/db/featsData.json')
const allFeats = [...feats.talentos, ...feats.falhas]
const scores = (o = {}) => ({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10, ...o })
const abil = o => Object.fromEntries(Object.entries(scores(o)).map(([k, v]) => [k, { score: v, mod: abilityMod(v) }]))
const base = row => row.filter(v => v != null)

describe('Mago: tabela própria (PHB tabela 3-18)', () => {
  const W = SPELLS_PER_DAY.wizard
  it('usa a tabela wizard, não a do Clérigo', () => {
    expect(CLASSES.wizard.caster.table).toBe('wizard')
  })
  it('linhas do PHB: níveis 1, 4, 11 e 20', () => {
    expect(base(W[0])).toEqual([3, 1])
    expect(base(W[3])).toEqual([4, 3, 2])
    expect(base(W[10])).toEqual([4, 4, 4, 4, 3, 2, 1])
    expect(base(W[19])).toEqual([4, 4, 4, 4, 4, 4, 4, 4, 4, 4])
  })
  it('nunca passa de 4 por nível de magia e ganha nível novo nos ímpares', () => {
    for (const row of W) for (const v of row) if (v != null) expect(v).toBeLessThanOrEqual(4)
    W.forEach((row, i) => expect(base(row).length - 1).toBe(Math.min(9, Math.ceil((i + 1) / 2))))
  })
  it('Clérigo continua com a tabela 3-6 (nível 4: 5/3/2)', () => {
    expect(base(SPELLS_PER_DAY.full[3])).toEqual([5, 3, 2])
  })
  it('Mago 4 com Int 15: 4 / 3+1 / 2+1', () => {
    const c = castingFor({ id: 1, class_id: 'wizard', level: 4 }, 4, scores({ int: 15 }))
    expect(c.perDay.slice(0, 3)).toEqual([4, 4, 3])
    expect(c.domain.every(d => d === 0)).toBe(true)
  })
})

describe('sinergias: só as incondicionais (PHB tabela 4-5)', () => {
  const total = (skill_id, ranksById) =>
    skillTotal({ skill_id, ranks: 0 }, { abilities: abil(), effects: {}, acp: 0, ranksById }).synergy
  it('Sobrevivência 5 → +2 Conhecimento (natureza)', () => {
    expect(total('knownature', { survival: 5 })).toBe(2)
  })
  it('sinergias situacionais não entram no total', () => {
    expect(total('userope', { escapeartist: 5 })).toBe(0) // só para amarras
    expect(total('climb', { userope: 5 })).toBe(0) // só escalando com corda
    expect(total('usemagicdevice', { decipherscript: 5, spellcraft: 5 })).toBe(0) // só pergaminhos
  })
  it('as incondicionais continuam', () => {
    expect(total('tumble', { jump: 5 })).toBe(2)
    expect(total('diplomacy', { bluff: 5, knownobility: 5, sensemotive: 5 })).toBe(6)
  })
})

describe('dados de talentos de perícia', () => {
  const ref = new Map(allFeats.map(f => [f.id, f]))
  const skillsOf = id => aggregateEffects([{ ref_id: id }], ref).skills
  it('PHB/SRD: Mãos Hábeis, Dedos Ágeis, Aptidão Mágica, Negociador', () => {
    expect(skillsOf('phb_deft_hands')).toEqual({ sleightofhand: 2, userope: 2 })
    expect(skillsOf('phb_nimble_fingers')).toEqual({ disabledevice: 2, openlock: 2 })
    expect(skillsOf('phb_magical_aptitude')).toEqual({ spellcraft: 2, usemagicdevice: 2 })
    expect(skillsOf('phb_negotiator')).toEqual({ diplomacy: 2, sensemotive: 2 })
  })
  it('todo bonus_skill tem perícia mapeada ou é situacional (alvo com parênteses)', () => {
    const lost = []
    for (const f of allFeats) {
      for (const e of f.efeitos ?? []) {
        if (e.tipo === 'bonus_skill' && !SKILL_FROM_PT[e.alvo] && !/\(.+\)/.test(e.alvo)) lost.push(`${f.id}: ${e.alvo}`)
      }
    }
    expect(lost).toEqual([])
  })
  it('bonus_resource sem fórmula no app vira nota em vez de sumir', () => {
    const r = new Map([
      ['x', { id: 'x', efeitos: [{ tipo: 'bonus_resource', alvo: 'Sopro Dracônico', valor: 1 }] }],
      ['y', { id: 'y', efeitos: [{ tipo: 'bonus_resource', alvo: 'Fúria', valor: 1 }] }],
    ])
    const fx = aggregateEffects([{ ref_id: 'x' }, { ref_id: 'y' }], r)
    expect(fx.resources).toEqual({ rage: 1 })
    expect(fx.notes).toEqual([{ feat: 'x', text: '+1 Sopro Dracônico' }])
  })
})

describe('magias padrão', () => {
  it('Curar/Infligir Ferimento Menor causam 1 PV (SRD: Cure Minor Wounds)', () => {
    const spells = json('src/data/builtinSpells.json')
    const minor = Object.values(spells).flatMap(c => c['0'] ?? []).filter(s => /Ferimento Menor/.test(s.name))
    expect(minor.length).toBeGreaterThan(0)
    for (const s of minor) expect(s.description).toMatch(/^(Cura|Toque causa) 1 PV/)
  })
})

describe('ref_classes: DV/BBA/saves vêm de shared/constants/classes.js', () => {
  it('seed copia a mecânica do motor (fonte única)', async () => {
    const { db } = await openDatabase(null)
    const rows = db.prepare('SELECT id, dado_vida, bab, saves FROM ref_classes').all()
    db.close()
    expect(rows.length).toBeGreaterThan(30)
    for (const r of rows) {
      const def = CLASSES[r.id]
      expect(def, r.id).toBeTruthy()
      expect([r.id, r.dado_vida, r.bab, JSON.parse(r.saves)]).toEqual([r.id, def.hd, def.bab, def.saves])
    }
  })
  it('classes de suplemento ficam marcadas como não verificadas', () => {
    for (const id of ['swashbuckler', 'artificer', 'scout', 'duskblade']) expect(CLASSES[id].verified).toBe(false)
    expect(CLASSES.wizard.verified).toBeUndefined()
  })
})
