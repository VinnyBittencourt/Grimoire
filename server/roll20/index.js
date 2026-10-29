// Export/import de personagem no formato JSON de personagem do Roll20 usado pela extensão
// VTT Enhancement Suite (VTTES): { schema_version, name, bio, attribs: [{ name, current, max, id }], abilities }.
// O import também aceita o formato aninhado { character: { ... } }.
import { randomBytes } from 'crypto'
import { ABILITIES } from '../../shared/constants/abilities.js'
import { SKILLS, SKILL_BY_ID } from '../../shared/constants/skills.js'
import { computeSheet } from '../../shared/rules/sheet.js'
import { classDef } from '../../shared/rules/progression.js'
import { HttpError } from '../repo.js'
import {
  SIZE_TO_ROLL20, SIZE_FROM_ROLL20, ALIGNMENT_LABEL, alignmentFromLabel, classLabel, classFromLabel,
  statRef, statFromRef, MULTI_SKILLS, SIMPLE_FIELDS, INT_FIELDS, isMappedAttr,
} from './map.js'

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

  for (const [attr, field] of Object.entries(SIMPLE_FIELDS)) if (ch[field] != null && ch[field] !== '') set(attr, ch[field])
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
  }

  const classes = [...ch.classes].sort((a, b) => a.position - b.position)
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
    set('acitemweight', armor.weight_lb ?? 0); set('armorworn', 1)
  }
  if (shield) {
    set('shield', shield.name); set('shieldacbonus', shield.ac_bonus ?? 0)
    set('shieldcheckpenalty', -Math.abs(shield.acp ?? 0)); set('shieldspellfailure', shield.spell_failure ?? 0)
    set('shieldweight', shield.weight_lb ?? 0); set('shieldworn', 1)
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
    add('weaponcritmin', a.crit_range); add('weaponcritmult', a.crit_mult); add('weaponrange', a.range_ft ?? '')
    add('weaponbonusdamage', a.damage_misc); add('weaponspecialproperties', a.notes ?? '')
  }

  // Equipamento (tudo que não é armadura/escudo exportado acima)
  for (const it of ch.items) {
    if (it === armor || it === shield) continue
    const id = rowId()
    const add = (f, v) => attribs.push({ name: `repeating_equipment_${id}_${f}`, current: v ?? '', max: '', id: rowId() })
    add('equipmentname', it.name); add('equipmentquantity', it.qty); add('equipmentweight', it.weight_lb)
    add('equipmentlocation', it.location === 'backpack' ? '' : it.location); add('equipmentnotes', it.notes ?? '')
    if (it.cost_gp != null) add('equipmentcost', it.cost_gp)
  }

  // Conjuração: até duas classes conjuradoras (sufixo 1 e 2 das seções repeating_spells<nv><n>)
  sheet.casting.slice(0, 2).forEach((cast, ci) => {
    const suffix = ci + 1
    if (ci === 0) {
      set('casterlevel', cast.casterLevel)
      set('spellcastingstat', statRef(cast.ability))
      cast.perDay.forEach((v, L) => { if (v != null) set(`spells${L}`, v + cast.domain[L]) })
      cast.dc.forEach((v, L) => set(`spelldc${L}`, v))
    } else {
      set('casterlevel2', cast.casterLevel)
    }
    for (const sp of ch.spells.filter(s => s.class_row_id === cast.rowId)) {
      const id = rowId()
      const sec = `repeating_spells${sp.level}${suffix}`
      const tag = `${sp.level}${suffix}`
      const prepared = ch.prepared.filter(p => p.spell_id === sp.id)
      const add = (f, v) => attribs.push({ name: `${sec}_${id}_${f}${tag}`, current: v ?? '', max: '', id: rowId() })
      add('spellname', sp.name); add('spellschool', sp.school ?? ''); add('spelllevel', sp.level)
      if (prepared.length) { add('spellprep', prepared.length); add('spellused', prepared.filter(p => p.used).length) }
    }
  })

  set('feats', ch.feats.map(f => f.name).join('\n'))
  if (ch.background) set('bio', ch.background)

  // Atributos desconhecidos importados do Roll20 voltam intactos
  try {
    for (const extra of JSON.parse(ch.roll20_extra || '[]')) {
      if (!attribs.some(a => a.name === extra.name)) attribs.push({ ...extra, id: rowId() })
    }
  } catch { /* roll20_extra inválido: ignora */ }

  return {
    schema_version: 2,
    name: ch.name,
    avatar: '',
    bio: ch.background ?? '',
    gmnotes: '',
    defaulttoken: '',
    tags: '[]',
    controlledby: '',
    inplayerjournals: '',
    attribs,
    abilities: [],
  }
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

