// Mapeamento Grimoire ↔ ficha Roll20 "D&D_3-5" (Roll20/roll20-character-sheets, charsheet_3-5.html).
// A versão pt-br da ficha usa os mesmos nomes de atributo para os campos centrais.
import { ABILITIES } from '../../shared/constants/abilities.js'
import { SIZES } from '../../shared/constants/sizes.js'
import { CLASS_IDS, CLASS_FROM_V1 } from '../../shared/constants/classes.js'

// <select name="attr_size">: o valor é o modificador de tamanho
export const SIZE_TO_ROLL20 = Object.fromEntries(Object.entries(SIZES).map(([id, s]) => [id, String(s.mod)]))
export const SIZE_FROM_ROLL20 = Object.fromEntries(Object.entries(SIZES).map(([id, s]) => [String(s.mod), id]))

export const ALIGNMENT_LABEL = {
  lg: 'Lawful Good', ng: 'Neutral Good', cg: 'Chaotic Good', ln: 'Lawful Neutral', n: 'True Neutral',
  cn: 'Chaotic Neutral', le: 'Lawful Evil', ne: 'Neutral Evil', ce: 'Chaotic Evil',
}
const ALIGNMENT_ALIASES = { neutral: 'n', 'neutral neutral': 'n', 'neutro': 'n' }

export function alignmentFromLabel(label) {
  const k = String(label ?? '').trim().toLowerCase()
  if (!k) return null
  const hit = Object.entries(ALIGNMENT_LABEL).find(([, v]) => v.toLowerCase() === k)
  if (hit) return hit[0]
  if (ALIGNMENT_ALIASES[k]) return ALIGNMENT_ALIASES[k]
  const short = k.replace(/[^a-z]/g, '')
  return Object.keys(ALIGNMENT_LABEL).includes(short) ? short : null
}

export const classLabel = id => id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

export function classFromLabel(label) {
  const raw = String(label ?? '').trim()
  if (!raw) return null
  if (CLASS_FROM_V1[raw]) return CLASS_FROM_V1[raw]
  const k = raw.toLowerCase().replace(/\s+/g, '_')
  return CLASS_IDS.includes(k) ? k : null
}

// Valores dos <select> de atributo das armas e da conjuração ("@{str-mod} ")
export const statRef = ab => (ab ? `@{${ab}-mod} ` : '0')
export function statFromRef(v) {
  const m = /^@\{(\w+)-mod\}\s*$/.exec(String(v ?? ''))
  return m && ABILITIES.includes(m[1]) ? m[1] : null
}

// Perícias com especialização: craft1..3, perform1..3, profession1..3 (+ <base>Nname)
export const MULTI_SKILLS = ['craft', 'perform', 'profession']

// Campos simples (sem cálculo) — usados nos dois sentidos
export const SIMPLE_FIELDS = {
  character_name: 'name',
  deity: 'deity', gender: 'gender', age: 'age', height: 'height', weight: 'weight',
  eyes: 'eyes', hair: 'hair', skin: 'skin', languages: 'languages',
  speed: 'speed_ft', expcurrent: 'xp',
  copper: 'cp', silver: 'sp', gold: 'gp', platinum: 'pp',
  temphp: 'hp_temp', nonlethaldamage: 'nonlethal',
  initmiscmod: 'init_misc', grapplemiscmod: 'grapple_misc', acmiscmod: 'ac_misc',
  spellresistance: 'sr', damagereduction: 'dr',
}

export const INT_FIELDS = new Set(['speed_ft', 'xp', 'cp', 'sp', 'gp', 'pp', 'hp_temp', 'nonlethal', 'init_misc', 'grapple_misc', 'ac_misc', 'sr'])

// Atributos que o export escreve e o import lê explicitamente (o resto vai para roll20_extra)
export function isMappedAttr(name) {
  if (name in SIMPLE_FIELDS) return true
  if (/^(str|dex|con|int|wis|cha)-(base|equi|misc|temp)$/.test(name)) return true
  if (/^(class|level|hitdietype)\d+$/.test(name)) return true
  if (/^(fortitude|reflex|will)(base|magicmod|miscmod|tempmod)$/.test(name)) return true
  if (/^spells\d$|^spelldc\d$/.test(name)) return true
  if (/^(acitem|shield)/.test(name) || /^(armorworn|shieldworn)$/.test(name)) return true
  if (/^(naturalarmor|deflection|dodgebonus)\d(bonus|name|inuse)$/.test(name)) return true
  if (/(ranks|classskill|miscmod)$/.test(name)) return true
  if (/^(craft|perform|profession)\dname$/.test(name)) return true
  return ['hitpoints', 'race', 'alignment', 'size', 'bab', 'casterlevel', 'spellcastingstat', 'feats', 'bio'].includes(name)
}
