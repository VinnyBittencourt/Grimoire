import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { openDatabase } from '../../server/db.js'
import { createApp } from '../../server/app.js'

let api, db
beforeAll(async () => {
  ({ db } = await openDatabase(null))
  api = request(createApp({ db, dataDir: null }))
})
afterAll(() => db.close())

const attr = (data, name) => data.attribs.find(a => a.name === name)

describe('Roll20 (ficha D&D_3-5)', () => {
  it('exporta atributos com os nomes da ficha', async () => {
    const ch = (await api.post('/api/characters').send({
      name: 'Bonar', size: 'small', alignment: 'ng', str_base: 12, dex_base: 18, cha_base: 21, hp_max: 24,
      gp: 150, xp: 3100, classes: [{ class_id: 'cleric', level: 3, caster_ability: 'cha' }],
    })).body
    const conc = ch.skills.find(s => s.skill_id === 'concentration')
    await api.patch(`/api/characters/${ch.id}/skills/${conc.id}`).send({ ranks: 6 })
    await api.post(`/api/characters/${ch.id}/items`).send({ name: 'Peitoral', location: 'armor', ac_type: 'armor', ac_bonus: 5, max_dex: 3, acp: 4, weight_lb: 30 })
    await api.post(`/api/characters/${ch.id}/attacks`).send({ name: 'Besta Leve', kind: 'ranged', damage_dice: '1d8', crit_range: 19, range_ft: 80 })
    const spell = (await api.post(`/api/characters/${ch.id}/spells`).send({ name: 'Bênção', level: 1, school: 'Encantamento', class_row_id: ch.classes[0].id })).body
    await api.put(`/api/characters/${ch.id}/prepared`).send({ class_row_id: ch.classes[0].id, slots: [{ spell_id: spell.id, level: 1 }] })

    const res = await api.get(`/api/characters/${ch.id}/export/roll20`)
    expect(res.status).toBe(200)
    const data = res.body
    expect(data.name).toBe('Bonar')
    expect(attr(data, 'character_name').current).toBe('Bonar')
    expect(attr(data, 'str-base').current).toBe(12)
    expect(attr(data, 'size').current).toBe('1')
    expect(attr(data, 'alignment').current).toBe('Neutral Good')
    expect(attr(data, 'class1').current).toBe('Cleric')
    expect(attr(data, 'level1').current).toBe(3)
    expect(attr(data, 'hitpoints')).toMatchObject({ current: 24, max: 24 })
    expect(attr(data, 'gold').current).toBe(150)
    expect(attr(data, 'expcurrent').current).toBe(3100)
    expect(attr(data, 'bab').current).toBe(2)
    expect(attr(data, 'fortitudebase').current).toBe(3)
    expect(attr(data, 'concentrationranks').current).toBe(6)
    expect(attr(data, 'concentrationclassskill').current).toBe(1)
    expect(attr(data, 'acitembonus').current).toBe(5)
    expect(attr(data, 'acitemcheckpenalty').current).toBe(-4)
    expect(attr(data, 'spellcastingstat').current).toBe('@{cha-mod} ')
    // Clérigo 3: base 2 + bônus de Car 21 (+5 → 2) + 1 de domínio
    expect(attr(data, 'spells1').current).toBe(5)
    const weaponName = data.attribs.find(a => /^repeating_weapons_.{20}_weaponname$/.test(a.name))
    expect(weaponName.current).toBe('Besta Leve')
    const spellName = data.attribs.find(a => /^repeating_spells11_.{20}_spellname11$/.test(a.name))
    expect(spellName.current).toBe('Bênção')
  })

  it('round-trip: export → import mantém os dados centrais', async () => {
    const list = (await api.get('/api/characters')).body
    const original = (await api.get(`/api/characters/${list[0].id}`)).body
    const exported = (await api.get(`/api/characters/${original.id}/export/roll20`)).body
    const res = await api.post('/api/import/roll20').send(exported)
    expect(res.status).toBe(201)
    const copy = res.body
    for (const k of ['name', 'size', 'alignment', 'str_base', 'dex_base', 'cha_base', 'hp_max', 'hp_current', 'gp', 'xp']) {
      expect(copy[k], k).toEqual(original[k])
    }
    expect(copy.classes.map(c => [c.class_id, c.level, c.caster_ability])).toEqual([['cleric', 3, 'cha']])
    expect(copy.skills.find(s => s.skill_id === 'concentration').ranks).toBe(6)
    expect(copy.items.find(i => i.ac_type === 'armor')).toMatchObject({ name: 'Peitoral', ac_bonus: 5, max_dex: 3, acp: 4, location: 'armor' })
    expect(copy.attacks[0]).toMatchObject({ name: 'Besta Leve', kind: 'ranged', damage_dice: '1d8', crit_range: 19 })
    expect(copy.spells[0]).toMatchObject({ name: 'Bênção', level: 1, class_row_id: copy.classes[0].id })
    expect(copy.prepared).toHaveLength(1)
    expect(copy.bab_override).toBeNull()
  })

  it('importa formato aninhado e guarda atributos desconhecidos', async () => {
    const payload = {
      schema_version: 3,
      character: {
        name: 'Lidda',
        attribs: [
          { name: 'character_name', current: 'Lidda' },
          { name: 'class1', current: 'Rogue' }, { name: 'level1', current: '4' },
          { name: 'class2', current: 'Mago de Batalha' }, { name: 'level2', current: '1' },
          { name: 'dex-base', current: '17' }, { name: 'hitpoints', current: '18', max: '22' },
          { name: 'size', current: '1' }, { name: 'race', current: 'Halfling' },
          { name: 'tumbleranks', current: '7' }, { name: 'craft1name', current: 'Armadilhas' }, { name: 'craft1ranks', current: '3' },
          { name: 'repeating_equipment_-AbCdEfGhIjKlMnOpQrS_equipmentname', current: 'Ferramentas de ladrão' },
          { name: 'repeating_equipment_-AbCdEfGhIjKlMnOpQrS_equipmentweight', current: '1' },
          { name: 'campanha_custom', current: 'Greyhawk' },
          { name: 'str-mod', current: '@{str}' },
        ],
      },
    }
    const res = await api.post('/api/import/roll20').send(payload)
    expect(res.status).toBe(201)
    const ch = res.body
    expect(ch).toMatchObject({ name: 'Lidda', dex_base: 17, hp_current: 18, hp_max: 22, size: 'small', race_id: 'halfling' })
    expect(ch.classes.map(c => c.class_id)).toEqual(['rogue', 'custom'])
    expect(ch.classes[1].custom_name).toBe('Mago de Batalha')
    expect(ch.skills.find(s => s.skill_id === 'tumble').ranks).toBe(7)
    expect(ch.skills.find(s => s.skill_id === 'craft')).toMatchObject({ custom_name: 'Armadilhas', ranks: 3 })
    expect(ch.items[0]).toMatchObject({ name: 'Ferramentas de ladrão', weight_lb: 1 })
    expect(JSON.parse(ch.roll20_extra)).toEqual([{ name: 'campanha_custom', current: 'Greyhawk', max: '' }])
    expect(ch._import.report[0]).toMatch(/Mago de Batalha/)

    const back = (await api.get(`/api/characters/${ch.id}/export/roll20`)).body
    expect(attr(back, 'campanha_custom').current).toBe('Greyhawk')
  })

  it('rejeita payload sem attribs', async () => {
    expect((await api.post('/api/import/roll20').send({ name: 'x' })).status).toBe(400)
  })
})
