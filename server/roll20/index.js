// Export/import de personagem no formato JSON de personagem do Roll20 usado pela extensão
// VTT Enhancement Suite (VTTES). Formato conferido com um export real (tests/roll20/fixtures/vttes-alescarion.json):
// { schema_version: 3, type: 'character', character: { name, bio (escape()), attribs: [{ name, current, max, id }], abilities } }.
// O import também aceita o formato plano { name, attribs } (versões antigas).
import { randomBytes } from 'crypto'
import { ABILITIES } from '../../shared/constants/abilities.js'
import { SKILLS, SKILL_BY_ID } from '../../shared/constants/skills.js'
import { computeSheet } from '../../shared/rules/sheet.js'
import { classDef } from '../../shared/rules/progression.js'
import { HttpError } from '../repo.js'
import {
  SIZE_TO_ROLL20, SIZE_FROM_ROLL20, ALIGNMENT_LABEL, alignmentFromLabel, classLabel, classFromLabel,
  statRef, statFromRef, MULTI_SKILLS, SIMPLE_FIELDS, INT_FIELDS, isDerivedAttr, SPELL_TAB, unitScale, decodeBio,
} from './map.js'

const round2 = v => Math.round(v * 100) / 100
const FEAT_SEPARATOR = /^\s*-{3,}\s*$/m
// Campos de arma lidos (seção repetida: weapon<campo>; armas fixas: weapon<N><campo>)
const WEAPON_FIELDS = ['name', 'type', 'enh', 'focus', 'specialize', 'stat', 'damagestat', 'dicenumber', 'dicetype',
  'bonusdamage', 'critmin', 'critmult', 'range', 'ammunition', 'specialproperties']

const ID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'
// Ids de linha repetida no estilo Roll20: "-" + 19 caracteres
export function rowId() {
  const bytes = randomBytes(19)
  return '-' + Array.from(bytes, b => ID_CHARS[b % 64]).join('')
}

function loadRefFeats(db) {
  const rows = [...db.prepare('SELECT id, efeitos FROM ref_talentos').all(), ...db.prepare('SELECT id, efeitos FROM ref_falhas').all()]
  return new Map(rows.map(r => [r.id, { id: r.id, efeitos: JSON.parse(r.efeitos || '[]') }]))
}

