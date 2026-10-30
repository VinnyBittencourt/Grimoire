import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { openDatabase } from '../../server/db.js'
import { createApp } from '../../server/app.js'
import { readFileSync } from 'fs'
import { alignmentFromLabel, classFromLabel, decodeBio } from '../../server/roll20/map.js'

let api, db
beforeAll(async () => {
  ({ db } = await openDatabase(null))
  api = request(createApp({ db, dataDir: null }))
})
afterAll(() => db.close())

// O export segue o formato real da VTTES: { schema_version: 3, character: { attribs } }
const attribsOf = data => (data.character ?? data).attribs
const attr = (data, name) => attribsOf(data).find(a => a.name === name)

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
    expect(data).toMatchObject({ schema_version: 3, type: 'character' })
    expect(data.character.name).toBe('Bonar')
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
    const weaponName = attribsOf(data).find(a => /^repeating_weapons_.{20}_weaponname$/.test(a.name))
    expect(weaponName.current).toBe('Besta Leve')
    const spellName = attribsOf(data).find(a => /^repeating_spells11_.{20}_spellname11$/.test(a.name))
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

  it('nada se perde em silêncio: seções e campos desconhecidos vão para roll20_extra e voltam no export', async () => {
    const W = '-WeAp0nRowId00000001', S = '-Sp3llRowId000000001', X = '-UnkN0wnRowId0000001', E = '-EmptyWeap0nRow00001'
    const attribs = [
      { name: 'character_name', current: 'Tordek' },
      { name: 'class1', current: 'Fighter' }, { name: 'level1', current: '2' },
      { name: 'fortitudebase', current: '3' }, { name: 'spells1', current: '0' }, // recalculados
      { name: 'acitem', current: 'Cota' }, { name: 'acitemtype', current: 'medium' }, // acitemtype não é lido
      { name: 'climbranks', current: '2' }, { name: 'speaklanguageranks', current: '1' }, // perícia fora do PHB
      { name: 'str-mod', current: 'floor((@{str}-10)/2)' }, { name: 'notes', current: '' }, // calculado pela ficha / vazio
      // seção conhecida: campos lidos + um campo desconhecido
      { name: `repeating_weapons_${W}_weaponname`, current: 'Machado' },
      { name: `repeating_weapons_${W}_weaponcritmult`, current: '3' },
      { name: `repeating_weapons_${W}_weaponattacktype`, current: 'melee-desconhecido' },
      // linha sem nome: nada é importado, então a linha inteira é guardada
      { name: `repeating_weapons_${E}_weaponcritmin`, current: '19' },
      // magia: nome importado, descrição/alcance preservados
      { name: `repeating_spells01_${S}_spellname01`, current: 'Luz' },
      { name: `repeating_spells01_${S}_spelldescription01`, current: 'Objeto brilha como tocha.' },
      { name: `repeating_spells01_${S}_spellrange01`, current: 'Toque' },
      // seção que o Grimoire não conhece
      { name: `repeating_companions_${X}_companionname`, current: 'Lobo' },
      { name: `repeating_companions_${X}_companionhp`, current: '13' },
    ]
    const res = await api.post('/api/import/roll20').send({ name: 'Tordek', attribs })
    expect(res.status).toBe(201)
    const ch = res.body
    expect(ch.attacks[0]).toMatchObject({ name: 'Machado', crit_mult: 3 })

    const kept = Object.fromEntries(JSON.parse(ch.roll20_extra).map(a => [a.name, a.current]))
    expect(kept).toEqual({
      acitemtype: 'medium',
      speaklanguageranks: '1',
      [`repeating_weapons_${W}_weaponattacktype`]: 'melee-desconhecido',
      [`repeating_weapons_${E}_weaponcritmin`]: '19',
      [`repeating_spells01_${S}_spelldescription01`]: 'Objeto brilha como tocha.',
      [`repeating_spells01_${S}_spellrange01`]: 'Toque',
      [`repeating_companions_${X}_companionname`]: 'Lobo',
      [`repeating_companions_${X}_companionhp`]: '13',
    })

    const { counts } = ch._import
    expect(counts).toMatchObject({ total: attribs.length, derived: 3, empty: 1, preserved: 8 })
    expect(counts.read + counts.derived + counts.empty + counts.preserved).toBe(counts.total)

    const back = (await api.get(`/api/characters/${ch.id}/export/roll20`)).body
    for (const [name, current] of Object.entries(kept)) expect(attr(back, name)?.current, name).toBe(current)
    expect(attribsOf(back).filter(a => a.name === 'acitemtype')).toHaveLength(1)
  })

  it('rejeita payload sem attribs', async () => {
    expect((await api.post('/api/import/roll20').send({ name: 'x' })).status).toBe(400)
  })
})