export function importRoll20(db, repo, payload) {
  const data = payload?.character ?? payload
  if (!data || !Array.isArray(data.attribs)) {
    throw new HttpError(400, 'invalid_format', 'Arquivo não parece um personagem Roll20 (falta "attribs")')
  }

  const attrs = new Map()
  const repeating = {}
  const extra = []
  for (const a of data.attribs) {
    if (!a?.name) continue
    const m = /^repeating_([^_]+)_(.{20})_(.+)$/.exec(a.name)
    if (m) {
      const [, section, rid, field] = m
      ;((repeating[section] ??= {})[rid] ??= {})[field] = a.current
      continue
    }
    attrs.set(a.name, a)
    if (!isMappedAttr(a.name) && a.current !== '' && a.current != null && !isFormula(a.current)) {
      extra.push({ name: a.name, current: a.current, max: a.max ?? '' })
    }
  }
  const cur = name => attrs.get(name)?.current
  const report = []

  // Personagem
  const fields = { name: String(cur('character_name') ?? data.name ?? 'Importado do Roll20').slice(0, 200) }
  for (const [attr, field] of Object.entries(SIMPLE_FIELDS)) {
    if (field === 'name') continue
    const v = cur(attr)
    if (v == null || v === '' || isFormula(v)) continue
    fields[field] = INT_FIELDS.has(field) ? toInt(v) ?? 0 : String(v)
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
  const bio = data.bio ?? cur('bio')
  if (bio) fields.background = String(bio)

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
        if (n === 1 && row) repo.updateRow('skills', row.id, values)
        else repo.insertRow('skills', { ...values, character_id: id, skill_id: base, position: 100 + n })
      }
    }
    for (const r of Object.values(repeating.skills ?? {})) {
      if (!r.otherskillname) continue
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
        spell_failure: toInt(cur('acitemspellfailure')), weight_lb: toNum(cur('acitemweight')) ?? 0,
      })
    }
    if (cur('shield')) {
      repo.insertRow('items', {
        character_id: id, position: pos++, location: String(cur('shieldworn')) === '1' ? 'offhand' : 'backpack',
        name: String(cur('shield')), ac_type: 'shield', ac_bonus: toInt(cur('shieldacbonus') ?? cur('shieldbonus')) ?? 0,
        acp: Math.abs(toInt(cur('shieldcheckpenalty')) ?? 0), spell_failure: toInt(cur('shieldspellfailure')),
        weight_lb: toNum(cur('shieldweight')) ?? 0,
      })
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
    for (const w of Object.values(repeating.weapons ?? {})) {
      if (!w.weaponname) continue
      const n = toInt(w.weapondicenumber), d = toInt(w.weapondicetype)
      const range = toInt(w.weaponrange)
      repo.insertRow('attacks', {
        character_id: id, position: pos++, name: String(w.weaponname), kind: range ? 'ranged' : 'melee',
        ability: statFromRef(w.weaponstat), enh: toInt(w.weaponenh) ?? 0, damage_dice: n && d ? `${n}d${d}` : null,
        damage_ability: statFromRef(w.weapondamagestat), damage_misc: toInt(w.weaponbonusdamage) ?? 0,
        crit_range: toInt(w.weaponcritmin) ?? 20, crit_mult: toInt(w.weaponcritmult) ?? 2, range_ft: range,
        notes: w.weaponspecialproperties ? String(w.weaponspecialproperties) : null,
      })
    }

    // Equipamento
    for (const e of Object.values(repeating.equipment ?? {})) {
      if (!e.equipmentname) continue
      repo.insertRow('items', {
        character_id: id, position: pos++, location: 'backpack', name: String(e.equipmentname),
        qty: toNum(e.equipmentquantity) ?? 1, weight_lb: toNum(e.equipmentweight) ?? 0,
        cost_gp: toNum(e.equipmentcost), notes: [e.equipmentlocation, e.equipmentnotes].filter(Boolean).join(' — ') || null,
      })
    }

    // Magias: seções repeating_spells<nível><1|2>
    for (const [section, rows] of Object.entries(repeating)) {
      const m = /^spells(\d)([12])$/.exec(section)
      if (!m) continue
      const level = Number(m[1]), caster = casters[Number(m[2]) - 1] ?? casters[0]
      const tag = `${level}${m[2]}`
      for (const r of Object.values(rows)) {
        const name = r[`spellname${tag}`]
        if (!name) continue
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

    // Talentos: texto livre, um por linha
    String(cur('feats') ?? '').split(/\r?\n|;/).map(s => s.trim()).filter(Boolean).forEach((name, i) => {
      const ref = db.prepare('SELECT id FROM ref_talentos WHERE lower(nome) = lower(?) OR lower(nome_en) = lower(?)').get(name, name)
      repo.insertRow('feats', { character_id: id, position: i, name, ref_id: ref?.id ?? null })
    })

    if (extra.length) repo.updateRow('characters', id, { roll20_extra: JSON.stringify(extra) })
    return { ...repo.getSheet(id), _import: { report, extraCount: extra.length } }
  })()
}
