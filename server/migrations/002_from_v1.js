// Converte os dados do v1 (tabelas v1_*, renomeadas pela 001) para o schema v2 e apaga as v1_*.
// Mantém os ids de personagens, magias, NPCs e locais para preservar as referências.
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { ABILITY_FROM_V1, ALIGNMENT_FROM_V1, GENDER_FROM_V1 } from '../../shared/constants/abilities.js'
import { SIZE_FROM_V1 } from '../../shared/constants/sizes.js'
import { CLASS_FROM_V1, CLASSES } from '../../shared/constants/classes.js'
import { RESOURCE_FROM_V1 } from '../../shared/rules/resources.js'
import { bonusSpells } from '../../shared/rules/spellcasting.js'
import { abilityMod } from '../../shared/rules/abilities.js'
import { computeSheet } from '../../shared/rules/sheet.js'
import { RACAS } from '../../src/db/referenceData.js'
import { ensureSkillRows, syncResources } from '../defaults.js'

const has = (db, t) => Boolean(db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(t))
const all = (db, t) => (has(db, t) ? db.prepare(`SELECT * FROM "${t}"`).all() : [])
const json = (s, fallback) => { try { return s ? JSON.parse(s) : fallback } catch { return fallback } }
const int = v => (v === '' || v == null || Number.isNaN(Number(v)) ? null : Number(v))

// "dd/mm/aaaa" → "aaaa-mm-dd"
function isoDate(s) {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s ?? '')
  return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : (s || null)
}

// data URL base64 → arquivo em data/photos; retorna o nome do arquivo
function savePhoto(dataUrl, photosDir) {
  const m = /^data:image\/(\w+);base64,(.+)$/s.exec(dataUrl ?? '')
  if (!m) return null
  const ext = m[1] === 'jpeg' ? 'jpg' : m[1]
  const file = `${randomUUID()}.${ext}`
  mkdirSync(photosDir, { recursive: true })
  writeFileSync(join(photosDir, file), Buffer.from(m[2], 'base64'))
  return file
}

// v1 guardava deslocamento em metros (com default '30' que na prática era pés).
// ≤ 18 → metros (1,5 m = 5 pés); acima disso já era pés.
function speedFt(v) {
  const n = Number(v)
  if (!n) return 30
  return n <= 18 ? Math.round((n / 1.5) * 5) : n
}

// "5 de bonus, Max 3 Dex, 15kg" → campos estruturados (o texto original vai para notes)
function parseArmorInfo(info) {
  const out = {}
  const bonus = /(\d+)\s*de\s*b[ôo]nus|\+\s*(\d+)\s*(?:CA|AC)/i.exec(info ?? '')
  if (bonus) out.ac_bonus = Number(bonus[1] ?? bonus[2])
  const maxDex = /max\.?\s*(\d+)\s*(?:des|dex)/i.exec(info ?? '')
  if (maxDex) out.max_dex = Number(maxDex[1])
  const kg = /(\d+(?:[.,]\d+)?)\s*kg/i.exec(info ?? '')
  if (kg) out.weight_lb = Number(kg[1].replace(',', '.')) * 2
  return out
}

const SLOT_FROM_V1 = {
  capacete: 'head', amuleto: 'neck', armadura: 'armor', capa: 'cloak', braco_esq: 'offhand',
  braco_dir: 'arms', luvas: 'hands', cinto: 'waist', anel_esq: 'ring1', anel_dir: 'ring2',
  botas: 'feet', arma_principal: 'mainhand', arma_secundaria: 'offhand',
}

