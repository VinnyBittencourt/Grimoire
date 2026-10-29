// Smoke test de renderização: cada página/aba da ficha renderiza sem erro com dados reais
// (personagem criado pela API num banco em memória, com perícias, magias, itens, diário...).
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import request from 'supertest'
import { openDatabase } from '../../server/db.js'
import { createApp } from '../../server/app.js'
import { LangProvider } from '../../src/i18n'
import { ToastProvider } from '../../src/ui/Toast'
import { keys } from '../../src/queries/characters'
import SheetPage from '../../src/features/sheet/SheetPage'
import CharacterListPage from '../../src/features/characters/CharacterListPage'
import NewCharacterPage from '../../src/features/characters/NewCharacterPage'

let db, api, sheet, journal, refs, list
beforeAll(async () => {
  ({ db } = await openDatabase(null))
  api = request(createApp({ db, dataDir: null }))
  const ch = (await api.post('/api/characters').send({
    name: 'Bonar', cha_base: 21, dex_base: 18, hp_max: 24,
    classes: [{ class_id: 'cleric', level: 3, caster_ability: 'cha', domains: 'Summoner' }, { class_id: 'sorcerer', level: 1 }],
  })).body
  const cleric = ch.classes[0]
  const spell = (await api.post(`/api/characters/${ch.id}/spells`).send({ name: 'Convocar Monstro I', level: 1, class_row_id: cleric.id, school: 'Conjuração' })).body
  await api.put(`/api/characters/${ch.id}/prepared`).send({ class_row_id: cleric.id, slots: [{ spell_id: spell.id, level: 1 }, { spell_id: spell.id, level: 1, is_domain: 1 }] })
  await api.post(`/api/characters/${ch.id}/items`).send({ name: 'Peitoral', location: 'armor', ac_type: 'armor', ac_bonus: 5, max_dex: 3, acp: 4, weight_lb: 30 })
  await api.post(`/api/characters/${ch.id}/items`).send({ name: 'Corda', weight_lb: 10 })
  await api.post(`/api/characters/${ch.id}/attacks`).send({ name: 'Besta', kind: 'ranged', damage_dice: '1d8', range_ft: 80 })
  await api.post(`/api/characters/${ch.id}/feats`).send({ name: 'Dynamic Priest', ref_id: 'dl_dynamic_priest' })
  await api.post(`/api/characters/${ch.id}/summons`).send({ name: 'Cão Celestial', hp_current: 4, hp_max: 6, spell_level: 1, data: '{"ca":15}' })
  const npc = (await api.post(`/api/characters/${ch.id}/npcs`).send({ name: 'Kush' })).body
  await api.post(`/api/characters/${ch.id}/quests`).send({ name: 'Ressuscitar Kush', npc_ids: [npc.id] })
  await api.post(`/api/characters/${ch.id}/notes`).send({ title: 'Sessão 1', content: '<p>Olá</p>', session_date: '2026-06-10' })
  sheet = (await api.get(`/api/characters/${ch.id}`)).body
  journal = (await api.get(`/api/characters/${ch.id}/journal`)).body
  list = (await api.get('/api/characters')).body
  refs = {}
  for (const t of ['ref_talentos', 'ref_falhas', 'ref_racas', 'ref_criaturas']) refs[t] = (await api.get(`/api/ref/${t}`)).body
})
afterAll(() => db.close())

function render(path, element, routePath) {
  const qc = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } })
  qc.setQueryData(keys.sheet(sheet.id), sheet)
  qc.setQueryData(keys.journal(sheet.id), journal)
  qc.setQueryData(keys.list, list)
  for (const [t, rows] of Object.entries(refs)) qc.setQueryData(keys.ref(t), rows)
  return renderToString(
    <QueryClientProvider client={qc}>
      <LangProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={[path]}>
            <Routes><Route path={routePath} element={element} /></Routes>
          </MemoryRouter>
        </ToastProvider>
      </LangProvider>
    </QueryClientProvider>,
  )
}

describe('renderização', () => {
  it('lista de personagens', () => {
    expect(render('/', <CharacterListPage />, '/')).toContain('Bonar')
  })
  it('assistente de criação', () => {
    expect(render('/personagem/novo', <NewCharacterPage />, '/personagem/novo')).toContain('Humano')
  })
  for (const tab of ['core', 'skills', 'feats', 'spells', 'inventory', 'summons', 'journal']) {
    it(`ficha — aba ${tab}`, () => {
      const html = render(`/personagem/${sheet.id}/${tab}`, <SheetPage />, '/personagem/:id/:tab')
      expect(html).toContain('Bonar')
      expect(html).not.toContain('Não foi possível carregar')
    })
  }
  it('aba de magias mostra slot de domínio e atalho de convocação', () => {
    const html = render(`/personagem/${sheet.id}/spells`, <SheetPage />, '/personagem/:id/:tab')
    expect(html).toContain('Convocar Monstro I')
    expect(html).toContain('Domínio')
    expect(html).toContain('Feiticeiro 1')
  })
  it('barra lateral: CA 18 e PV', () => {
    const html = render(`/personagem/${sheet.id}`, <SheetPage />, '/personagem/:id/:tab?')
    expect(html).toMatch(/>18</)
  })
})
