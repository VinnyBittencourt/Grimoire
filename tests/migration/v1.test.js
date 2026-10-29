// Migração v1 → v2 sobre um banco v1 sintético (schema antigo de src/db/schema.js + colunas que
// existiam no banco real mas não no schema.js: quests.descricao/status/recompensa, anotacoes.notas)
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import Database from 'better-sqlite3'
import { mkdtempSync, rmSync, existsSync, readdirSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { initSchema } from './v1Schema.js'
import { openDatabase } from '../../server/db.js'
import { computeSheet } from '../../shared/rules/sheet.js'
import { createRepo } from '../../server/repo.js'

const PIXEL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

let dir, db
beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), 'grimoire-mig-'))
  const v1 = new Database(join(dir, 'grimoire.db'))
  initSchema(v1)
  v1.exec('ALTER TABLE quests ADD COLUMN descricao TEXT; ALTER TABLE quests ADD COLUMN status TEXT; ALTER TABLE quests ADD COLUMN recompensa TEXT; ALTER TABLE anotacoes ADD COLUMN notas TEXT; ALTER TABLE recursos ADD COLUMN icone TEXT')
  v1.prepare(`INSERT INTO personagens (id, nome, classe, multiclasses, dominio, divindade, "for", des, con, "int", sab, car, pv, ca, level, raca, idade,
    deslocamento, tendencia, falha, personalidade, moeda_ouro, foto_base64, bonus_slots_json)
    VALUES (2, 'Bonar', 'Clérigo', '[{"classe":"Clérigo","nivel":"3"},{"classe":"Mago de Batalha","nivel":"1"}]', 'Summoner', 'Ulaa',
    12, 18, 14, 10, 10, 21, 24, 18, 4, 'Humano', '23', 6, 'Neutro e Bom', NULL, 'Hipócrita', 40, ?, '[0,2,1,0,0,0,0,0,0,0]')`).run(PIXEL)
  v1.prepare("INSERT INTO talentos (personagem_id, nome, descricao) VALUES (2, 'Dynamic Priest', 'Car no lugar de Sab')").run()
  v1.prepare("INSERT INTO talentos (personagem_id, nome, descricao) VALUES (2, 'Homebrew', 'x')").run()
  v1.prepare("INSERT INTO magias (id, personagem_id, nome, nivel, escola, descricao) VALUES (5, 2, 'Bênção', 1, 'Encantamento', 'b')").run()
  v1.prepare("INSERT INTO magias (id, personagem_id, nome, nivel, escola, descricao) VALUES (6, 2, 'Soco', 0, 'Normal', 'ataque')").run()
  v1.prepare("INSERT INTO magias_preparadas (personagem_id, magia_id, usos_restantes, usos_max, nome, nivel, escola) VALUES (2, 5, 1, 2, 'Bênção', 1, 'Encantamento')").run()
  v1.prepare("INSERT INTO magias_preparadas (personagem_id, magia_id, usos_restantes, usos_max, nome, nivel, escola) VALUES (2, NULL, 1, 1, 'Luz', 0, 'Evocação')").run()
  v1.prepare("INSERT INTO equipamentos (personagem_id, slot, nome, tipo, info) VALUES (2, 'armadura', 'Breastplate', 'Armadura', '5 de bonus, Max 3 Dex, 15kg')").run()
  v1.prepare("INSERT INTO equipamentos (personagem_id, slot, nome, tipo, info) VALUES (2, 'luvas', '', '', '')").run()
  v1.prepare(`INSERT INTO recursos (personagem_id, classe, nome, total, usos_json, icone) VALUES (2, 'Clérigo', 'Expulsar Mortos-Vivos', 3,
    '[{"usado":true,"nota":"esqueletos"},{"usado":false,"nota":""}]', '☀️')`).run()
  v1.prepare("INSERT INTO recursos (personagem_id, classe, nome, total, usos_json) VALUES (2, 'Clérigo', 'Bênção de Ulaa', 2, '[]')").run()
  v1.prepare("INSERT INTO backgrounds (personagem_id, texto) VALUES (2, 'Nasceu em Melvaunt')").run()
  v1.prepare("INSERT INTO npcs (id, personagem_id, nome, genero, foto_base64) VALUES (7, 2, 'Kush', 'Masculino', ?)").run(PIXEL)
  v1.prepare("INSERT INTO locais (id, personagem_id, nome) VALUES (3, 2, 'Melvaunt')").run()
  v1.prepare("INSERT INTO quests (personagem_id, nome, local_id, tipo, notas, npc_ids, recompensa) VALUES (2, 'Ressuscitar Kush', '3', 'Principal', 'n', '7', '500 po')").run()
  v1.prepare("INSERT INTO anotacoes (personagem_id, titulo, conteudo, data, notas) VALUES (2, 'Sessão 1', '<p>a</p>', '10/06/2026', 'extra')").run()
  v1.prepare(`UPDATE personagens SET criatura_invocada_json = '{"criatura":{"nome":"Cão Celestial","ca":15},"pv_atual":4,"pv_max":6,"nivel_sm":1}' WHERE id = 2`).run()
  v1.close()
  ;({ db } = await openDatabase(dir))
})
afterAll(() => { db.close(); rmSync(dir, { recursive: true, force: true }) })

