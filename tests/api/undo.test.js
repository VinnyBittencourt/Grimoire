// "Desfazer exclusão" recria a linha com UNDO_FIELDS: todos precisam passar no zod .strict() da coleção.
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { openDatabase } from '../../server/db.js'
import { createApp } from '../../server/app.js'
import { COLLECTIONS } from '../../server/schemas.js'
import { UNDO_FIELDS, snapshotFor } from '../../src/queries/undo.js'

let db, api, cid
beforeAll(async () => {
  ({ db } = await openDatabase(null))
  api = request(createApp({ db, dataDir: null }))
  cid = (await api.post('/api/characters').send({ name: 'Teste', classes: [{ class_id: 'fighter', level: 1 }] })).body.id
})
afterAll(() => db.close())

describe('undo de exclusão', () => {
  it('UNDO_FIELDS só tem campos aceitos pela whitelist de cada coleção', () => {
    for (const [col, fields] of Object.entries(UNDO_FIELDS)) {
      const allowed = Object.keys(COLLECTIONS[col].fields)
      for (const f of fields) expect(allowed, `${col}.${f}`).toContain(f)
    }
  })

  it('a linha completa vinda da API, filtrada pelo snapshot, é recriada sem erro', async () => {
    const samples = {
      attacks: { name: 'Espada', kind: 'melee', damage_dice: '1d8', range_ft: 30, ammo: 5, notes: 'x' },
      items: { name: 'Corda', qty: 2, weight_lb: 10, location: 'backpack', ac_type: 'armor', ac_bonus: 1 },
      feats: { name: 'Esquiva', kind: 'feat', description: 'd' },
      skills: { skill_id: 'custom_x', custom_name: 'Navegação', ability: 'int', ranks: 2 },
      summons: { name: 'Lobo', hp_current: 3, hp_max: 13, spell_level: 2, data: '{}' },
      players: { name: 'Ana', class: 'Mago' },
      places: { name: 'Cripta', notes: 'n' },
      notes: { title: 'Sessão', content: '<p>a</p>', session_date: '2026-10-29' },
    }
    for (const [col, body] of Object.entries(samples)) {
      const row = (await api.post(`/api/characters/${cid}/${col}`).send(body)).body
      await api.delete(`/api/characters/${cid}/${col}/${row.id}`).expect(204)
      const res = await api.post(`/api/characters/${cid}/${col}`).send(snapshotFor(col, row))
      expect(res.status, `${col}: ${JSON.stringify(res.body)}`).toBe(201)
      for (const [k, v] of Object.entries(body)) expect(res.body[k], `${col}.${k}`).toEqual(v)
    }
  })
})
