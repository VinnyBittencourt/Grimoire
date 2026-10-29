// Perícias do PHB 3.5. O id é o mesmo prefixo de atributo da ficha Roll20 D&D_3-5
// (`<id>ranks`, `<id>classskill`, `<id>miscmod`), o que simplifica o import/export.
// acp: 1 = sofre penalidade de armadura, 2 = penalidade dobrada (Natação)
// multi: perícia com especialização (Ofício, Atuação, Profissão) — até 3 entradas no Roll20
export const SKILLS = [
  { id: 'appraise',          ability: 'int' },
  { id: 'balance',           ability: 'dex', acp: 1 },
  { id: 'bluff',             ability: 'cha' },
  { id: 'climb',             ability: 'str', acp: 1 },
  { id: 'concentration',     ability: 'con' },
  { id: 'craft',             ability: 'int', multi: true },
  { id: 'decipherscript',    ability: 'int', trained: true },
  { id: 'diplomacy',         ability: 'cha' },
  { id: 'disabledevice',     ability: 'int', trained: true },
  { id: 'disguise',          ability: 'cha' },
  { id: 'escapeartist',      ability: 'dex', acp: 1 },
  { id: 'forgery',           ability: 'int' },
  { id: 'gatherinformation', ability: 'cha' },
  { id: 'handleanimal',      ability: 'cha', trained: true },
  { id: 'heal',              ability: 'wis' },
  { id: 'hide',              ability: 'dex', acp: 1, size: true },
  { id: 'intimidate',        ability: 'cha' },
  { id: 'jump',              ability: 'str', acp: 1 },
  { id: 'knowarcana',        ability: 'int', trained: true, knowledge: true },
  { id: 'knowengineer',      ability: 'int', trained: true, knowledge: true },
  { id: 'knowdungeon',       ability: 'int', trained: true, knowledge: true },
  { id: 'knowgeography',     ability: 'int', trained: true, knowledge: true },
  { id: 'knowhistory',       ability: 'int', trained: true, knowledge: true },
  { id: 'knowlocal',         ability: 'int', trained: true, knowledge: true },
  { id: 'knownature',        ability: 'int', trained: true, knowledge: true },
  { id: 'knownobility',      ability: 'int', trained: true, knowledge: true },
  { id: 'knowreligion',      ability: 'int', trained: true, knowledge: true },
  { id: 'knowplanes',        ability: 'int', trained: true, knowledge: true },
  { id: 'listen',            ability: 'wis' },
  { id: 'movesilent',        ability: 'dex', acp: 1 },
  { id: 'openlock',          ability: 'dex', trained: true },
  { id: 'perform',           ability: 'cha', multi: true },
  { id: 'profession',        ability: 'wis', trained: true, multi: true },
  { id: 'ride',              ability: 'dex' },
  { id: 'search',            ability: 'int' },
  { id: 'sensemotive',       ability: 'wis' },
  { id: 'sleightofhand',     ability: 'dex', acp: 1, trained: true },
  { id: 'spellcraft',        ability: 'int', trained: true },
  { id: 'spot',              ability: 'wis' },
  { id: 'survival',          ability: 'wis' },
  { id: 'swim',              ability: 'str', acp: 2 },
  { id: 'tumble',            ability: 'dex', acp: 1, trained: true },
  { id: 'usemagicdevice',    ability: 'cha', trained: true },
  { id: 'userope',           ability: 'dex' },
]

export const SKILL_BY_ID = Object.fromEntries(SKILLS.map(s => [s.id, s]))

export const KNOWLEDGE_SKILLS = SKILLS.filter(s => s.knowledge).map(s => s.id)

// Sinergias do PHB (5 graduações na origem → +2 no destino).
// Só as incondicionais; as situacionais (ex.: Ofício → Avaliação do mesmo tipo) ficam de fora.
export const SYNERGIES = [
  ['bluff', 'diplomacy'], ['bluff', 'intimidate'], ['bluff', 'sleightofhand'],
  ['handleanimal', 'ride'], ['jump', 'tumble'], ['knowarcana', 'spellcraft'],
  ['knowlocal', 'gatherinformation'], ['knownobility', 'diplomacy'],
  ['sensemotive', 'diplomacy'], ['tumble', 'balance'], ['tumble', 'jump'],
  ['escapeartist', 'userope'], ['userope', 'climb'], ['decipherscript', 'usemagicdevice'],
  ['spellcraft', 'usemagicdevice'],
]

// Nomes pt usados nos efeitos de talentos (featsData.json, campo `alvo`) → id
export const SKILL_FROM_PT = {
  'Avaliação': 'appraise', 'Equilíbrio': 'balance', 'Blefar': 'bluff', 'Escalar': 'climb',
  'Concentração': 'concentration', 'Ofícios': 'craft', 'Ofício': 'craft',
  'Decifrar Escrita': 'decipherscript', 'Diplomacia': 'diplomacy',
  'Operar Mecanismo': 'disabledevice', 'Abrir Fechaduras': 'openlock', 'Disfarce': 'disguise',
  'Escapar da Prisão': 'escapeartist', 'Falsificação': 'forgery',
  'Obter Informação': 'gatherinformation', 'Reunir Informações': 'gatherinformation',
  'Lidar com Animais': 'handleanimal', 'Cura': 'heal', 'Esconder-se': 'hide', 'Esconder': 'hide',
  'Intimidação': 'intimidate', 'Intimidar': 'intimidate', 'Saltar': 'jump',
  'Ouvir': 'listen', 'Furtividade': 'movesilent', 'Mover em Silêncio': 'movesilent',
  'Atuação': 'perform', 'Profissão': 'profession', 'Cavalgar': 'ride', 'Montar': 'ride',
  'Procurar': 'search', 'Sentir Motivação': 'sensemotive', 'Prestidigitação': 'sleightofhand',
  'Identificar Magia': 'spellcraft', 'Observar': 'spot', 'Sobrevivência': 'survival',
  'Natação': 'swim', 'Nadar': 'swim', 'Acrobacia': 'tumble',
  'Usar Instrumento Mágico': 'usemagicdevice', 'Usar Cordas': 'userope',
  'Desviar Dispositivos': 'disabledevice', 'Decifrar Escritas': 'decipherscript',
  'Uso de Dispositivo Mágico': 'usemagicdevice', 'Abrir Fechadura': 'openlock',
}
// Alvos situacionais (ex.: "Procurar (armadilhas)", "Sobrevivência (frio)") ficam fora deste
// mapa de propósito: não entram no total, aparecem só como nota do talento.