describe('migração v1 → v2', () => {
  it('não sobram tabelas v1 e a versão é a última', () => {
    expect(db.prepare("SELECT COUNT(*) c FROM sqlite_master WHERE name LIKE 'v1_%'").get().c).toBe(0)
    expect(db.pragma('user_version', { simple: true })).toBeGreaterThanOrEqual(2)
    expect(db.pragma('foreign_key_check')).toEqual([])
  })

  it('personagem, atributos, unidades e foto', () => {
    const c = db.prepare('SELECT * FROM characters WHERE id = 2').get()
    expect(c).toMatchObject({ name: 'Bonar', race_id: 'humano', alignment: 'ng', speed_ft: 20, gp: 40, hp_max: 24, hp_current: 24,
      str_base: 12, dex_base: 18, cha_base: 21, background: 'Nasceu em Melvaunt', personality: 'Hipócrita' })
    expect(existsSync(join(dir, 'photos', c.photo))).toBe(true)
  })

  it('classes, Dynamic Priest e bônus de slot sem contar em dobro', () => {
    const classes = db.prepare('SELECT * FROM character_classes WHERE character_id = 2 ORDER BY position').all()
    expect(classes.map(c => [c.class_id, c.level, c.caster_ability, c.custom_name])).toEqual([
      ['cleric', 3, 'cha', null], ['custom', 1, null, 'Mago de Batalha'],
    ])
    expect(classes[0].domains).toBe('Summoner')
    expect(db.prepare('SELECT COUNT(*) c FROM spell_slots').get().c).toBe(0)
  })

  it('magias, preparadas expandidas por uso e ataques "Normal"', () => {
    const spells = db.prepare('SELECT * FROM spells WHERE character_id = 2 ORDER BY id').all()
    expect(spells.map(s => s.name)).toEqual(['Bênção', 'Luz'])
    const prepared = db.prepare('SELECT * FROM spells_prepared ORDER BY id').all()
    expect(prepared.filter(p => p.spell_id === 5).map(p => p.used)).toEqual([1, 0])
    expect(prepared.filter(p => p.spell_id !== 5)).toHaveLength(1)
    expect(db.prepare('SELECT name FROM attacks').all()).toEqual([{ name: 'Soco' }])
  })

  it('itens, talentos e recursos', () => {
    const items = db.prepare('SELECT * FROM items').all()
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({ location: 'armor', ac_type: 'armor', ac_bonus: 5, max_dex: 3, weight_lb: 30 })
    const feats = db.prepare('SELECT name, ref_id FROM feats ORDER BY position').all()
    expect(feats[0]).toEqual({ name: 'Dynamic Priest', ref_id: 'dl_dynamic_priest' })
    expect(feats[1].ref_id).toBeNull()
    const res = db.prepare('SELECT * FROM class_resources ORDER BY position').all()
    expect(res[0]).toMatchObject({ key: 'turnundead', total_override: null })
    expect(res[1]).toMatchObject({ key: null, name: 'Bênção de Ulaa', total_override: 2 })
    expect(db.prepare('SELECT idx, used, note FROM resource_uses').all()).toEqual([{ idx: 0, used: 1, note: 'esqueletos' }])
  })

  it('diário: NPC com foto, quest ligada, nota com data ISO', () => {
    const npc = db.prepare('SELECT * FROM npcs').get()
    expect(npc).toMatchObject({ id: 7, name: 'Kush', gender: 'male' })
    expect(existsSync(join(dir, 'photos', npc.photo))).toBe(true)
    expect(db.prepare('SELECT * FROM quests').get()).toMatchObject({ name: 'Ressuscitar Kush', place_id: 3, kind: 'main', reward: '500 po' })
    expect(db.prepare('SELECT npc_id FROM quest_npcs').all()).toEqual([{ npc_id: 7 }])
    expect(db.prepare('SELECT * FROM notes').get()).toMatchObject({ session_date: '2026-06-10', content: '<p>a</p><hr>extra' })
    expect(db.prepare('SELECT * FROM summons').get()).toMatchObject({ name: 'Cão Celestial', hp_current: 4, hp_max: 6, spell_level: 1 })
  })

  it('a ficha calculada bate com a CA do v1 e tem backup + relatório', () => {
    const sheet = computeSheet(createRepo(db).getSheet(2))
    expect(sheet.ac.total).toBe(18)
    expect(sheet.ac.overridden).toBe(false)
    const backups = readdirSync(join(dir, 'backups'))
    expect(backups.some(f => /pre-migration-v0\.db$/.test(f))).toBe(true)
    expect(backups.some(f => /^migration-report-.*\.md$/.test(f))).toBe(true)
  })
})
