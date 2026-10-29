import { KNOWLEDGE_SKILLS } from './skills.js'

// Mecânica das classes D&D 3.5. Descrições e habilidades textuais ficam em ref_classes
// (src/db/referenceData.js, mesmo id). Labels traduzidos ficam no i18n (`classes.<id>`).
//
// bab:   'good' (= nível) | 'avg' (⌊3n/4⌋) | 'poor' (⌊n/2⌋)
// saves: 'good' (2 + ⌊n/2⌋) | 'poor' (⌊n/3⌋)
// sp:    pontos de perícia por nível (antes do mod. de Int)
// skills: perícias de classe (só PHB; nas demais o jogador marca na ficha)
// caster: conjuração da classe — ver shared/constants/spellTables.js
//   type 'prepared' | 'spontaneous'; ability = atributo padrão (pode ser trocado por personagem,
//   ex.: Dynamic Priest usa Car); table = id da tabela por dia; known = tabela de conhecidas;
//   domain = ganha 1 slot de domínio por nível de magia; half = nível de conjurador = ⌊n/2⌋
const ALL_KNOWLEDGE = KNOWLEDGE_SKILLS

export const CLASSES = {
  // ── PHB ───────────────────────────────────────────────────────────────────
  barbarian: { book: 'PHB', hd: 12, bab: 'good', saves: { fort: 'good', ref: 'poor', will: 'poor' }, sp: 4,
    skills: ['climb', 'craft', 'handleanimal', 'intimidate', 'jump', 'listen', 'ride', 'survival', 'swim'] },
  bard: { book: 'PHB', hd: 6, bab: 'avg', saves: { fort: 'poor', ref: 'good', will: 'good' }, sp: 6,
    skills: ['appraise', 'balance', 'bluff', 'climb', 'concentration', 'craft', 'decipherscript', 'diplomacy',
      'disguise', 'escapeartist', 'gatherinformation', 'hide', 'jump', ...ALL_KNOWLEDGE, 'listen', 'movesilent',
      'perform', 'profession', 'sensemotive', 'sleightofhand', 'spellcraft', 'swim', 'tumble', 'usemagicdevice'],
    caster: { type: 'spontaneous', ability: 'cha', list: 'arcane', table: 'bard', known: 'bard' } },
  cleric: { book: 'PHB', hd: 8, bab: 'avg', saves: { fort: 'good', ref: 'poor', will: 'good' }, sp: 2,
    skills: ['concentration', 'craft', 'diplomacy', 'heal', 'knowarcana', 'knowhistory', 'knowreligion',
      'knowplanes', 'profession', 'spellcraft'],
    caster: { type: 'prepared', ability: 'wis', list: 'divine', table: 'full', domain: true } },
  druid: { book: 'PHB', hd: 8, bab: 'avg', saves: { fort: 'good', ref: 'poor', will: 'good' }, sp: 4,
    skills: ['concentration', 'craft', 'diplomacy', 'handleanimal', 'heal', 'knownature', 'listen', 'profession',
      'ride', 'spellcraft', 'spot', 'survival', 'swim'],
    caster: { type: 'prepared', ability: 'wis', list: 'divine', table: 'full' } },
  fighter: { book: 'PHB', hd: 10, bab: 'good', saves: { fort: 'good', ref: 'poor', will: 'poor' }, sp: 2,
    skills: ['climb', 'craft', 'handleanimal', 'intimidate', 'jump', 'ride', 'swim'] },
  monk: { book: 'PHB', hd: 8, bab: 'avg', saves: { fort: 'good', ref: 'good', will: 'good' }, sp: 4,
    skills: ['balance', 'climb', 'concentration', 'craft', 'diplomacy', 'escapeartist', 'hide', 'jump',
      'knowarcana', 'knowreligion', 'listen', 'movesilent', 'perform', 'profession', 'sensemotive', 'spot',
      'swim', 'tumble'] },
  paladin: { book: 'PHB', hd: 10, bab: 'good', saves: { fort: 'good', ref: 'poor', will: 'poor' }, sp: 2,
    skills: ['concentration', 'craft', 'diplomacy', 'handleanimal', 'heal', 'knownobility', 'knowreligion',
      'profession', 'ride', 'sensemotive'],
    caster: { type: 'prepared', ability: 'wis', list: 'divine', table: 'half', half: true } },
  ranger: { book: 'PHB', hd: 8, bab: 'good', saves: { fort: 'good', ref: 'good', will: 'poor' }, sp: 6,
    skills: ['climb', 'concentration', 'craft', 'handleanimal', 'heal', 'hide', 'jump', 'knowdungeon',
      'knowgeography', 'knownature', 'listen', 'movesilent', 'profession', 'ride', 'search', 'spot', 'survival',
      'swim', 'userope'],
    caster: { type: 'prepared', ability: 'wis', list: 'divine', table: 'half', half: true } },
  rogue: { book: 'PHB', hd: 6, bab: 'avg', saves: { fort: 'poor', ref: 'good', will: 'poor' }, sp: 8,
    skills: ['appraise', 'balance', 'bluff', 'climb', 'craft', 'decipherscript', 'diplomacy', 'disabledevice',
      'disguise', 'escapeartist', 'forgery', 'gatherinformation', 'hide', 'intimidate', 'jump', 'knowlocal',
      'listen', 'movesilent', 'openlock', 'perform', 'profession', 'search', 'sensemotive', 'sleightofhand',
      'spot', 'swim', 'tumble', 'usemagicdevice', 'userope'] },
  sorcerer: { book: 'PHB', hd: 4, bab: 'poor', saves: { fort: 'poor', ref: 'poor', will: 'good' }, sp: 2,
    skills: ['bluff', 'concentration', 'craft', 'knowarcana', 'profession', 'spellcraft'],
    caster: { type: 'spontaneous', ability: 'cha', list: 'arcane', table: 'sorcerer', known: 'sorcerer' } },
  wizard: { book: 'PHB', hd: 4, bab: 'poor', saves: { fort: 'poor', ref: 'poor', will: 'good' }, sp: 2,
    skills: ['concentration', 'craft', 'decipherscript', ...ALL_KNOWLEDGE, 'profession', 'spellcraft'],
    caster: { type: 'prepared', ability: 'int', list: 'arcane', table: 'full' } },

  // ── Suplementos (perícias de classe marcadas na ficha; conjuração manual por enquanto) ──
  hexblade:     { book: 'Complete Warrior', hd: 10, bab: 'good', saves: { fort: 'good', ref: 'poor', will: 'good' }, sp: 2 },
  swashbuckler: { book: 'Complete Warrior', hd: 10, bab: 'good', saves: { fort: 'good', ref: 'good', will: 'poor' }, sp: 4 },
  warlock:      { book: 'Complete Arcane', hd: 6, bab: 'avg', saves: { fort: 'poor', ref: 'poor', will: 'good' }, sp: 2 },
  warmage:      { book: 'Complete Arcane', hd: 6, bab: 'avg', saves: { fort: 'poor', ref: 'poor', will: 'good' }, sp: 2,
    caster: { type: 'spontaneous', ability: 'cha', list: 'arcane', table: null } },
  favored_soul: { book: 'Complete Divine', hd: 8, bab: 'avg', saves: { fort: 'good', ref: 'good', will: 'good' }, sp: 2,
    caster: { type: 'spontaneous', ability: 'cha', list: 'divine', table: null } },
  ninja:        { book: 'Complete Adventurer', hd: 6, bab: 'avg', saves: { fort: 'poor', ref: 'good', will: 'good' }, sp: 6 },
  scout:        { book: 'Complete Adventurer', hd: 8, bab: 'avg', saves: { fort: 'poor', ref: 'good', will: 'poor' }, sp: 8 },
  duskblade:    { book: 'PHB II', hd: 8, bab: 'good', saves: { fort: 'good', ref: 'poor', will: 'good' }, sp: 2,
    caster: { type: 'spontaneous', ability: 'int', list: 'arcane', table: null } },
  beguiler:     { book: 'PHB II', hd: 6, bab: 'avg', saves: { fort: 'poor', ref: 'poor', will: 'good' }, sp: 6,
    caster: { type: 'spontaneous', ability: 'int', list: 'arcane', table: null } },
  knight:       { book: 'PHB II', hd: 12, bab: 'good', saves: { fort: 'good', ref: 'poor', will: 'good' }, sp: 2 },
  artificer:    { book: 'Eberron', hd: 6, bab: 'avg', saves: { fort: 'good', ref: 'poor', will: 'good' }, sp: 4 },
  crusader:     { book: 'Tome of Battle', hd: 10, bab: 'good', saves: { fort: 'good', ref: 'poor', will: 'good' }, sp: 4 },
  swordsage:    { book: 'Tome of Battle', hd: 8, bab: 'avg', saves: { fort: 'poor', ref: 'good', will: 'good' }, sp: 6 },
  warblade:     { book: 'Tome of Battle', hd: 12, bab: 'good', saves: { fort: 'good', ref: 'poor', will: 'poor' }, sp: 4 },

  // ── Prestígio (DMG). A progressão de conjuração é apontada pelo jogador em character_classes ──
  arcane_archer:    { book: 'DMG', prestige: true, hd: 8, bab: 'good', saves: { fort: 'good', ref: 'good', will: 'poor' }, sp: 4 },
  arcane_trickster: { book: 'DMG', prestige: true, hd: 4, bab: 'poor', saves: { fort: 'poor', ref: 'good', will: 'good' }, sp: 4 },
  assassin:         { book: 'DMG', prestige: true, hd: 6, bab: 'avg', saves: { fort: 'poor', ref: 'good', will: 'poor' }, sp: 4 },
  blackguard:       { book: 'DMG', prestige: true, hd: 10, bab: 'good', saves: { fort: 'good', ref: 'poor', will: 'poor' }, sp: 2 },
  dragon_disciple:  { book: 'DMG', prestige: true, hd: 12, bab: 'avg', saves: { fort: 'good', ref: 'poor', will: 'good' }, sp: 2 },
  duelist:          { book: 'DMG', prestige: true, hd: 10, bab: 'good', saves: { fort: 'poor', ref: 'good', will: 'poor' }, sp: 4 },
  eldritch_knight:  { book: 'DMG', prestige: true, hd: 6, bab: 'good', saves: { fort: 'good', ref: 'poor', will: 'poor' }, sp: 2 },
  mystic_theurge:   { book: 'DMG', prestige: true, hd: 4, bab: 'poor', saves: { fort: 'poor', ref: 'poor', will: 'good' }, sp: 2 },
  shadowdancer:     { book: 'DMG', prestige: true, hd: 8, bab: 'avg', saves: { fort: 'poor', ref: 'good', will: 'poor' }, sp: 6 },
  loremaster:       { book: 'DMG', prestige: true, hd: 4, bab: 'poor', saves: { fort: 'poor', ref: 'poor', will: 'good' }, sp: 4 },

  // Classe livre: dado de vida e progressões vêm das colunas de override em character_classes
  custom: { book: null, hd: 8, bab: 'avg', saves: { fort: 'poor', ref: 'poor', will: 'poor' }, sp: 2 },
}

