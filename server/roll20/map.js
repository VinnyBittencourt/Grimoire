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
// Tendência em texto livre (en ou pt): cada palavra vira um eixo — ordem/caos e bem/mal
const ALIGNMENT_WORDS = {
  lawful: 'l', leal: 'l', chaotic: 'c', caotico: 'c', neutral: 'n', neutro: 'n', true: 'n', verdadeiro: 'n',
  good: 'g', bom: 'g', evil: 'e', mau: 'e', mal: 'e',
}
const plain = s => String(s ?? '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export function alignmentFromLabel(label) {
  const k = plain(label)
  if (!k) return null
  const hit = Object.entries(ALIGNMENT_LABEL).find(([, v]) => v.toLowerCase() === k)
  if (hit) return hit[0]
  const short = k.replace(/[^a-z]/g, '')
  if (Object.keys(ALIGNMENT_LABEL).includes(short)) return short
  const axes = k.split(/[^a-z]+/).map(w => ALIGNMENT_WORDS[w]).filter(Boolean).join('')
  if (axes === 'n' || axes === 'nn') return 'n'
  return Object.keys(ALIGNMENT_LABEL).includes(axes) ? axes : null
}

export const classLabel = id => id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

// Rótulos que aparecem em fichas reais e não são o nome da classe (ex.: "Mage" no export de 2026-10-29)
const CLASS_ALIASES = { mage: 'wizard' }
const CLASS_FROM_V1_PLAIN = Object.fromEntries(Object.entries(CLASS_FROM_V1).map(([k, v]) => [plain(k), v]))

export function classFromLabel(label) {
  const raw = String(label ?? '').trim()
  if (!raw) return null
  const k = plain(raw)
  if (CLASS_FROM_V1_PLAIN[k]) return CLASS_FROM_V1_PLAIN[k]
  if (CLASS_ALIASES[k]) return CLASS_ALIASES[k]
  const id = k.replace(/\s+/g, '_')
  return CLASS_IDS.includes(id) ? id : null
}

// Aba de magias da ficha: repeating_spells<nível><aba>, 1 = divina, 2 = arcana
export const SPELL_TAB = { divine: 1, arcane: 2 }

// Unidades da ficha: com lengthunit/weightunit métricos, deslocamento, alcance e pesos ficam no valor
// mostrado (9 = 9 m). lengthscale/weightscale convertem de pés/libras para essa unidade.
export function unitScale(v) {
  const s = parseFloat(String(v ?? '').replace(',', '.'))
  return Number.isFinite(s) && s > 0 && s <= 10 ? s : 1
}

// Codificação da bio no export da VTTES (escape(): %3Cp%3E, %E3 = ã)
export function decodeBio(s) {
  const text = String(s ?? '')
  if (!/%[0-9a-f]{2}|%u[0-9a-f]{4}/i.test(text) || /[<>]/.test(text)) return text
  try { return unescape(text) } catch { return text }
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

// Atributos que o Grimoire recalcula a partir dos próprios dados: o import não os guarda
// (o export os escreve de novo com o valor calculado). Todo o resto que o import não lê vai
// para roll20_extra — ver importRoll20.
export function isDerivedAttr(name) {
  if (/^(fortitude|reflex|will)base$/.test(name)) return true // progressão das classes
  if (/^(arcane|divine)?(spells\d|spelldc\d|casterlevel)$|^casterlevel2$/.test(name)) return true // conjuração
  if (/^hitdietype\d+$/.test(name)) return true // DV da classe (lido só para classe livre)
  // Totais que a própria ficha calcula: o export escreve atributos e nível de novo; os outros a ficha refaz
  if (/^(str|dex|con|int|wis|cha)(-mod)?$|^level$|^encumbrstr$/.test(name)) return true
  if (/^totSkillPoint\d*$|^unspentSkillPoints$|^total(equipment(weight|cost)|carriedweight)$/.test(name)) return true
  return /^repeating_equipment_.{20}_equipmenttotal(weight|cost)$/.test(name)
}