export function up(db, ctx) {
  if (!has(db, 'v1_personagens')) return
  ctx.seed(db) // os talentos de referência são usados para ligar os talentos do v1 (por nome)
  const log = []
  const note = msg => log.push(msg)

  const refFeats = db.prepare('SELECT id, nome, nome_en FROM ref_talentos').all()
  const findFeat = name => {
    const k = (name ?? '').trim().toLowerCase()
    return refFeats.find(f => f.nome?.toLowerCase() === k || f.nome_en?.toLowerCase() === k)
  }
  const refFlaws = db.prepare('SELECT id, nome FROM ref_falhas').all()

  const v1 = Object.fromEntries(['magias', 'magias_preparadas', 'equipamentos', 'mochila', 'backgrounds', 'players',
    'talentos', 'recursos', 'anotacoes', 'npcs', 'locais', 'quests'].map(t => [t, all(db, `v1_${t}`)]))
  const of = (t, pid) => v1[t].filter(r => Number(r.personagem_id) === pid)

  for (const p of all(db, 'v1_personagens')) {
    const pid = Number(p.id)
    note(`Personagem #${pid} ${p.nome}`)

    // ── characters ────────────────────────────────────────────────────────
    const race = RACAS.find(r => r.nome === p.raca)
    const row = {
      id: pid,
      name: p.nome ?? '',
      race_id: race?.id ?? null,
      race_name: race ? null : (p.raca || null),
      alignment: ALIGNMENT_FROM_V1[p.tendencia] ?? null,
      deity: p.divindade || null,
      gender: GENDER_FROM_V1[p.sexo] ?? null,
      age: p.idade != null ? String(p.idade) : null,
      size: SIZE_FROM_V1[p.tamanho] ?? 'medium',
      speed_ft: speedFt(p.deslocamento),
      personality: p.personalidade || null,
      flaw: p.falha || null,
      background: of('backgrounds', pid)[0]?.texto ?? null,
      photo: savePhoto(p.foto_base64, ctx.photosDir),
      cp: int(p.moeda_cobre) ?? 0, sp: int(p.moeda_prata) ?? 0, gp: int(p.moeda_ouro) ?? 0, pp: int(p.moeda_platina) ?? 0,
      hp_max: int(p.pv) ?? 0, hp_current: int(p.pv) ?? 0,
    }
    for (const [old, ab] of Object.entries(ABILITY_FROM_V1)) row[`${ab}_base`] = int(p[old]) ?? 10
    if (p.deslocamento) note(`  deslocamento ${p.deslocamento} (v1) → ${row.speed_ft} pés`)
    if (row.photo) note(`  foto extraída para data/photos/${row.photo}`)
    const cols = Object.keys(row)
    db.prepare(`INSERT INTO characters (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${cols.map(c => `@${c}`).join(', ')})`).run(row)

    // ── classes ───────────────────────────────────────────────────────────
    const v1Feats = of('talentos', pid)
    const dynamicPriest = v1Feats.some(f => /dynamic priest|sacerdote din[aâ]mico/i.test(f.nome ?? ''))
    const mc = json(p.multiclasses, null) ?? [{ classe: p.classe, nivel: p.level ?? 1 }]
    const insertClass = db.prepare(`INSERT INTO character_classes (character_id, position, class_id, custom_name, level, caster_ability, domains)
      VALUES (?, ?, ?, ?, ?, ?, ?)`)
    const classRows = mc.map((c, i) => {
      const classId = CLASS_FROM_V1[c.classe] ?? 'custom'
      const casterAbility = dynamicPriest && classId === 'cleric' ? 'cha' : null
      const domains = classId === 'cleric' && p.dominio ? p.dominio : null
      const info = insertClass.run(pid, i, classId, classId === 'custom' ? c.classe : null, int(c.nivel) ?? 1, casterAbility, domains)
      if (classId === 'custom') note(`  classe "${c.classe}" sem equivalente → classe livre (ajuste BAB/saves na ficha)`)
      if (casterAbility) note('  Dynamic Priest detectado: Clérigo passa a conjurar com Carisma')
      return { id: Number(info.lastInsertRowid), class_id: classId, level: int(c.nivel) ?? 1, caster_ability: casterAbility }
    })
    const caster = classRows.find(r => CLASSES[r.class_id]?.caster) ?? classRows[0]

    // Bônus manual de slots: se a troca de atributo já cobre o bônus, desconta para não somar em dobro
    const bonus = json(p.bonus_slots_json, [])
    if (caster && bonus.some(Number)) {
      const def = CLASSES[caster.class_id]?.caster
      const before = abilityMod(int(p[def?.ability === 'cha' ? 'car' : 'sab']) ?? 10)
      const after = caster.caster_ability ? abilityMod(int(p.car) ?? 10) : before
      const insertSlot = db.prepare('INSERT INTO spell_slots (character_id, class_row_id, level, bonus) VALUES (?, ?, ?, ?)')
      bonus.forEach((b, L) => {
        const adjusted = Math.max(0, (Number(b) || 0) - (bonusSpells(after, L) - bonusSpells(before, L)))
        if (adjusted) insertSlot.run(pid, caster.id, L, adjusted)
      })
      note(`  bônus manual de slots v1 [${bonus.join(',')}] → ajustado ao atributo de conjuração`)
    }

    // ── perícias e talentos ───────────────────────────────────────────────
    ensureSkillRows(db, pid)
    const insertFeat = db.prepare('INSERT INTO feats (character_id, position, ref_id, kind, name, description) VALUES (?, ?, ?, ?, ?, ?)')
    v1Feats.forEach((f, i) => {
      const ref = f.feat_id ? { id: f.feat_id } : findFeat(f.nome)
      insertFeat.run(pid, i, ref?.id ?? null, 'feat', f.nome ?? '', f.descricao ?? null)
    })
    const flaw = refFlaws.find(f => f.nome === p.falha)
    if (flaw) insertFeat.run(pid, v1Feats.length, flaw.id, 'flaw', flaw.nome, null)

    // ── magias (escola 'Normal' eram ataques comuns) ──────────────────────
    const insertSpell = db.prepare(`INSERT INTO spells (id, character_id, class_row_id, level, name, school, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)`)
    const insertAttack = db.prepare('INSERT INTO attacks (character_id, position, name, notes) VALUES (?, ?, ?, ?)')
    const spellIds = new Set()
    let attackPos = 0
    for (const m of of('magias', pid)) {
      if (m.escola === 'Normal') { insertAttack.run(pid, attackPos++, m.nome ?? '', m.descricao ?? null); continue }
      insertSpell.run(m.id, pid, caster?.id ?? null, Math.min(9, int(m.nivel) ?? 0), m.nome ?? '', m.escola ?? null, m.descricao ?? null)
      spellIds.add(Number(m.id))
    }
    const insertPrepared = db.prepare(`INSERT INTO spells_prepared (character_id, position, spell_id, class_row_id, level, used)
      VALUES (?, ?, ?, ?, ?, ?)`)
    let prepPos = 0
    for (const mp of of('magias_preparadas', pid)) {
      if (mp.escola === 'Normal') continue
      let spellId = int(mp.magia_id)
      if (!spellId || !spellIds.has(spellId)) {
        const info = db.prepare('INSERT INTO spells (character_id, class_row_id, level, name, school, description) VALUES (?, ?, ?, ?, ?, ?)')
          .run(pid, caster?.id ?? null, Math.min(9, int(mp.nivel) ?? 0), mp.nome ?? '', mp.escola ?? null, mp.descricao ?? null)
        spellId = Number(info.lastInsertRowid)
        spellIds.add(spellId)
      }
      const max = Math.max(1, int(mp.usos_max) ?? 1)
      const left = Math.min(max, Math.max(0, int(mp.usos_restantes) ?? max))
      for (let k = 0; k < max; k++) {
        insertPrepared.run(pid, prepPos++, spellId, caster?.id ?? null, Math.min(9, int(mp.nivel) ?? 0), k < max - left ? 1 : 0)
      }
    }

    // ── itens (slots de equipamento + mochila) ────────────────────────────
    const insertItem = db.prepare(`INSERT INTO items (character_id, position, location, icon, name, qty, weight_lb, notes, ac_type, ac_bonus, max_dex)
      VALUES (@character_id, @position, @location, @icon, @name, @qty, @weight_lb, @notes, @ac_type, @ac_bonus, @max_dex)`)
    let itemPos = 0
    for (const e of of('equipamentos', pid)) {
      if (!e.nome && !e.info) continue
      const location = SLOT_FROM_V1[e.slot] ?? 'backpack'
      const parsed = location === 'armor' ? parseArmorInfo(e.info) : {}
      insertItem.run({
        character_id: pid, position: itemPos++, location, icon: null, name: e.nome ?? '', qty: 1,
        weight_lb: parsed.weight_lb ?? 0, notes: e.info || null,
        ac_type: location === 'armor' ? 'armor' : null, ac_bonus: parsed.ac_bonus ?? null, max_dex: parsed.max_dex ?? null,
      })
      if (parsed.ac_bonus != null) note(`  armadura "${e.nome}": CA +${parsed.ac_bonus}, Des máx ${parsed.max_dex ?? '—'} (lido de "${e.info}")`)
    }
    for (const m of of('mochila', pid)) {
      insertItem.run({
        character_id: pid, position: itemPos++, location: 'backpack', icon: m.icone ?? null, name: m.nome ?? '',
        qty: Number(m.quantidade) || 1, weight_lb: (Number(m.peso) || 0) * 2, notes: m.info ?? m.descricao ?? null,
        ac_type: null, ac_bonus: null, max_dex: null,
      })
    }

    // ── recursos de classe ────────────────────────────────────────────────
    const insertRes = db.prepare(`INSERT INTO class_resources (character_id, position, key, class_row_id, name, icon, total_override)
      VALUES (?, ?, ?, ?, ?, ?, ?)`)
    const insertUse = db.prepare('INSERT INTO resource_uses (resource_id, idx, used, note) VALUES (?, ?, ?, ?)')
    of('recursos', pid).forEach((r, i) => {
      const key = RESOURCE_FROM_V1[r.nome] ?? null
      const classRow = classRows.find(c => c.class_id === CLASS_FROM_V1[r.classe]) ?? classRows[0]
      // Recursos conhecidos passam a usar a fórmula; personalizados mantêm o total do v1
      const info = insertRes.run(pid, i, key, key ? classRow?.id ?? null : null, key ? null : r.nome, r.icone ?? null, key ? null : int(r.total))
      json(r.usos_json, []).forEach((u, idx) => {
        if (u?.usado || u?.nota) insertUse.run(info.lastInsertRowid, idx, u.usado ? 1 : 0, u.nota || null)
      })
      if (key) note(`  recurso "${r.nome}" (total ${r.total} no v1) agora segue a fórmula do PHB`)
    })
    syncResources(db, pid)

    // ── criatura invocada ─────────────────────────────────────────────────
    const summon = json(p.criatura_invocada_json, null)
    if (summon?.criatura) {
      db.prepare('INSERT INTO summons (character_id, name, data, hp_current, hp_max, spell_level) VALUES (?, ?, ?, ?, ?, ?)')
        .run(pid, summon.criatura.nome ?? '', JSON.stringify(summon.criatura), int(summon.pv_atual) ?? 0, int(summon.pv_max) ?? 0, int(summon.nivel_sm))
    }

    // ── diário ────────────────────────────────────────────────────────────
    of('players', pid).forEach((r, i) =>
      db.prepare('INSERT INTO players (character_id, position, name, class, race, notes) VALUES (?, ?, ?, ?, ?, ?)')
        .run(pid, i, r.nome ?? '', r.classe ?? null, r.raca ?? null, r.notas ?? null))
    of('npcs', pid).forEach((r, i) =>
      db.prepare('INSERT INTO npcs (id, character_id, position, name, gender, occupation, notes, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(r.id, pid, i, r.nome ?? '', GENDER_FROM_V1[r.genero] ?? r.genero ?? null, r.ocupacao ?? null, r.notas ?? null, savePhoto(r.foto_base64, ctx.photosDir)))
    of('locais', pid).forEach((r, i) =>
      db.prepare('INSERT INTO places (id, character_id, position, name, notes) VALUES (?, ?, ?, ?, ?)').run(r.id, pid, i, r.nome ?? '', r.notas ?? null))
    const placeIds = new Set(of('locais', pid).map(r => Number(r.id)))
    const npcIds = new Set(of('npcs', pid).map(r => Number(r.id)))
    of('quests', pid).forEach((q, i) => {
      const placeId = placeIds.has(int(q.local_id)) ? int(q.local_id) : null
      const kind = /princip|main/i.test(q.tipo ?? '') ? 'main' : 'side'
      const notes = [q.descricao, q.notas].filter(Boolean).join('\n\n') || null
      const info = db.prepare('INSERT INTO quests (character_id, position, name, place_id, kind, status, reward, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(pid, i, q.nome ?? '', placeId, kind, q.status || 'open', q.recompensa ?? null, notes)
      for (const nid of String(q.npc_ids ?? '').split(',').map(int).filter(n => npcIds.has(n))) {
        db.prepare('INSERT OR IGNORE INTO quest_npcs (quest_id, npc_id) VALUES (?, ?)').run(info.lastInsertRowid, nid)
      }
    })
    of('anotacoes', pid).forEach((a, i) => {
      const parts = [a.conteudo, a.notas && a.notas !== a.conteudo ? a.notas : null].filter(Boolean)
      db.prepare('INSERT INTO notes (character_id, position, title, content, session_date) VALUES (?, ?, ?, ?, ?)')
        .run(pid, i, a.titulo ?? '', parts.join('<hr>') || null, isoDate(a.data))
    })

    // ── CA: se o cálculo novo divergir do valor digitado no v1, preserva o v1 ──
    const aggregate = {
      ...db.prepare('SELECT * FROM characters WHERE id = ?').get(pid),
      classes: db.prepare('SELECT * FROM character_classes WHERE character_id = ?').all(pid),
      items: db.prepare('SELECT * FROM items WHERE character_id = ?').all(pid),
    }
    const computedAc = computeSheet(aggregate).ac.total
    const v1Ac = int(p.ca)
    if (v1Ac != null && v1Ac !== computedAc) {
      db.prepare('UPDATE characters SET ac_override = ? WHERE id = ?').run(v1Ac, pid)
      note(`  CA calculada ${computedAc} ≠ CA do v1 ${v1Ac} → mantida ${v1Ac} como override (remova na ficha quando conferir)`)
    } else if (v1Ac != null) {
      note(`  CA ${v1Ac} confere com o cálculo novo`)
    }
  }

  for (const t of ['personagens', ...Object.keys(v1)]) db.exec(`DROP TABLE IF EXISTS "v1_${t}"`)
  ctx.report?.('002_from_v1', log)
}