export const CLASS_IDS = Object.keys(CLASSES)

// Nomes de classe do v1 (pt, salvos como texto) → id. Classes sem equivalente viram 'custom'.
export const CLASS_FROM_V1 = {
  'Bárbaro': 'barbarian', 'Bardo': 'bard', 'Clérigo': 'cleric', 'Druida': 'druid',
  'Explorador': 'ranger', 'Patrulheiro': 'ranger', 'Feiticeiro': 'sorcerer', 'Guerreiro': 'fighter',
  'Ladino': 'rogue', 'Mago': 'wizard', 'Monge': 'monk', 'Paladino': 'paladin',
  'Hexblade': 'hexblade', 'Swashbuckler': 'swashbuckler', 'Warlock': 'warlock', 'Warmage': 'warmage',
  'Alma Favorita': 'favored_soul', 'Ninja': 'ninja', 'Scout': 'scout', 'Duskblade': 'duskblade',
  'Knight': 'knight', 'Beguiler': 'beguiler', 'Crusader': 'crusader', 'Swordsage': 'swordsage',
  'Warblade': 'warblade', 'Artificer': 'artificer',
}

// ids antigos de ref_classes (pt) → id novo
export const REF_CLASS_ID_FROM_V1 = {
  barbaro: 'barbarian', bardo: 'bard', clerigo: 'cleric', druida: 'druid', guerreiro: 'fighter',
  monge: 'monk', paladino: 'paladin', ladino: 'rogue', feiticeiro: 'sorcerer', mago: 'wizard',
}