// Export real da VTTES (ficha "D&D3.5 v2.8", unidades métricas), sem dados pessoais
const fixture = JSON.parse(readFileSync(new URL('./fixtures/vttes-alescarion.json', import.meta.url), 'utf8'))

describe('Roll20: export real da VTTES (Alescarion)', () => {
  let ch
  beforeAll(async () => {
    const res = await api.post('/api/import/roll20').send(fixture)
    expect(res.status).toBe(201)
    ch = res.body
  })

  it('importa classes, tendência, unidades e bio', () => {
    expect(ch.classes.map(c => [c.class_id, c.level])).toEqual([['monk', 1], ['wizard', 3]])
    expect(ch).toMatchObject({ name: 'Alescarion Sighart', alignment: 'ng', race_id: 'elfo', speed_ft: 30, hp_current: 29, hp_max: 33, int_base: 22 })
    expect(ch.bab_override).toBeNull() // Monge 1 + Mago 3 = BBA 1, igual ao da ficha
    expect(ch.background).toBe('<p>Histórico de teste: nasceu numa vila em ascensão.</p>')
    expect(ch.items.find(i => i.name === 'Masterwork Longbow').weight_lb).toBe(3) // 1,5 kg
  })

  it('importa a arma fixa (weapon1) e as magias na classe arcana', () => {
    expect(ch.attacks).toHaveLength(1)
    expect(ch.attacks[0]).toMatchObject({ name: 'Arco Longo (Masterwork))', kind: 'ranged', ability: 'dex', damage_dice: '1d8',
      damage_ability: null, crit_mult: 3, range_ft: 100, misc: 2, ammo: 40 })
    const wizard = ch.classes.find(c => c.class_id === 'wizard')
    expect(ch.spells).toHaveLength(16)
    expect(ch.spells.every(s => s.class_row_id === wizard.id)).toBe(true)
    expect(ch.prepared).toHaveLength(6)
    expect(ch.skills.find(s => s.skill_id === 'craft')).toMatchObject({ custom_name: 'Alchemy', ranks: 7, class_skill: 1 })
  })

  it('separa os talentos em blocos e liga à referência', () => {
    expect(ch.feats.map(f => [f.name, f.ref_id])).toEqual([
      ['Precise Shot', 'phb_precise_shot'],
      ['Carmendine Monk Nível 1 (talento bônus do Monge)', null],
      ['Point Blank Shot', 'phb_point_blank_shot'],
      ['Extend Spell', 'phb_extend_spell'],
    ])
    expect(ch.feats[1].description).toMatch(/^Usa Inteligência/)
    expect(ch.feats[0].description).toMatch(/^Nível 1 \(normal\) Remove a penalidade/)
  })

  it('avisa o que não aplicou e não guarda valores que a ficha calcula', () => {
    expect(ch._import.report.some(l => /Mage Armor/.test(l))).toBe(true)
    expect(ch._import.report.some(l => /Int Bonus/.test(l))).toBe(true)
    const { counts } = ch._import
    expect(counts.total).toBe(fixture.character.attribs.length)
    expect(counts.read + counts.derived + counts.empty + counts.preserved).toBe(counts.total)
    const kept = new Set(JSON.parse(ch.roll20_extra).map(a => a.name))
    for (const name of ['weightscale', 'lengthunit', 'abilityac2name', 'other', 'playername']) expect(kept.has(name), name).toBe(true)
    for (const name of ['str-mod', 'int', 'level', 'totalequipmentweight', 'unspentSkillPoints']) expect(kept.has(name), name).toBe(false)
    expect([...kept].some(n => /equipmenttotal/.test(n))).toBe(false)
  })

  it('exporta no formato real: aba arcana, unidades da ficha, bio codificada', async () => {
    const back = (await api.get(`/api/characters/${ch.id}/export/roll20`)).body
    expect(back.character.bio).toBe(fixture.character.bio)
    const names = attribsOf(back).map(a => a.name)
    expect(names.some(n => /^repeating_spells12_.{20}_spellname12$/.test(n))).toBe(true)
    expect(names.some(n => /^repeating_spells11_/.test(n))).toBe(false)
    expect(attr(back, 'speed').current).toBe(9)
    expect(attr(back, 'weightunit').current).toBe('kg')
    expect(attr(back, 'int-mod').current).toBe(6)
    expect(attr(back, 'level').current).toBe(4)
    expect(attr(back, 'arcanecasterlevel').current).toBe(3)
    const bow = attribsOf(back).find(a => /_equipmentname$/.test(a.name) && a.current === 'Masterwork Longbow')
    const rid = bow.name.slice('repeating_equipment_'.length, 'repeating_equipment_'.length + 20) // o id pode ter "_"
    expect(attr(back, `repeating_equipment_${rid}_equipmentweight`).current).toBe(1.5)

    // E volta igual
    const again = (await api.post('/api/import/roll20').send(back)).body
    expect(again.classes.map(c => c.class_id)).toEqual(['monk', 'wizard'])
    expect(again).toMatchObject({ speed_ft: 30, alignment: 'ng', background: ch.background })
    expect(again.items.find(i => i.name === 'Masterwork Longbow').weight_lb).toBe(3)
    expect(again.attacks[0]).toMatchObject({ range_ft: 100, misc: 2, ammo: 40 })
    expect(again.spells).toHaveLength(16)
    expect(again.feats.map(f => [f.name, f.ref_id, f.description])).toEqual(ch.feats.map(f => [f.name, f.ref_id, f.description]))
  })
})