// ── Export ──────────────────────────────────────────────────────────────────
export function exportRoll20(ch, db) {
  const sheet = computeSheet(ch, loadRefFeats(db))
  const attribs = []
  const set = (name, current, max = '') => attribs.push({ name, current: current ?? '', max: max ?? '', id: rowId() })
  let extras = []
  try { extras = JSON.parse(ch.roll20_extra || '[]') } catch { /* roll20_extra inválido: ignora */ }
  // Unidades da ficha de origem (guardadas no import): o Grimoire guarda pés/libras e converte de volta
  const pref = name => extras.find(e => e.name === name)?.current
  const lenScale = unitScale(pref('lengthscale')), wtScale = unitScale(pref('weightscale'))
  const length = ft => (ft == null || ft === '' ? ft : round2(ft * lenScale))
  const weight = lb => (lb == null || lb === '' ? lb : round2(lb * wtScale))

  for (const [attr, field] of Object.entries(SIMPLE_FIELDS)) {
    if (ch[field] == null || ch[field] === '') continue
    set(attr, field === 'speed_ft' ? length(ch[field]) : ch[field])
  }
  const race = ch.race_id ? db.prepare('SELECT nome FROM ref_racas WHERE id = ?').get(ch.race_id)?.nome : null
  set('race', race ?? ch.race_name ?? '')
  if (ch.alignment) set('alignment', ALIGNMENT_LABEL[ch.alignment])
  set('size', SIZE_TO_ROLL20[ch.size ?? 'medium'])
  set('hitpoints', ch.hp_current, ch.hp_max)

  for (const ab of ABILITIES) {
    set(`${ab}-base`, ch[`${ab}_base`] ?? 10)
    set(`${ab}-equi`, ch[`${ab}_enh`] ?? 0)
    set(`${ab}-misc`, ch[`${ab}_misc`] ?? 0)
    set(`${ab}-temp`, (ch[`${ab}_temp`] ?? 0) - (ch[`${ab}_damage`] ?? 0) - (ch[`${ab}_drain`] ?? 0))
    set(ab, sheet.abilities[ab].score)
    set(`${ab}-mod`, sheet.abilities[ab].mod)
  }

  const classes = [...ch.classes].sort((a, b) => a.position - b.position)
  set('level', classes.reduce((sum, c) => sum + (Number(c.level) || 0), 0))
  classes.slice(0, 10).forEach((c, i) => {
    set(`class${i + 1}`, c.custom_name || classLabel(c.class_id))
    set(`level${i + 1}`, c.level)
    set(`hitdietype${i + 1}`, classDef(c).hd)
  })

  set('bab', sheet.bab.total)
  for (const [s, attr] of [['fort', 'fortitude'], ['ref', 'reflex'], ['will', 'will']]) {
    set(`${attr}base`, sheet.saves[s].base)
    set(`${attr}magicmod`, ch[`${s}_magic`] ?? 0)
    set(`${attr}miscmod`, ch[`${s}_misc`] ?? 0)
    set(`${attr}tempmod`, ch[`${s}_temp`] ?? 0)
  }

  // CA: armadura e escudo equipados + bônus manuais nos slots 1 de natural/deflexão/esquiva
  const equipped = ch.items.filter(it => it.location && it.location !== 'backpack')
  const armor = equipped.find(it => it.ac_type === 'armor')
  const shield = equipped.find(it => it.ac_type === 'shield')
  if (armor) {
    set('acitem', armor.name); set('acitembonus', armor.ac_bonus ?? 0); set('acitemdex', armor.max_dex ?? 99)
    set('acitemcheckpenalty', -Math.abs(armor.acp ?? 0)); set('acitemspellfailure', armor.spell_failure ?? 0)
    set('acitemweight', weight(armor.weight_lb ?? 0)); set('armorworn', 1)
  }
  if (shield) {
    set('shield', shield.name); set('shieldacbonus', shield.ac_bonus ?? 0)
    set('shieldcheckpenalty', -Math.abs(shield.acp ?? 0)); set('shieldspellfailure', shield.spell_failure ?? 0)
    set('shieldweight', weight(shield.weight_lb ?? 0)); set('shieldworn', 1)
  }
  const acSlots = { natural: 'naturalarmor', deflection: 'deflection', dodge: 'dodgebonus' }
  for (const [type, prefix] of Object.entries(acSlots)) {
    const entries = [
      ...(ch[`ac_${type}`] ? [{ name: 'Manual', bonus: ch[`ac_${type}`] }] : []),
      ...equipped.filter(it => it.ac_type === type).map(it => ({ name: it.name, bonus: it.ac_bonus ?? 0 })),
    ].slice(0, 4)
    entries.forEach((e, i) => {
      set(`${prefix}${i + 1}name`, e.name); set(`${prefix}${i + 1}bonus`, e.bonus); set(`${prefix}${i + 1}inuse`, 1)
    })
  }

  // Perícias
  const multiCount = Object.fromEntries(MULTI_SKILLS.map(s => [s, 0]))
  for (const row of ch.skills) {
    const def = SKILL_BY_ID[row.skill_id]
    const computed = sheet.skills.find(s => s.id === row.id)
    let prefix = row.skill_id
    if (def?.multi) {
      if (!row.ranks && !row.custom_name && !row.misc) continue
      multiCount[row.skill_id] += 1
      if (multiCount[row.skill_id] > 3) continue
      prefix = `${row.skill_id}${multiCount[row.skill_id]}`
      if (row.custom_name) set(`${prefix}name`, row.custom_name)
    } else if (!def) {
      const id = rowId()
      const add = (f, v) => attribs.push({ name: `repeating_skills_${id}_${f}`, current: v ?? '', max: '', id: rowId() })
      add('otherskillname', row.custom_name ?? row.skill_id); add('otherskillranks', row.ranks)
      add('otherskillmiscmod', row.misc); add('otherskillclassskill', computed?.classSkill ? 1 : 0)
      continue
    }
    set(`${prefix}ranks`, row.ranks)
    set(`${prefix}classskill`, computed?.classSkill ? 1 : 0)
    if (row.misc) set(`${prefix}miscmod`, row.misc)
  }

  // Ataques
  for (const a of ch.attacks) {
    const id = rowId()
    const add = (f, v) => attribs.push({ name: `repeating_weapons_${id}_${f}`, current: v ?? '', max: '', id: rowId() })
    const dice = /^(\d+)d(\d+)/.exec(a.damage_dice ?? '')
    add('weaponname', a.name); add('weaponenh', a.enh); add('weaponstat', statRef(a.ability ?? (a.kind === 'ranged' ? 'dex' : 'str')))
    add('weapondamagestat', statRef(a.damage_ability)); if (dice) { add('weapondicenumber', dice[1]); add('weapondicetype', dice[2]) }
    add('weaponcritmin', a.crit_range); add('weaponcritmult', a.crit_mult); add('weaponrange', length(a.range_ft ?? ''))
    add('weaponbonusdamage', a.damage_misc); add('weaponspecialproperties', a.notes ?? '')
    if (a.misc) add('weaponfocus', a.misc)
    if (a.ammo != null) add('weaponammunition', a.ammo)
  }

  // Equipamento (tudo que não é armadura/escudo exportado acima)
  for (const it of ch.items) {
    if (it === armor || it === shield) continue
    const id = rowId()
    const add = (f, v) => attribs.push({ name: `repeating_equipment_${id}_${f}`, current: v ?? '', max: '', id: rowId() })
    add('equipmentname', it.name); add('equipmentquantity', it.qty); add('equipmentweight', weight(it.weight_lb))
    add('equipmentlocation', it.location === 'backpack' ? '' : it.location); add('equipmentnotes', it.notes ?? '')
    if (it.cost_gp != null) add('equipmentcost', it.cost_gp)
  }

  // Conjuração: seções repeating_spells<nível><aba>, aba 1 = divina e 2 = arcana (SPELL_TAB).
  // Duas classes da mesma lista dividem a aba.
  const tabsDone = new Set()
  sheet.casting.forEach((cast, ci) => {
    const tab = SPELL_TAB[cast.list] ?? SPELL_TAB.divine
    if (ci === 0) {
      set('casterlevel', cast.casterLevel)
      set('spellcastingstat', statRef(cast.ability))
      cast.perDay.forEach((v, L) => { if (v != null) set(`spells${L}`, v + cast.domain[L]) })
      cast.dc.forEach((v, L) => set(`spelldc${L}`, v))
    } else if (ci === 1) {
      set('casterlevel2', cast.casterLevel)
    }
    if (!tabsDone.has(tab)) {
      tabsDone.add(tab)
      set(`${cast.list}casterlevel`, cast.casterLevel)
      cast.perDay.forEach((v, L) => { if (v != null) set(`${cast.list}spells${L}`, v + cast.domain[L]) })
      cast.dc.forEach((v, L) => set(`${cast.list}spelldc${L}`, v))
    }
    for (const sp of ch.spells.filter(s => s.class_row_id === cast.rowId)) {
      const id = rowId()
      const sec = `repeating_spells${sp.level}${tab}`
      const tag = `${sp.level}${tab}`
      const prepared = ch.prepared.filter(p => p.spell_id === sp.id)
      const add = (f, v) => attribs.push({ name: `${sec}_${id}_${f}${tag}`, current: v ?? '', max: '', id: rowId() })
      add('spellname', sp.name); add('spellschool', sp.school ?? ''); add('spelllevel', sp.level)
      if (prepared.length) { add('spellprep', prepared.length); add('spellused', prepared.filter(p => p.used).length) }
    }
  })

  // Talentos: com descrição, um bloco por talento separado por "-----" (o mesmo formato que o import lê)
  const feats = [...ch.feats].sort((a, b) => a.position - b.position)
  set('feats', feats.some(f => f.description)
    ? feats.map(f => [f.name, f.description].filter(Boolean).join('\n')).join(`\n${'-'.repeat(48)}\n`)
    : feats.map(f => f.name).join('\n'))
  if (ch.background) set('bio', ch.background)

  // Atributos desconhecidos importados do Roll20 voltam intactos
  for (const extra of extras) {
    if (!attribs.some(a => a.name === extra.name)) attribs.push({ ...extra, id: rowId() })
  }

  return {
    schema_version: 3,
    type: 'character',
    character: {
      name: ch.name,
      avatar: '',
      bio: escape(ch.background ?? ''),
      gmnotes: '',
      defaulttoken: '',
      tags: '',
      controlledby: '',
      inplayerjournals: '',
      attribs,
      abilities: [],
    },
  }
}

