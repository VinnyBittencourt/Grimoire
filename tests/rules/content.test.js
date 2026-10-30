// Rastreabilidade do conteúdo de referência (fase 6): fonte, licença e criaturas de Convocar Monstro.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { RACAS, CLASSES, CRIATURAS } from '../../src/db/referenceData.js'
import { PUBLICATIONS, SOURCE_TYPES, LICENSES, sourceFor } from '../../src/db/publications.js'
import { CLASSES as CLASS_RULES } from '../../shared/constants/classes.js'
import { openDatabase } from '../../server/db.js'

const feats = JSON.parse(readFileSync(new URL('../../src/db/featsData.json', import.meta.url), 'utf8'))
const all = [...feats.talentos, ...feats.falhas, ...RACAS, ...CLASSES, ...CRIATURAS]

// Tabela de Summon Monster do SRD 3.5 (spells-s), só as criaturas que o Grimoire tem
const SRD_SUMMON_MONSTER = {
  celestial_dog: 1, fiendish_rat_dire: 1, celestial_owl: 1, fiendish_centipede_medium: 1,
  celestial_eagle: 2, fiendish_wolf: 2, lemure: 2, fiendish_spider_medium: 2,
  celestial_bear_black: 3, dretch: 3, fiendish_ape: 3,
  lantern_archon: 4, fiendish_dire_wolf: 4, celestial_lion: 4, howler: 4,
  hound_archon: 5, celestial_brown_bear: 5, bearded_devil: 5,
  elemental_medium_fire: 5, elemental_medium_water: 5, elemental_medium_earth: 5, elemental_medium_air: 5,
  elemental_large_fire: 6, chaos_beast: 6, fiendish_rhinoceros: 6,
  osyluth: 7, celestial_elephant: 7,
  vrock: 8, elemental_greater_fire: 8,
  hezrou: 9, hamatula: 9, elemental_elder_fire: 9,
}

describe('catálogo de publicações', () => {
  it('todo livro citado nos dados está no catálogo', () => {
    const missing = [...new Set(all.map(r => r.livro))].filter(l => !PUBLICATIONS[l])
    expect(missing).toEqual([])
    for (const id of Object.values(CLASS_RULES).map(c => c.book).filter(Boolean)) expect(PUBLICATIONS[id], id).toBeTruthy()
  })
  it('nenhuma página inventada e enums válidos', () => {
    for (const r of all) {
      const f = sourceFor(r)
      expect(f.pagina).toBeNull()
      expect(SOURCE_TYPES).toContain(f.tipo)
      expect(LICENSES).toContain(f.licenca)
    }
  })
  it('só o que consta no SRD fica com licença srd; incerto fica needs_review', () => {
    expect(sourceFor({ livro: 'PHB', srd: true }).licenca).toBe('srd')
    expect(sourceFor({ livro: 'Complete Warrior' }).licenca).toBe('proprietario')
    expect(sourceFor({ livro: 'Unearthed Arcana' }).licenca).toBe('needs_review')
    expect(sourceFor({ livro: 'Livro Inexistente' })).toMatchObject({ tipo: 'homebrew', licenca: 'needs_review' })
    expect(feats.talentos.filter(f => f.livro === 'PHB').every(f => f.srd)).toBe(true)
  })
})

describe('Convocar Monstro (SRD 3.5)', () => {
  const summonable = CRIATURAS.filter(c => c.nivel_sm > 0)
  it('a lista e os níveis batem com a tabela do SRD', () => {
    expect(Object.fromEntries(summonable.map(c => [c.id, c.nivel_sm]))).toEqual(SRD_SUMMON_MONSTER)
  })
  it('elemental Médio é Convocar Monstro V (não IV)', () => {
    for (const c of summonable.filter(x => x.id.startsWith('elemental_medium'))) expect(c.nivel_sm).toBe(5)
  })
  it('toda criatura convocável tem números conferidos', () => {
    for (const c of summonable) expect(sourceFor(c), c.id).toMatchObject({ verificado: true, srd: true, licenca: 'srd' })
  })
  it('casos do SRD: cão 1d8+2, diabo barbado 6d8+18/CA 19, lemure sem Int', () => {
    const by = id => CRIATURAS.find(c => c.id === id)
    expect(by('celestial_dog')).toMatchObject({ pv: '1d8+2', ca: 15, int_val: 3 }) // modelo: Int mínimo 3
    expect(by('bearded_devil')).toMatchObject({ pv: '6d8+18', ca: 19, nivel_sm: 5 })
    expect(by('lemure').int_val).toBeNull()
  })
  it('criaturas fora da tabela do SRD saem da lista, mas os dados ficam', () => {
    for (const id of ['xorn_minor', 'astral_deva', 'glabrezu', 'treant']) {
      expect(CRIATURAS.find(c => c.id === id)?.nivel_sm, id).toBe(0)
    }
  })
})

describe('seed grava a fonte (migração 003)', () => {
  it('toda linha de referência tem fonte JSON e a API devolve parseado', async () => {
    const { db } = await openDatabase(null)
    expect(db.pragma('user_version', { simple: true })).toBeGreaterThanOrEqual(3)
    for (const t of ['ref_talentos', 'ref_falhas', 'ref_racas', 'ref_classes', 'ref_criaturas']) {
      expect(db.prepare(`SELECT count(*) n FROM ${t} WHERE fonte IS NULL`).get().n, t).toBe(0)
    }
    const wizard = JSON.parse(db.prepare("SELECT fonte FROM ref_classes WHERE id = 'wizard'").get().fonte)
    expect(wizard).toMatchObject({ livro: 'PHB', srd: true, licenca: 'srd' })
    const duelist = db.prepare("SELECT livro FROM ref_classes WHERE id = 'duelist'").get()
    expect(duelist.livro).toBe('DMG')
    db.close()
  })
})