describe('Roll20: rótulos livres', () => {
  it('tendência em pt e en', () => {
    expect(alignmentFromLabel('Neutro Bom')).toBe('ng')
    expect(alignmentFromLabel('Leal e Bom')).toBe('lg')
    expect(alignmentFromLabel('Caótico Mau')).toBe('ce')
    expect(alignmentFromLabel('Neutro')).toBe('n')
    expect(alignmentFromLabel('True Neutral')).toBe('n')
    expect(alignmentFromLabel('Lawful Evil')).toBe('le')
    expect(alignmentFromLabel('NG')).toBe('ng')
    expect(alignmentFromLabel('qualquer')).toBeNull()
  })

  it('classe com apelido, acento ou caixa diferente', () => {
    expect(classFromLabel('Mage')).toBe('wizard')
    expect(classFromLabel('mago')).toBe('wizard')
    expect(classFromLabel('clerigo')).toBe('cleric')
    expect(classFromLabel('Favored Soul')).toBe('favored_soul')
    expect(classFromLabel('Mago de Batalha')).toBeNull()
  })

  it('bio: decodifica escape() e deixa texto comum intacto', () => {
    expect(decodeBio('%3Cp%3EAscens%E3o%3C/p%3E')).toBe('<p>Ascensão</p>')
    expect(decodeBio('<p>50%25 já em HTML</p>')).toBe('<p>50%25 já em HTML</p>')
    expect(decodeBio('texto simples')).toBe('texto simples')
  })
})