// Talento da referência cujo nome (pt ou en) é a linha inteira ou o começo dela; vale o nome mais longo
function matchFeat(refs, header) {
  const h = header.toLowerCase()
  let best = null
  for (const ref of refs) {
    for (const n of [ref.nome, ref.nome_en]) {
      const k = String(n ?? '').toLowerCase()
      if (k.length < 3 || !h.startsWith(k) || /[\p{L}\p{N}]/u.test(h[k.length] ?? '')) continue
      if (!best || k.length > best.length) best = { ref, length: k.length }
    }
  }
  return best
}

// ── Import ──────────────────────────────────────────────────────────────────
const toInt = v => {
  const n = parseInt(String(v ?? '').trim(), 10)
  return Number.isFinite(n) ? n : null
}
const toNum = v => {
  const n = parseFloat(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) ? n : null
}
const isFormula = v => /@\{|\[\[/.test(String(v ?? ''))
const REPEATING = /^repeating_([^_]+)_(.{20})_(.+)$/

export function importRoll20(db, repo, payload) {
  const data = payload?.character ?? payload
  if (!data || !Array.isArray(data.attribs)) {
    throw new HttpError(400, 'invalid_format', 'Arquivo não parece um personagem Roll20 (falta "attribs")')
  }

  // Nada é descartado em silêncio: cada atributo termina lido (importado), recalculado,
  // vazio/fórmula da ficha, ou guardado em roll20_extra (volta intacto no export).
  const attrs = new Map()
  const repeating = {}
  for (const a of data.attribs) {
    if (!a?.name) continue
    const m = REPEATING.exec(a.name)
    if (m) {
      const [, section, rid, field] = m
      ;((repeating[section] ??= {})[rid] ??= {})[field] = a.current
      continue
    }
    attrs.set(a.name, a)
  }
  const read = new Set() // nomes de atributo que o import consultou
  const cur = name => { read.add(name); return attrs.get(name)?.current }
  // Linha repetida importada: marca os campos consumidos (os outros campos da linha são preservados)
  const consumeRow = (section, rid, fields) => { for (const f of fields) read.add(`repeating_${section}_${rid}_${f}`) }
  const report = []
  // Unidades da ficha: lidas sem marcar, para ficarem em roll20_extra e o export converter de volta
  const lenScale = unitScale(attrs.get('lengthscale')?.current), wtScale = unitScale(attrs.get('weightscale')?.current)
  const feet = v => { const x = toNum(v); return x == null ? null : Math.round(x / lenScale) }
  const pounds = v => { const x = toNum(v); return x == null ? null : round2(x / wtScale) }

  // Personagem
  const fields = { name: String(cur('character_name') ?? data.name ?? 'Importado do Roll20').slice(0, 200) }
  for (const [attr, field] of Object.entries(SIMPLE_FIELDS)) {
    if (field === 'name') continue
    const v = cur(attr)
    if (v == null || v === '' || isFormula(v)) continue
    fields[field] = field === 'speed_ft' ? feet(v) ?? 0 : INT_FIELDS.has(field) ? toInt(v) ?? 0 : String(v)
  }
  if (fields.gender && !['male', 'female', 'other'].includes(fields.gender)) {
    const g = fields.gender.toLowerCase()
    fields.gender = /^(m|male|masc)/.test(g) ? 'male' : /^(f|female|fem)/.test(g) ? 'female' : 'other'
  }
  const raceName = String(cur('race') ?? '').trim()
  if (raceName) {
    const ref = db.prepare('SELECT id FROM ref_racas WHERE lower(nome) = lower(?) OR lower(id) = lower(?)').get(raceName, raceName)
    if (ref) fields.race_id = ref.id
    else fields.race_name = raceName
  }
  fields.alignment = alignmentFromLabel(cur('alignment'))
  fields.size = SIZE_FROM_ROLL20[String(cur('size') ?? '0').trim()] ?? 'medium'
  read.add('hitpoints')
  const hp = attrs.get('hitpoints')
  if (hp) { fields.hp_current = toInt(hp.current) ?? 0; fields.hp_max = toInt(hp.max) ?? fields.hp_current }
  for (const ab of ABILITIES) {
    for (const [part, col] of [['base', 'base'], ['equi', 'enh'], ['misc', 'misc'], ['temp', 'temp']]) {
      const v = toInt(cur(`${ab}-${part}`))
      if (v != null) fields[`${ab}_${col}`] = v
    }
  }
  for (const [s, attr] of [['fort', 'fortitude'], ['ref', 'reflex'], ['will', 'will']]) {
    for (const [part, col] of [['magicmod', 'magic'], ['miscmod', 'misc'], ['tempmod', 'temp']]) {
      const v = toInt(cur(`${attr}${part}`))
      if (v != null) fields[`${s}_${col}`] = v
    }
  }
  const bioAttr = cur('bio')
  const bio = decodeBio(data.bio || bioAttr)
  if (bio) fields.background = bio

  // Classes
  const classes = []
  for (let i = 1; i <= 10; i++) {
    const label = String(cur(`class${i}`) ?? '').trim()
    const level = toInt(cur(`level${i}`)) ?? 0
    if (!label || !level) continue
    const classId = classFromLabel(label)
    const row = { class_id: classId ?? 'custom', level }
    if (!classId) { row.custom_name = label; report.push(`classe "${label}" → classe livre`) }
    const hd = toInt(cur(`hitdietype${i}`))
    if (!classId && hd) row.hd = hd
    classes.push(row)
  }
  const castingStat = statFromRef(cur('spellcastingstat'))

  return db.transaction(() => {
    const created = repo.createCharacter({ ...fields, classes })
    const id = created.id
    const classRows = repo.listChildren('classes', id)
    const casters = classRows.filter(r => classDef(r).caster)
    if (castingStat && casters[0] && castingStat !== classDef(casters[0]).caster.ability) {
      repo.updateRow('character_classes', casters[0].id, { caster_ability: castingStat })
    }

    // BAB: se o Roll20 diverge do calculado (classes livres, homebrew), guarda como override
    const bab = toInt(cur('bab'))
    const sheetNow = computeSheet(repo.getSheet(id))
    if (bab != null && bab !== sheetNow.bab.computed) repo.updateRow('characters', id, { bab_override: bab })

    // Perícias
    const skillRows = repo.listChildren('skills', id)
    for (const s of SKILLS) {
      if (s.multi) continue
      const row = skillRows.find(r => r.skill_id === s.id)
      const ranks = toNum(cur(`${s.id}ranks`)), misc = toInt(cur(`${s.id}miscmod`)), cls = cur(`${s.id}classskill`)
      const patch = {}
      if (ranks) patch.ranks = ranks
      if (misc) patch.misc = misc
      if (cls != null && cls !== '') patch.class_skill = String(cls) === '1' ? 1 : 0
      if (row && Object.keys(patch).length) repo.updateRow('skills', row.id, patch)
    }
    for (const base of MULTI_SKILLS) {
      const row = skillRows.find(r => r.skill_id === base)
      for (let n = 1; n <= 3; n++) {
        const ranks = toNum(cur(`${base}${n}ranks`)), name = cur(`${base}${n}name`)
        if (!ranks && !name) continue
        const values = { ranks: ranks ?? 0, custom_name: name ? String(name) : null, misc: toInt(cur(`${base}${n}miscmod`)) ?? 0 }
        const cls = cur(`${base}${n}classskill`)
        if (cls != null && cls !== '') values.class_skill = String(cls) === '1' ? 1 : 0
        if (n === 1 && row) repo.updateRow('skills', row.id, values)
        else repo.insertRow('skills', { ...values, character_id: id, skill_id: base, position: 100 + n })
      }
    }
    for (const [rid, r] of Object.entries(repeating.skills ?? {})) {
      if (!r.otherskillname) continue
      consumeRow('skills', rid, ['otherskillname', 'otherskillranks', 'otherskillmiscmod', 'otherskillclassskill'])
      repo.insertRow('skills', {
        character_id: id, skill_id: `custom_${String(r.otherskillname).toLowerCase().replace(/\W+/g, '_')}`.slice(0, 40),
        custom_name: String(r.otherskillname), ranks: toNum(r.otherskillranks) ?? 0, misc: toInt(r.otherskillmiscmod) ?? 0,
        class_skill: String(r.otherskillclassskill) === '1' ? 1 : 0, position: 200,
      })
    }

    // Armadura, escudo e outros bônus de CA
    let pos = 0
    if (cur('acitem')) {
      repo.insertRow('items', {
        character_id: id, position: pos++, location: String(cur('armorworn')) === '1' ? 'armor' : 'backpack',
        name: String(cur('acitem')), ac_type: 'armor', ac_bonus: toInt(cur('acitembonus')) ?? 0,
        max_dex: toInt(cur('acitemdex')), acp: Math.abs(toInt(cur('acitemcheckpenalty')) ?? 0),
        spell_failure: toInt(cur('acitemspellfailure')), weight_lb: pounds(cur('acitemweight')) ?? 0,
      })
    }
    if (cur('shield')) {
      repo.insertRow('items', {
        character_id: id, position: pos++, location: String(cur('shieldworn')) === '1' ? 'offhand' : 'backpack',
        name: String(cur('shield')), ac_type: 'shield', ac_bonus: toInt(cur('shieldacbonus') ?? cur('shieldbonus')) ?? 0,
        acp: Math.abs(toInt(cur('shieldcheckpenalty')) ?? 0), spell_failure: toInt(cur('shieldspellfailure')),
        weight_lb: pounds(cur('shieldweight')) ?? 0,
      })
    }
    // Bônus de CA da área "outros" (abilityacN): a ficha não diz o tipo (pode ser atributo, magia temporária…),
    // então ficam guardados e o relatório avisa para ajustar à mão
    for (let n = 1; n <= 10; n++) {
      if (String(attrs.get(`abilityac${n}inuse`)?.current) !== '1') continue
      const name = attrs.get(`abilityac${n}name`)?.current || `abilityac${n}`
      const bonus = toInt(attrs.get(`abilityac${n}bonus`)?.current) ?? 0
      report.push(`bônus de CA "${name}" (${bonus >= 0 ? '+' : ''}${bonus}) não aplicado: a ficha não informa o tipo; ajuste na Defesa`)
    }
    const manualAc = {}
    for (const [type, prefix] of [['natural', 'naturalarmor'], ['deflection', 'deflection'], ['dodge', 'dodgebonus']]) {
      for (let n = 1; n <= 4; n++) {
        if (String(cur(`${prefix}${n}inuse`)) !== '1') continue
        manualAc[`ac_${type}`] = (manualAc[`ac_${type}`] ?? 0) + (toInt(cur(`${prefix}${n}bonus`)) ?? 0)
      }
    }
    if (Object.keys(manualAc).length) repo.updateRow('characters', id, manualAc)

    // Ataques
    for (const [rid, w] of Object.entries(repeating.weapons ?? {})) {
      if (!w.weaponname) continue
      consumeRow('weapons', rid, WEAPON_FIELDS.map(f => `weapon${f}`))
      insertWeapon(Object.fromEntries(WEAPON_FIELDS.map(f => [f, w[`weapon${f}`]])))
    }
    // Armas fixas da ficha (weapon1…10name etc.), usadas além da seção repetida
    for (let i = 1; i <= 10; i++) {
      if (!String(cur(`weapon${i}name`) ?? '').trim()) continue
      const w = Object.fromEntries(WEAPON_FIELDS.map(f => [f, cur(`weapon${i}${f}`)]))
      // Sem dado nos campos de dano, a ficha rola "statdamage" (ex.: "1d8"): só é lido nesse caso
      const statDamage = attrs.get(`weapon${i}statdamage`)?.current
      if (!(toInt(w.dicenumber) && toInt(w.dicetype)) && /^\s*\d+d\d+\s*$/i.test(String(statDamage ?? ''))) {
        read.add(`weapon${i}statdamage`)
        w.dice = String(statDamage).trim()
      }
      insertWeapon(w)
    }
    function insertWeapon(w) {
      const n = toInt(w.dicenumber), d = toInt(w.dicetype)
      const range = feet(w.range)
      const misc = toInt(w.focus) ?? 0, specialize = toInt(w.specialize) ?? 0
      if (misc || specialize) report.push(`arma "${w.name}": foco/especialização da ficha entraram como bônus manual de ataque/dano`)
      repo.insertRow('attacks', {
        character_id: id, position: pos++, name: String(w.name).trim(),
        kind: range || /ranged|dist/i.test(String(w.type ?? '')) ? 'ranged' : 'melee',
        ability: statFromRef(w.stat), enh: toInt(w.enh) ?? 0, misc, damage_dice: n && d ? `${n}d${d}` : w.dice ?? null,
        damage_ability: statFromRef(w.damagestat), damage_misc: (toInt(w.bonusdamage) ?? 0) + specialize,
        crit_range: toInt(w.critmin) ?? 20, crit_mult: toInt(w.critmult) ?? 2, range_ft: range,
        ammo: toInt(w.ammunition), notes: w.specialproperties ? String(w.specialproperties) : null,
      })
    }

    // Equipamento
    for (const [rid, e] of Object.entries(repeating.equipment ?? {})) {
      if (!e.equipmentname) continue
      consumeRow('equipment', rid, ['equipmentname', 'equipmentquantity', 'equipmentweight', 'equipmentcost', 'equipmentlocation', 'equipmentnotes'])
      repo.insertRow('items', {
        character_id: id, position: pos++, location: 'backpack', name: String(e.equipmentname),
        qty: toNum(e.equipmentquantity) ?? 1, weight_lb: pounds(e.equipmentweight) ?? 0,
        cost_gp: toNum(e.equipmentcost), notes: [e.equipmentlocation, e.equipmentnotes].filter(Boolean).join(' — ') || null,
      })
    }

    // Magias: seções repeating_spells<nível><aba>; aba 1 = divina, 2 = arcana (as outras abas e o
    // nível 10, que a ficha também tem, ficam em roll20_extra)
    for (const [section, rows] of Object.entries(repeating)) {
      const m = /^spells(\d{1,2})([12])$/.exec(section)
      if (!m || Number(m[1]) > 9) continue
      const level = Number(m[1]), tab = Number(m[2])
      const list = Object.keys(SPELL_TAB).find(k => SPELL_TAB[k] === tab)
      const caster = casters.find(c => classDef(c).caster.list === list) ?? casters[0]
      const tag = `${m[1]}${m[2]}`
      for (const [rid, r] of Object.entries(rows)) {
        const name = r[`spellname${tag}`]
        if (!name) continue
        // spelllevel vem do nome da seção; descrição, alcance etc. ficam em roll20_extra
        consumeRow(section, rid, ['spellname', 'spellschool', 'spellprep', 'spellused', 'spelllevel'].map(f => `${f}${tag}`))
        const spellId = repo.insertRow('spells', {
          character_id: id, class_row_id: caster?.id ?? null, level, name: String(name),
          school: r[`spellschool${tag}`] ? String(r[`spellschool${tag}`]) : null,
        })
        const prepCount = Math.min(20, toInt(r[`spellprep${tag}`]) ?? 0)
        const used = toInt(r[`spellused${tag}`]) ?? 0
        for (let k = 0; k < prepCount; k++) {
          repo.insertRow('spells_prepared', {
            character_id: id, spell_id: spellId, class_row_id: caster?.id ?? null, level, used: k < used ? 1 : 0,
          })
        }
      }
    }

    // Talentos: texto livre. Com linhas "-----", cada bloco é um talento (1ª linha = nome, resto = descrição);
    // sem elas, um por linha. O nome casa com a referência pelo começo da linha ("Precise Shot Nível 1…").
    const refFeats = [
      ...db.prepare("SELECT id, nome, nome_en, 'feat' AS kind FROM ref_talentos").all(),
      ...db.prepare("SELECT id, nome, NULL AS nome_en, 'flaw' AS kind FROM ref_falhas").all(),
    ]
    const featText = String(cur('feats') ?? '')
    const blocks = FEAT_SEPARATOR.test(featText)
      ? featText.split(FEAT_SEPARATOR).map(b => b.split(/\r?\n/).map(s => s.trim()).filter(Boolean)).filter(b => b.length)
      : featText.split(/\r?\n|;/).map(s => s.trim()).filter(Boolean).map(s => [s])
    const unmatched = []
    blocks.forEach(([header, ...rest], i) => {
      const match = matchFeat(refFeats, header)
      const name = (match ? header.slice(0, match.length) : header).slice(0, 200)
      const description = [match ? header.slice(match.length).trim() : '', ...rest].filter(Boolean).join('\n') || null
      if (!match) unmatched.push(name)
      repo.insertRow('feats', {
        character_id: id, position: i, name, ref_id: match?.ref.id ?? null, kind: match?.ref.kind ?? 'feat', description,
      })
    })
    if (unmatched.length) report.push(`talentos sem correspondência na referência: ${unmatched.join('; ')}`)

    // Contabilidade final: tudo que não foi lido nem é recalculado é guardado
    const extra = []
    const counts = { total: 0, read: 0, derived: 0, empty: 0, preserved: 0 }
    for (const a of data.attribs) {
      if (!a?.name) continue
      counts.total++
      if (read.has(a.name)) counts.read++
      else if (isDerivedAttr(a.name)) counts.derived++
      else if (a.current === '' || a.current == null || isFormula(a.current)) counts.empty++
      else {
        extra.push({ name: a.name, current: a.current, max: a.max ?? '' })
        counts.preserved++
      }
    }
    if (extra.length) repo.updateRow('characters', id, { roll20_extra: JSON.stringify(extra) })
    return { ...repo.getSheet(id), _import: { report, extraCount: extra.length, counts } }
  })()
}
