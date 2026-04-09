// Tabelas de progressão de magias D&D 3.5 por classe
// Formato: nível do personagem → [slots de nível 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
// null = não tem acesso a magias desse nível

export const CLASSES_DND = [
  // Classes base (Player's Handbook)
  'Bárbaro', 'Bardo', 'Clérigo', 'Druida', 'Explorador',
  'Feiticeiro', 'Guerreiro', 'Ladino', 'Mago', 'Monge',
  'Paladino', 'Patrulheiro',
  // Complete Warrior
  'Feiticeiro de Guerra', 'Hexblade', 'Samurai', 'Swashbuckler',
  // Complete Arcane
  'Warlock', 'Warmage', 'Mago de Batalha',
  // Complete Adventurer
  'Ninja', 'Scout', 'Spellthief',
  // Complete Divine
  'Alma Favorita', 'Xamã do Espírito',
  // Player's Handbook II
  'Duskblade', 'Knight', 'Beguiler', 'Dragon Shaman',
  // Tome of Battle
  'Crusader', 'Swordsage', 'Warblade',
  // Dungeonscape
  'Factotum',
  // Miniatures Handbook
  'Healer', 'Marshal',
  // Eberron
  'Artificer',
  // Psionics
  'Psion', 'Psychic Warrior', 'Soulknife', 'Wilder',
  // Outros
  'Sage Fighter', 'Outro',
]

export const CLASSES_COM_MAGIA = ['Bardo', 'Clérigo', 'Druida', 'Feiticeiro', 'Mago', 'Paladino', 'Patrulheiro', 'Explorador']

// Atributo primário de magia por classe
export const ATRIBUTO_MAGICO = {
  'Bardo': 'car',
  'Clérigo': 'sab',
  'Druida': 'sab',
  'Feiticeiro': 'car',
  'Mago': 'int',
  'Paladino': 'sab',
  'Patrulheiro': 'sab',
  'Explorador': 'sab',
}

// Tabelas de slots por nível de personagem
// Índice 0 = nível 1 do personagem
// Cada array interna: [nv0, nv1, nv2, nv3, nv4, nv5, nv6, nv7, nv8, nv9]
export const SPELL_SLOTS = {
  'Clérigo': [
    [3,1,0,0,0,0,0,0,0,0],
    [4,2,0,0,0,0,0,0,0,0],
    [4,2,1,0,0,0,0,0,0,0],
    [5,3,2,0,0,0,0,0,0,0],
    [5,3,2,1,0,0,0,0,0,0],
    [5,3,3,2,0,0,0,0,0,0],
    [6,4,3,2,1,0,0,0,0,0],
    [6,4,3,3,2,0,0,0,0,0],
    [6,4,4,3,2,1,0,0,0,0],
    [6,4,4,3,3,2,0,0,0,0],
    [6,5,4,4,3,2,1,0,0,0],
    [6,5,4,4,3,3,2,0,0,0],
    [6,5,5,4,4,3,2,1,0,0],
    [6,5,5,4,4,3,3,2,0,0],
    [6,5,5,5,4,4,3,2,1,0],
    [6,5,5,5,4,4,3,3,2,0],
    [6,5,5,5,5,4,4,3,2,1],
    [6,5,5,5,5,4,4,3,3,2],
    [6,5,5,5,5,5,4,4,3,3],
    [6,5,5,5,5,5,4,4,4,4],
  ],
  'Mago': [
    [3,1,0,0,0,0,0,0,0,0],
    [4,2,0,0,0,0,0,0,0,0],
    [4,2,1,0,0,0,0,0,0,0],
    [4,3,2,0,0,0,0,0,0,0],
    [4,3,2,1,0,0,0,0,0,0],
    [4,3,3,2,0,0,0,0,0,0],
    [4,4,3,2,1,0,0,0,0,0],
    [4,4,3,3,2,0,0,0,0,0],
    [4,4,4,3,2,1,0,0,0,0],
    [4,4,4,3,3,2,0,0,0,0],
    [4,4,4,4,3,2,1,0,0,0],
    [4,4,4,4,3,3,2,0,0,0],
    [4,4,4,4,4,3,2,1,0,0],
    [4,4,4,4,4,3,3,2,0,0],
    [4,4,4,4,4,4,3,2,1,0],
    [4,4,4,4,4,4,3,3,2,0],
    [4,4,4,4,4,4,4,3,2,1],
    [4,4,4,4,4,4,4,3,3,2],
    [4,4,4,4,4,4,4,4,3,3],
    [4,4,4,4,4,4,4,4,4,4],
  ],
  'Feiticeiro': [
    [5,3,0,0,0,0,0,0,0,0],
    [6,4,0,0,0,0,0,0,0,0],
    [6,5,0,0,0,0,0,0,0,0],
    [6,6,3,0,0,0,0,0,0,0],
    [6,6,4,0,0,0,0,0,0,0],
    [6,6,5,3,0,0,0,0,0,0],
    [6,6,6,4,0,0,0,0,0,0],
    [6,6,6,5,3,0,0,0,0,0],
    [6,6,6,6,4,0,0,0,0,0],
    [6,6,6,6,5,3,0,0,0,0],
    [6,6,6,6,6,4,0,0,0,0],
    [6,6,6,6,6,5,3,0,0,0],
    [6,6,6,6,6,6,4,0,0,0],
    [6,6,6,6,6,6,5,3,0,0],
    [6,6,6,6,6,6,6,4,0,0],
    [6,6,6,6,6,6,6,5,3,0],
    [6,6,6,6,6,6,6,6,4,0],
    [6,6,6,6,6,6,6,6,5,3],
    [6,6,6,6,6,6,6,6,6,4],
    [6,6,6,6,6,6,6,6,6,6],
  ],
  'Druida': [
    [3,1,0,0,0,0,0,0,0,0],
    [4,2,0,0,0,0,0,0,0,0],
    [4,2,1,0,0,0,0,0,0,0],
    [5,3,2,0,0,0,0,0,0,0],
    [5,3,2,1,0,0,0,0,0,0],
    [5,3,3,2,0,0,0,0,0,0],
    [6,4,3,2,1,0,0,0,0,0],
    [6,4,3,3,2,0,0,0,0,0],
    [6,4,4,3,2,1,0,0,0,0],
    [6,4,4,3,3,2,0,0,0,0],
    [6,5,4,4,3,2,1,0,0,0],
    [6,5,4,4,3,3,2,0,0,0],
    [6,5,5,4,4,3,2,1,0,0],
    [6,5,5,4,4,3,3,2,0,0],
    [6,5,5,5,4,4,3,2,1,0],
    [6,5,5,5,4,4,3,3,2,0],
    [6,5,5,5,5,4,4,3,2,1],
    [6,5,5,5,5,4,4,3,3,2],
    [6,5,5,5,5,5,4,4,3,3],
    [6,5,5,5,5,5,4,4,4,4],
  ],
  'Bardo': [
    [2,0,0,0,0,0,0,0,0,0],
    [3,0,0,0,0,0,0,0,0,0],
    [3,1,0,0,0,0,0,0,0,0],
    [3,2,0,0,0,0,0,0,0,0],
    [3,3,1,0,0,0,0,0,0,0],
    [3,3,2,0,0,0,0,0,0,0],
    [3,3,2,0,0,0,0,0,0,0],
    [3,3,3,1,0,0,0,0,0,0],
    [3,3,3,2,0,0,0,0,0,0],
    [3,3,3,2,0,0,0,0,0,0],
    [3,3,3,3,1,0,0,0,0,0],
    [3,3,3,3,2,0,0,0,0,0],
    [3,3,3,3,2,0,0,0,0,0],
    [4,3,3,3,3,1,0,0,0,0],
    [4,4,3,3,3,2,0,0,0,0],
    [4,4,4,3,3,2,0,0,0,0],
    [4,4,4,4,3,3,0,0,0,0],
    [4,4,4,4,4,3,0,0,0,0],
    [4,4,4,4,4,4,0,0,0,0],
    [4,4,4,4,4,4,0,0,0,0],
  ],
  'Paladino': [
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,1,0,0,0,0,0,0,0,0],
    [0,1,0,0,0,0,0,0,0,0],
    [0,1,0,0,0,0,0,0,0,0],
    [0,1,0,0,0,0,0,0,0,0],
    [0,1,1,0,0,0,0,0,0,0],
    [0,1,1,0,0,0,0,0,0,0],
    [0,1,1,1,0,0,0,0,0,0],
    [0,1,1,1,0,0,0,0,0,0],
    [0,1,1,1,1,0,0,0,0,0],
    [0,2,1,1,1,0,0,0,0,0],
    [0,2,2,1,1,0,0,0,0,0],
    [0,2,2,1,1,0,0,0,0,0],
    [0,2,2,2,1,0,0,0,0,0],
    [0,2,2,2,1,0,0,0,0,0],
    [0,3,2,2,1,0,0,0,0,0],
    [0,3,3,3,2,0,0,0,0,0],
    [0,3,3,3,3,0,0,0,0,0],
  ],
  'Patrulheiro': [
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,1,0,0,0,0,0,0,0,0],
    [0,1,0,0,0,0,0,0,0,0],
    [0,1,0,0,0,0,0,0,0,0],
    [0,1,0,0,0,0,0,0,0,0],
    [0,1,1,0,0,0,0,0,0,0],
    [0,1,1,0,0,0,0,0,0,0],
    [0,1,1,1,0,0,0,0,0,0],
    [0,1,1,1,0,0,0,0,0,0],
    [0,1,1,1,1,0,0,0,0,0],
    [0,2,1,1,1,0,0,0,0,0],
    [0,2,2,1,1,0,0,0,0,0],
    [0,2,2,1,1,0,0,0,0,0],
    [0,2,2,2,1,0,0,0,0,0],
    [0,2,2,2,1,0,0,0,0,0],
    [0,3,2,2,1,0,0,0,0,0],
    [0,3,3,3,2,0,0,0,0,0],
    [0,3,3,3,3,0,0,0,0,0],
  ],
  'Explorador': [
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,1,0,0,0,0,0,0,0,0],
    [0,1,0,0,0,0,0,0,0,0],
    [0,1,0,0,0,0,0,0,0,0],
    [0,1,0,0,0,0,0,0,0,0],
    [0,1,1,0,0,0,0,0,0,0],
    [0,1,1,0,0,0,0,0,0,0],
    [0,1,1,1,0,0,0,0,0,0],
    [0,1,1,1,0,0,0,0,0,0],
    [0,1,1,1,1,0,0,0,0,0],
    [0,2,1,1,1,0,0,0,0,0],
    [0,2,2,1,1,0,0,0,0,0],
    [0,2,2,1,1,0,0,0,0,0],
    [0,2,2,2,1,0,0,0,0,0],
    [0,2,2,2,1,0,0,0,0,0],
    [0,3,2,2,1,0,0,0,0,0],
    [0,3,3,3,2,0,0,0,0,0],
    [0,3,3,3,3,0,0,0,0,0],
  ],
}

// Modificador de atributo DnD
export function getModificador(valor) {
  return Math.floor((valor - 10) / 2)
}

// Bônus de magias extras por modificador de atributo
// Retorna array [nv1bonus, nv2bonus, nv3bonus, nv4bonus]
export function getBonusMagias(modificador) {
  if (modificador <= 0) return [0,0,0,0,0,0,0,0,0]
  const bonus = []
  for (let nivel = 1; nivel <= 9; nivel++) {
    bonus.push(modificador >= nivel ? Math.ceil((modificador - nivel + 1) / 4) : 0)
  }
  return bonus
}

// Calcula slots disponíveis para um personagem
// bonusSlots: array opcional de 10 números [nv0..nv9] com bônus adicionais (ex: de talentos)
export function calcularSlots(classe, nivel, atributo, bonusSlots = null) {
  const tabela = SPELL_SLOTS[classe]
  if (!tabela || nivel < 1 || nivel > 20) return null

  const slots = [...tabela[nivel - 1]]
  const mod = getModificador(atributo)

  if (mod > 0) {
    const bonus = getBonusMagias(mod)
    for (let i = 0; i < bonus.length; i++) {
      if (slots[i + 1] !== undefined && slots[i + 1] > 0) {
        slots[i + 1] += bonus[i]
      }
    }
  }

  // Aplicar bônus adicionais (ex: de talentos como Arcane Disciple, Slot Extra etc.)
  if (bonusSlots) {
    for (let i = 0; i < bonusSlots.length && i < slots.length; i++) {
      if (bonusSlots[i]) slots[i] += bonusSlots[i]
    }
  }

  return slots
}

// Lista de magias pré-definidas por classe e nível
export const MAGIAS_PADRAO = {
  'Clérigo': {
    0: [
      { nome: 'Curar Ferimento Menor', escola: 'Conjuração', descricao: 'Cura 1d8+1/nível (máx +5).' },
      { nome: 'Infligir Ferimento Menor', escola: 'Necromancia', descricao: 'Toque causa 1d8+1/nível (máx +5).' },
      { nome: 'Detectar Magia', escola: 'Adivinhação', descricao: 'Detecta magias e objetos mágicos.' },
      { nome: 'Luz', escola: 'Evocação', descricao: 'Objeto brilha como tocha por 10 min/nível.' },
      { nome: 'Orientação', escola: 'Adivinhação', descricao: '+1 em uma jogada de ataque, perícia ou resistência.' },
      { nome: 'Resistência', escola: 'Abjuração', descricao: '+1 em testes de resistência.' },
      { nome: 'Purificar Comida e Água', escola: 'Transmutação', descricao: 'Purifica comida e água podres.' },
      { nome: 'Criar Água', escola: 'Conjuração', descricao: 'Cria 2 litros de água potável por nível.' },
      { nome: 'Ler Magia', escola: 'Adivinhação', descricao: 'Lê pergaminhos e inscrições mágicas.' },
      { nome: 'Estabilizar', escola: 'Conjuração', descricao: 'Estabiliza criatura que está morrendo.' },
    ],
    1: [
      { nome: 'Curar Ferimentos Leves', escola: 'Conjuração', descricao: 'Cura 1d8+1/nível de dano (máx +5).' },
      { nome: 'Infligir Ferimentos Leves', escola: 'Necromancia', descricao: 'Toque causa 1d8+1/nível de dano (máx +5).' },
      { nome: 'Bênção', escola: 'Encantamento', descricao: '+1 em ataques e resistência contra medo para aliados.' },
      { nome: 'Escudo da Fé', escola: 'Abjuração', descricao: '+2 de deflexão para CA, +1 a cada 6 níveis.' },
      { nome: 'Proteção contra o Mal', escola: 'Abjuração', descricao: '+2 de CA e resistências contra criaturas malignas.' },
      { nome: 'Detectar o Mal', escola: 'Adivinhação', descricao: 'Detecta criaturas, magias e objetos malignos.' },
      { nome: 'Santuário', escola: 'Abjuração', descricao: 'Oponentes não podem atacar o conjurador.' },
      { nome: 'Comando', escola: 'Encantamento', descricao: 'Uma criatura obedece a um comando de uma palavra.' },
      { nome: 'Remover Medo', escola: 'Abjuração', descricao: '+4 em resistência contra medo por 10 min.' },
      { nome: 'Luz Divina', escola: 'Evocação', descricao: 'Raio de luz sagrada cega criaturas malignas.' },
      { nome: 'Causar Medo', escola: 'Necromancia', descricao: 'Criatura fica abalada por 1 rodada/nível.' },
      { nome: 'Convocar Monstro I', escola: 'Conjuração', descricao: 'Convoca uma criatura extraplanar de nível 1 para ajudar por 1 rodada/nível.' },
    ],
    2: [
      { nome: 'Curar Ferimentos Moderados', escola: 'Conjuração', descricao: 'Cura 2d8+1/nível de dano (máx +10).' },
      { nome: 'Infligir Ferimentos Moderados', escola: 'Necromancia', descricao: 'Toque causa 2d8+1/nível de dano (máx +10).' },
      { nome: 'Silêncio', escola: 'Ilusão', descricao: 'Nenhum som em área de 6 m de raio por 1 min/nível.' },
      { nome: 'Ajuda', escola: 'Encantamento', descricao: '+1 em ataque, resistência contra medo, e 1d8+1/nível de PV temp.' },
      { nome: 'Imobilizar Pessoa', escola: 'Encantamento', descricao: 'Paralisa um humanoide por 1 rodada/nível.' },
      { nome: 'Restauração Menor', escola: 'Conjuração', descricao: 'Remove dano de habilidade ou 1 nível negativo.' },
      { nome: 'Resistência a Energia', escola: 'Abjuração', descricao: 'Ignora 10 pontos de dano de um tipo de energia.' },
      { nome: 'Oração', escola: 'Encantamento', descricao: '+1 em ataques, dano e resistências dos aliados; -1 para inimigos.' },
      { nome: 'Consagrar', escola: 'Evocação', descricao: 'Preenche área com poder positivo.' },
      { nome: 'Convocar Monstro II', escola: 'Conjuração', descricao: 'Convoca uma criatura extraplanar de nível 2 ou inferior por 1 rodada/nível.' },
    ],
    3: [
      { nome: 'Curar Ferimentos Sérios', escola: 'Conjuração', descricao: 'Cura 3d8+1/nível de dano (máx +15).' },
      { nome: 'Infligir Ferimentos Sérios', escola: 'Necromancia', descricao: 'Toque causa 3d8+1/nível de dano (máx +15).' },
      { nome: 'Remover Maldição', escola: 'Abjuração', descricao: 'Remove maldições do sujeito.' },
      { nome: 'Remover Doença', escola: 'Conjuração', descricao: 'Cura todas as doenças do sujeito.' },
      { nome: 'Proteção contra Energia', escola: 'Abjuração', descricao: 'Absorve 12 pontos/nível de dano de um tipo de energia.' },
      { nome: 'Animar Mortos', escola: 'Necromancia', descricao: 'Cria esqueletos e zumbis a partir de cadáveres.' },
      { nome: 'Dispersar Magia', escola: 'Abjuração', descricao: 'Cancela magias e efeitos mágicos.' },
      { nome: 'Convocar Monstro III', escola: 'Conjuração', descricao: 'Convoca criatura extraplanar para ajudar.' },
    ],
    4: [
      { nome: 'Curar Ferimentos Críticos', escola: 'Conjuração', descricao: 'Cura 4d8+1/nível de dano (máx +20).' },
      { nome: 'Infligir Ferimentos Críticos', escola: 'Necromancia', descricao: 'Toque causa 4d8+1/nível de dano (máx +20).' },
      { nome: 'Liberdade de Movimento', escola: 'Abjuração', descricao: 'Sujeito move-se normalmente apesar de impedimentos.' },
      { nome: 'Restauração', escola: 'Conjuração', descricao: 'Restaura dano de nível e habilidade.' },
      { nome: 'Imobilizar Monstro', escola: 'Encantamento', descricao: 'Paralisa qualquer criatura.' },
      { nome: 'Punição Divina', escola: 'Evocação', descricao: 'Raio divino causa dano e aturde o alvo.' },
      { nome: 'Convocar Monstro IV', escola: 'Conjuração', descricao: 'Convoca uma criatura extraplanar de nível 4 ou inferior por 1 rodada/nível.' },
    ],
    5: [
      { nome: 'Cura em Massa', escola: 'Conjuração', descricao: 'Cura todos aliados em 9 m de 1d8+1/nível (máx +25).' },
      { nome: 'Quebrar Encantamento', escola: 'Abjuração', descricao: 'Libera sujeitos de encantamentos, maldições e transformações.' },
      { nome: 'Ressurreição', escola: 'Conjuração', descricao: 'Resgata o morto e restaura 1 nível perdido.' },
      { nome: 'Controle de Mortos-Vivos', escola: 'Necromancia', descricao: 'Controla mortos-vivos como se fossem os seus.' },
      { nome: 'Chama Sagrada', escola: 'Evocação', descricao: '1d8/2 níveis de dano sagrado em criaturas malignas.' },
      { nome: 'Convocar Monstro V', escola: 'Conjuração', descricao: 'Convoca uma criatura extraplanar de nível 5 ou inferior por 1 rodada/nível.' },
    ],
    6: [
      { nome: 'Cura em Massa Maior', escola: 'Conjuração', descricao: 'Cura 6d8+1/nível (máx +40) em todos aliados na área.' },
      { nome: 'Invocar o Sagrado', escola: 'Evocação', descricao: 'Mata, paralisa ou enfraquece criaturas malignas.' },
      { nome: 'Visão da Verdade', escola: 'Adivinhação', descricao: 'Vê criaturas e objetos em sua forma verdadeira.' },
      { nome: 'Geas/Quest', escola: 'Encantamento', descricao: 'Obriga a criatura a cumprir uma tarefa.' },
      { nome: 'Convocar Monstro VI', escola: 'Conjuração', descricao: 'Convoca uma criatura extraplanar de nível 6 ou inferior por 1 rodada/nível.' },
    ],
    7: [
      { nome: 'Ressurreição Verdadeira', escola: 'Conjuração', descricao: 'Pode ressuscitar qualquer criatura morta há até 10 anos/nível.' },
      { nome: 'Regeneração', escola: 'Conjuração', descricao: 'O sujeito regenera PV e membros perdidos.' },
      { nome: 'Chuva de Fogo Sagrado', escola: 'Evocação', descricao: 'Chuva de fogo sagrado causa dano maciço.' },
      { nome: 'Convocar Monstro VII', escola: 'Conjuração', descricao: 'Convoca uma criatura extraplanar de nível 7 ou inferior por 1 rodada/nível.' },
    ],
    8: [
      { nome: 'Energia do Plano Positivo', escola: 'Conjuração', descricao: 'Canaliza energia positiva maciça.' },
      { nome: 'Proteção Divina', escola: 'Abjuração', descricao: 'Escudo divino protege completamente.' },
      { nome: 'Convocar Monstro VIII', escola: 'Conjuração', descricao: 'Convoca uma criatura extraplanar de nível 8 ou inferior por 1 rodada/nível.' },
    ],
    9: [
      { nome: 'Milagre', escola: 'Universal', descricao: 'Pede uma milagre à sua divindade.' },
      { nome: 'Cura Verdadeira', escola: 'Conjuração', descricao: 'Cura todos ferimentos e condições.' },
      { nome: 'Convocar Monstro IX', escola: 'Conjuração', descricao: 'Convoca uma criatura extraplanar de nível 9 ou inferior por 1 rodada/nível.' },
    ],
  },
  'Mago': {
    0: [
      { nome: 'Detectar Magia', escola: 'Adivinhação', descricao: 'Detecta magias e objetos mágicos.' },
      { nome: 'Ler Magia', escola: 'Adivinhação', descricao: 'Lê pergaminhos e livros de magias.' },
      { nome: 'Prestidigitação', escola: 'Universal', descricao: 'Realiza pequenas maravilhas e truques menores.' },
      { nome: 'Luz', escola: 'Evocação', descricao: 'Objeto brilha como tocha por 10 min/nível.' },
      { nome: 'Mão do Mago', escola: 'Transmutação', descricao: 'Move objeto de até 5 kg à distância.' },
      { nome: 'Mensagem', escola: 'Transmutação', descricao: 'Cochicha mensagem a distância com resposta.' },
      { nome: 'Ilusão Menor', escola: 'Ilusão', descricao: 'Cria som ou imagem de 30 cm cúbicos.' },
      { nome: 'Resistência', escola: 'Abjuração', descricao: '+1 em testes de resistência.' },
      { nome: 'Raio de Gelo', escola: 'Conjuração', descricao: 'Toque de gelo causa 1d3 de dano de frio.' },
      { nome: 'Disrupção', escola: 'Necromancia', descricao: '1d6+1 de dano; causa náusea a humanos.' },
    ],
    1: [
      { nome: 'Míssil Mágico', escola: 'Evocação', descricao: '1d4+1 de dano; +1 míssil a cada 2 níveis acima do 1º (máx 5).' },
      { nome: 'Dormir', escola: 'Encantamento', descricao: 'Coloca 4 DV de criaturas em sono mágico.' },
      { nome: 'Charmar Pessoa', escola: 'Encantamento', descricao: 'Humanóide me trata como amigo.' },
      { nome: 'Escudo', escola: 'Abjuração', descricao: '+4 de escudo para CA; bloqueia Míssil Mágico.' },
      { nome: 'Armadura de Mago', escola: 'Conjuração', descricao: '+4 de armadura para CA (não cumulativo com armadura real).' },
      { nome: 'Mãos Ardentes', escola: 'Evocação', descricao: '1d4 de fogo por nível (máx 5d4) em cone de 4,5 m.' },
      { nome: 'Obscurecer', escola: 'Conjuração', descricao: 'Névoa mágica obscurece visão em área.' },
      { nome: 'Compreender Idiomas', escola: 'Adivinhação', descricao: 'Compreende todos os idiomas falados e escritos.' },
      { nome: 'Identificar', escola: 'Adivinhação', descricao: 'Identifica propriedades de objeto mágico.' },
      { nome: 'Alarme', escola: 'Abjuração', descricao: 'Soa alarme se criaturas entrarem na área.' },
      { nome: 'Detectar Segredos', escola: 'Adivinhação', descricao: 'Detecta portas secretas e armadilhas.' },
      { nome: 'Enlace', escola: 'Conjuração', descricao: 'Plantas imobilizam criaturas na área.' },
    ],
    2: [
      { nome: 'Força de Touro', escola: 'Transmutação', descricao: '+4 de For por 1 min/nível.' },
      { nome: 'Graça de Gato', escola: 'Transmutação', descricao: '+4 de Des por 1 min/nível.' },
      { nome: 'Invisibilidade', escola: 'Ilusão', descricao: 'Sujeito fica invisível até atacar ou conjurar.' },
      { nome: 'Teia', escola: 'Conjuração', descricao: 'Emaranha criaturas na área com teia.' },
      { nome: 'Imagem Espelhada', escola: 'Ilusão', descricao: '1d4+1 imagens duplicadas do conjurador.' },
      { nome: 'Flecha Ácida', escola: 'Conjuração', descricao: 'Projétil mágico causa 2d4 de ácido por 1 rodada +1/3 níveis.' },
      { nome: 'Imobilizar Pessoa', escola: 'Encantamento', descricao: 'Paralisa um humanoide por 1 rodada/nível.' },
      { nome: 'Detectar Pensamentos', escola: 'Adivinhação', descricao: 'Permite ler os pensamentos de outros.' },
      { nome: 'Levitação', escola: 'Transmutação', descricao: 'Sujeito sobe ou desce à vontade do conjurador.' },
      { nome: 'Névoa Ácida', escola: 'Conjuração', descricao: 'Névoa causa 2d6 de dano de ácido por rodada.' },
    ],
    3: [
      { nome: 'Bola de Fogo', escola: 'Evocação', descricao: '1d6 de fogo por nível (máx 10d6) em esfera de 6 m.' },
      { nome: 'Raio', escola: 'Evocação', descricao: '1d6 de dano elétrico por nível (máx 10d6) em linha.' },
      { nome: 'Voo', escola: 'Transmutação', descricao: 'Sujeito pode voar a 18 m por rodada.' },
      { nome: 'Dispersar Magia', escola: 'Abjuração', descricao: 'Cancela magias e efeitos mágicos.' },
      { nome: 'Sugestão', escola: 'Encantamento', descricao: 'Leva o sujeito a cumprir um pedido razoável.' },
      { nome: 'Chama Vampírica', escola: 'Necromancia', descricao: 'Toque causa 1d6+1/2 nível e absorve esses PV.' },
      { nome: 'Imagem Maior', escola: 'Ilusão', descricao: 'Ilusão de objeto, criatura ou força com som.' },
      { nome: 'Hesitação', escola: 'Encantamento', descricao: 'Criaturas na área perdem ações aleatoriamente.' },
      { nome: 'Bola de Relâmpago', escola: 'Evocação', descricao: 'Esfera elétrica causa 1d6/nível de dano.' },
    ],
    4: [
      { nome: 'Parede de Fogo', escola: 'Evocação', descricao: 'Parede de fogo causa 2d4+1/nível de dano.' },
      { nome: 'Polimorfismo', escola: 'Transmutação', descricao: 'Dá ao sujeito nova forma animal.' },
      { nome: 'Invisibilidade Maior', escola: 'Ilusão', descricao: 'Sujeito permanece invisível mesmo ao atacar.' },
      { nome: 'Confusão', escola: 'Encantamento', descricao: 'Criaturas na área agem aleatoriamente.' },
      { nome: 'Charmar Monstro', escola: 'Encantamento', descricao: 'Transforma monstro em aliado temporário.' },
      { nome: 'Mão Arcana', escola: 'Evocação', descricao: 'Cria mão mágica que bloqueia e ataca.' },
      { nome: 'Globo de Invulnerabilidade Menor', escola: 'Abjuração', descricao: 'Para magias de nível 1-3.' },
    ],
    5: [
      { nome: 'Cone de Frio', escola: 'Evocação', descricao: '1d6 de frio por nível (máx 15d6) em cone.' },
      { nome: 'Parede de Força', escola: 'Evocação', descricao: 'Parede de força invulnerável e invisível.' },
      { nome: 'Teletransporte', escola: 'Conjuração', descricao: 'Teleporta você e até 50 kg/nível.' },
      { nome: 'Nuvem de Veneno', escola: 'Conjuração', descricao: 'Nuvem tóxica causa 1d10 de Con por rodada.' },
      { nome: 'Sugestão em Massa', escola: 'Encantamento', descricao: 'Compele criaturas a seguirem uma sugestão.' },
      { nome: 'Imagem Maior Persistente', escola: 'Ilusão', descricao: 'Ilusão permanente com som, visão e olfato.' },
    ],
    6: [
      { nome: 'Desintegrar', escola: 'Transmutação', descricao: '2d6 de dano por nível (máx 40d6); destrói objetos.' },
      { nome: 'Corrente de Raios', escola: 'Evocação', descricao: '1d6/nível de dano elétrico em múltiplos alvos.' },
      { nome: 'Globo de Invulnerabilidade', escola: 'Abjuração', descricao: 'Para magias de nível 1-4.' },
      { nome: 'Geas/Quest', escola: 'Encantamento', descricao: 'Obriga a criatura a cumprir uma tarefa.' },
      { nome: 'Visão da Verdade', escola: 'Adivinhação', descricao: 'Vê criaturas e objetos em sua forma verdadeira.' },
      { nome: 'Contingência', escola: 'Evocação', descricao: 'Magia é ativada quando condição especificada ocorre.' },
    ],
    7: [
      { nome: 'Dedos da Morte', escola: 'Necromancia', descricao: '10 de dano por nível ao sujeito (sem resistência).' },
      { nome: 'Parede de Espadas', escola: 'Evocação', descricao: 'Parede causa 15d6 de dano a quem atravessar.' },
      { nome: 'Teletransporte em Massa', escola: 'Conjuração', descricao: 'Teleporta um grupo a destino escolhido.' },
      { nome: 'Prisão de Força', escola: 'Evocação', descricao: 'Imobiliza o alvo com campo de força.' },
      { nome: 'Forma Gasosa', escola: 'Transmutação', descricao: 'Sujeito se torna gás e fica imune a dano.' },
    ],
    8: [
      { nome: 'Parede de Fogo em Anel', escola: 'Evocação', descricao: 'Anel de fogo ao redor do conjurador.' },
      { nome: 'Prisma de Fogo', escola: 'Abjuração', descricao: 'Defesa multifacetada ao conjurador.' },
      { nome: 'Vínculo Poderoso', escola: 'Abjuração', descricao: 'Aprisiona extraplanar em pentáculo.' },
      { nome: 'Mente em Branco', escola: 'Abjuração', descricao: 'Protege sujeito de magia de mente e adivinhação.' },
    ],
    9: [
      { nome: 'Desejo', escola: 'Universal', descricao: 'Modifica a realidade para satisfazer um desejo.' },
      { nome: 'Chuva de Meteoros', escola: 'Evocação', descricao: 'Meteoros causam 24d6 de fogo em múltiplas áreas.' },
      { nome: 'Parar o Tempo', escola: 'Transmutação', descricao: 'O conjurador age livremente por 1d4+1 rodadas.' },
      { nome: 'Prisma da Morte', escola: 'Necromancia', descricao: 'Raio multicolorido mata, paralisa ou petrifica.' },
    ],
  },
  'Druida': {
    0: [
      { nome: 'Detectar Magia', escola: 'Adivinhação', descricao: 'Detecta magias e objetos mágicos.' },
      { nome: 'Orientação', escola: 'Adivinhação', descricao: '+1 em uma jogada.' },
      { nome: 'Resistência', escola: 'Abjuração', descricao: '+1 em testes de resistência.' },
      { nome: 'Luz', escola: 'Evocação', descricao: 'Objeto brilha como tocha.' },
      { nome: 'Purificar Comida e Água', escola: 'Transmutação', descricao: 'Purifica comida e água podres.' },
      { nome: 'Criar Água', escola: 'Conjuração', descricao: 'Cria 2 litros de água potável por nível.' },
      { nome: 'Curar Ferimento Menor', escola: 'Conjuração', descricao: 'Cura 1d8+1/nível (máx +5).' },
      { nome: 'Ler Magia', escola: 'Adivinhação', descricao: 'Lê inscrições mágicas naturais.' },
    ],
    1: [
      { nome: 'Curar Ferimentos Leves', escola: 'Conjuração', descricao: 'Cura 1d8+1/nível (máx +5).' },
      { nome: 'Empatia com Animal', escola: 'Transmutação', descricao: 'Melhora reação inicial de animais.' },
      { nome: 'Fascinar Animal', escola: 'Encantamento', descricao: 'Animal fica parado e encantado.' },
      { nome: 'Emaranhamento', escola: 'Transmutação', descricao: 'Plantas imobilizam criaturas em área.' },
      { nome: 'Névoa Obscura', escola: 'Conjuração', descricao: 'Névoa natural obscurece visão.' },
      { nome: 'Falar com Animais', escola: 'Adivinhação', descricao: 'Fala com animais por 1 min/nível.' },
      { nome: 'Produzir Chamas', escola: 'Evocação', descricao: '1d6+1/nível de fogo (máx +5) em toque ou projétil.' },
      { nome: 'Sentido Sísmico', escola: 'Adivinhação', descricao: 'Detecta criaturas no chão ao redor.' },
    ],
    2: [
      { nome: 'Curar Ferimentos Moderados', escola: 'Conjuração', descricao: 'Cura 2d8+1/nível (máx +10).' },
      { nome: 'Força de Urso', escola: 'Transmutação', descricao: '+4 de For por 1 min/nível.' },
      { nome: 'Pele de Madeira', escola: 'Transmutação', descricao: '+2 bônus natural de CA.' },
      { nome: 'Restauração Menor', escola: 'Conjuração', descricao: 'Remove dano de habilidade.' },
      { nome: 'Falar com Plantas', escola: 'Adivinhação', descricao: 'Fala com plantas por 1 min/nível.' },
      { nome: 'Invocar Enxame', escola: 'Conjuração', descricao: 'Invoca enxame de aranhas, ratos ou outros.' },
      { nome: 'Forma Natural I', escola: 'Transmutação', descricao: 'Assume forma de animal pequeno ou médio.' },
    ],
    3: [
      { nome: 'Curar Ferimentos Sérios', escola: 'Conjuração', descricao: 'Cura 3d8+1/nível (máx +15).' },
      { nome: 'Chamar Raio', escola: 'Evocação', descricao: '3d6 de dano elétrico por raio; 1 raio/rodada até 1/nível.' },
      { nome: 'Barreira de Espinhos', escola: 'Conjuração', descricao: 'Plantas espinhosas bloqueiam e causam dano.' },
      { nome: 'Dispersar Magia', escola: 'Abjuração', descricao: 'Cancela magias e efeitos mágicos.' },
      { nome: 'Veneno', escola: 'Necromancia', descricao: 'Toque causa 1d10 de Con imediato e 1d10 secundário.' },
      { nome: 'Proteção contra Energia', escola: 'Abjuração', descricao: 'Absorve 12 pontos/nível de dano de energia.' },
    ],
    4: [
      { nome: 'Curar Ferimentos Críticos', escola: 'Conjuração', descricao: 'Cura 4d8+1/nível (máx +20).' },
      { nome: 'Dominar Animal', escola: 'Encantamento', descricao: 'Controla completamente um animal.' },
      { nome: 'Liberdade de Movimento', escola: 'Abjuração', descricao: 'Move normalmente apesar de impedimentos.' },
      { nome: 'Tempestade de Gelo', escola: 'Evocação', descricao: '3d6 de contusão + 2d6 de frio na área.' },
      { nome: 'Forma Natural II', escola: 'Transmutação', descricao: 'Assume forma de animal grande.' },
    ],
    5: [
      { nome: 'Cura em Massa', escola: 'Conjuração', descricao: 'Cura todos aliados em 9 m.' },
      { nome: 'Tempestade de Insetos', escola: 'Conjuração', descricao: 'Enxame de insetos obscurece e ataca criaturas.' },
      { nome: 'Controlar Ventos', escola: 'Transmutação', descricao: 'Muda a velocidade e direção dos ventos.' },
      { nome: 'Comunhão com a Natureza', escola: 'Adivinhação', descricao: 'Obtém informações sobre a terra ao redor.' },
    ],
    6: [
      { nome: 'Terremoto', escola: 'Evocação', descricao: 'Intenso tremor abala a área.' },
      { nome: 'Forma Natural IV', escola: 'Transmutação', descricao: 'Assume forma de animal enorme.' },
      { nome: 'Cura em Massa Maior', escola: 'Conjuração', descricao: 'Cura todos aliados em área maior.' },
    ],
    7: [
      { nome: 'Forma de Elemento', escola: 'Transmutação', descricao: 'Assume forma de criatura elemental.' },
      { nome: 'Regeneração', escola: 'Conjuração', descricao: 'Sujeito regenera PV e membros perdidos.' },
      { nome: 'Controlar o Clima', escola: 'Transmutação', descricao: 'Muda o clima na região.' },
    ],
    8: [
      { nome: 'Nuvem de Tempestade', escola: 'Evocação', descricao: 'Nuvem de tempestade maciça.' },
      { nome: 'Animal Épico', escola: 'Transmutação', descricao: 'Cria parceiro animal épico.' },
    ],
    9: [
      { nome: 'Toque Elemental', escola: 'Transmutação', descricao: 'Assume forma elemental épica.' },
      { nome: 'Shapechange', escola: 'Transmutação', descricao: 'Assume qualquer forma a vontade.' },
    ],
  },
  'Bardo': {
    0: [
      { nome: 'Detectar Magia', escola: 'Adivinhação', descricao: 'Detecta magias.' },
      { nome: 'Ler Magia', escola: 'Adivinhação', descricao: 'Lê pergaminhos e inscrições mágicas.' },
      { nome: 'Prestidigitação', escola: 'Universal', descricao: 'Realiza pequenas maravilhas e truques.' },
      { nome: 'Luz', escola: 'Evocação', descricao: 'Objeto brilha como tocha.' },
      { nome: 'Ilusão Menor', escola: 'Ilusão', descricao: 'Cria som ou imagem pequena.' },
      { nome: 'Mensagem', escola: 'Transmutação', descricao: 'Cochicha mensagem a distância com resposta.' },
      { nome: 'Resistência', escola: 'Abjuração', descricao: '+1 em testes de resistência.' },
    ],
    1: [
      { nome: 'Charmar Pessoa', escola: 'Encantamento', descricao: 'Humanóide me trata como amigo.' },
      { nome: 'Curar Ferimentos Leves', escola: 'Conjuração', descricao: 'Cura 1d8+1/nível (máx +5).' },
      { nome: 'Sono Hipnótico', escola: 'Encantamento', descricao: 'Fascina 2d4 DV de criaturas.' },
      { nome: 'Silêncio', escola: 'Ilusão', descricao: 'Nenhum som em área de 6 m.' },
      { nome: 'Invisibilidade', escola: 'Ilusão', descricao: 'Sujeito fica invisível até atacar.' },
      { nome: 'Detectar Segredos', escola: 'Adivinhação', descricao: 'Detecta portas secretas.' },
      { nome: 'Ventos', escola: 'Transmutação', descricao: 'Destrói névoa e afasta criaturas pequenas.' },
    ],
    2: [
      { nome: 'Curar Ferimentos Moderados', escola: 'Conjuração', descricao: 'Cura 2d8+1/nível (máx +10).' },
      { nome: 'Imagem Menor', escola: 'Ilusão', descricao: 'Ilusão com som.' },
      { nome: 'Dissonância Cruel', escola: 'Evocação', descricao: '1d6/nível de dano sônico em criaturas sensíveis.' },
      { nome: 'Detectar Pensamentos', escola: 'Adivinhação', descricao: 'Lê pensamentos de outros.' },
      { nome: 'Sugestão', escola: 'Encantamento', descricao: 'Leva sujeito a cumprir pedido razoável.' },
      { nome: 'Aprimorar Habilidade', escola: 'Transmutação', descricao: '+4 em um atributo por 1 min/nível.' },
    ],
    3: [
      { nome: 'Curar Ferimentos Sérios', escola: 'Conjuração', descricao: 'Cura 3d8+1/nível (máx +15).' },
      { nome: 'Dispersar Magia', escola: 'Abjuração', descricao: 'Cancela magias e efeitos.' },
      { nome: 'Imagem Maior', escola: 'Ilusão', descricao: 'Ilusão complexa com som e cheiro.' },
      { nome: 'Confusão', escola: 'Encantamento', descricao: 'Criaturas na área agem aleatoriamente.' },
    ],
    4: [
      { nome: 'Curar Ferimentos Críticos', escola: 'Conjuração', descricao: 'Cura 4d8+1/nível (máx +20).' },
      { nome: 'Charmar Monstro', escola: 'Encantamento', descricao: 'Monstro me trata como amigo.' },
      { nome: 'Dissonância Maior', escola: 'Evocação', descricao: 'Dano sônico em área.' },
      { nome: 'Liberdade de Movimento', escola: 'Abjuração', descricao: 'Move normalmente apesar de impedimentos.' },
    ],
    5: [
      { nome: 'Cura em Massa', escola: 'Conjuração', descricao: 'Cura todos aliados em área.' },
      { nome: 'Sugestão em Massa', escola: 'Encantamento', descricao: 'Compele criaturas a seguirem sugestão.' },
      { nome: 'Ilusão Épica', escola: 'Ilusão', descricao: 'Ilusão poderosa sem concentração.' },
    ],
    6: [
      { nome: 'Encantamento Irresistível', escola: 'Encantamento', descricao: 'Encantamento sem testes de resistência.' },
      { nome: 'Visão da Verdade', escola: 'Adivinhação', descricao: 'Vê a forma verdadeira de tudo.' },
    ],
  },
  'Paladino': {
    1: [
      { nome: 'Curar Ferimentos Leves', escola: 'Conjuração', descricao: 'Cura 1d8+1/nível (máx +5).' },
      { nome: 'Bênção', escola: 'Encantamento', descricao: '+1 em ataques e resistência contra medo.' },
      { nome: 'Proteção contra o Mal', escola: 'Abjuração', descricao: '+2 de CA e resistências contra o mal.' },
      { nome: 'Escudo da Fé', escola: 'Abjuração', descricao: '+2 deflexão para CA.' },
      { nome: 'Detectar o Mal', escola: 'Adivinhação', descricao: 'Detecta criaturas malignas.' },
      { nome: 'Luz Divina', escola: 'Evocação', descricao: 'Raio de luz sagrada.' },
    ],
    2: [
      { nome: 'Curar Ferimentos Moderados', escola: 'Conjuração', descricao: 'Cura 2d8+1/nível (máx +10).' },
      { nome: 'Resistência a Energia', escola: 'Abjuração', descricao: 'Ignora 10 pontos de dano de energia.' },
      { nome: 'Arma Sagrada', escola: 'Evocação', descricao: 'Arma causa dano sagrado adicional.' },
      { nome: 'Ajuda', escola: 'Encantamento', descricao: '+1 em ataque e PV temporários.' },
    ],
    3: [
      { nome: 'Curar Ferimentos Sérios', escola: 'Conjuração', descricao: 'Cura 3d8+1/nível (máx +15).' },
      { nome: 'Remover Maldição', escola: 'Abjuração', descricao: 'Remove maldições do sujeito.' },
      { nome: 'Círculo Mágico contra o Mal', escola: 'Abjuração', descricao: 'Abjuração de 3 m de raio contra o mal.' },
      { nome: 'Proteção contra Energia', escola: 'Abjuração', descricao: 'Absorve dano de tipo de energia.' },
    ],
    4: [
      { nome: 'Curar Ferimentos Críticos', escola: 'Conjuração', descricao: 'Cura 4d8+1/nível (máx +20).' },
      { nome: 'Chama Sagrada', escola: 'Evocação', descricao: '1d8/2 níveis de dano sagrado em criaturas malignas.' },
      { nome: 'Liberdade de Movimento', escola: 'Abjuração', descricao: 'Move normalmente apesar de impedimentos.' },
      { nome: 'Repelir Mortos-Vivos', escola: 'Necromancia', descricao: 'Repele mortos-vivos como clérigo de dobro do nível.' },
    ],
  },
  'Patrulheiro': {
    1: [
      { nome: 'Curar Ferimentos Leves', escola: 'Conjuração', descricao: 'Cura 1d8+1/nível (máx +5).' },
      { nome: 'Empatia com Animal', escola: 'Transmutação', descricao: 'Melhora reação de animais.' },
      { nome: 'Falar com Animais', escola: 'Adivinhação', descricao: 'Fala com animais.' },
      { nome: 'Pé Leve', escola: 'Transmutação', descricao: 'Não deixa rastros por 1 hora/nível.' },
    ],
    2: [
      { nome: 'Curar Ferimentos Moderados', escola: 'Conjuração', descricao: 'Cura 2d8+1/nível (máx +10).' },
      { nome: 'Pele de Madeira', escola: 'Transmutação', descricao: '+2 bônus natural de CA.' },
      { nome: 'Proteção contra Energia', escola: 'Abjuração', descricao: 'Absorve dano de energia.' },
    ],
    3: [
      { nome: 'Curar Ferimentos Sérios', escola: 'Conjuração', descricao: 'Cura 3d8+1/nível (máx +15).' },
      { nome: 'Chamar Raio', escola: 'Evocação', descricao: '3d6 de dano elétrico por raio.' },
      { nome: 'Liberdade de Movimento', escola: 'Abjuração', descricao: 'Move normalmente apesar de impedimentos.' },
    ],
    4: [
      { nome: 'Curar Ferimentos Críticos', escola: 'Conjuração', descricao: 'Cura 4d8+1/nível (máx +20).' },
      { nome: 'Tempestade de Gelo', escola: 'Evocação', descricao: '3d6 de contusão + 2d6 de frio.' },
      { nome: 'Chama da Floresta', escola: 'Evocação', descricao: 'Área de chamas naturais.' },
    ],
  },
  'Explorador': {
    1: [
      { nome: 'Curar Ferimentos Leves', escola: 'Conjuração', descricao: 'Cura 1d8+1/nível (máx +5).' },
      { nome: 'Empatia com Animal', escola: 'Transmutação', descricao: 'Melhora reação de animais.' },
      { nome: 'Pé Leve', escola: 'Transmutação', descricao: 'Não deixa rastros.' },
    ],
    2: [
      { nome: 'Curar Ferimentos Moderados', escola: 'Conjuração', descricao: 'Cura 2d8+1/nível (máx +10).' },
      { nome: 'Pele de Madeira', escola: 'Transmutação', descricao: '+2 bônus natural de CA.' },
    ],
    3: [
      { nome: 'Curar Ferimentos Sérios', escola: 'Conjuração', descricao: 'Cura 3d8+1/nível (máx +15).' },
      { nome: 'Liberdade de Movimento', escola: 'Abjuração', descricao: 'Move normalmente.' },
    ],
    4: [
      { nome: 'Curar Ferimentos Críticos', escola: 'Conjuração', descricao: 'Cura 4d8+1/nível (máx +20).' },
      { nome: 'Forma Animal', escola: 'Transmutação', descricao: 'Assume forma de animal.' },
    ],
  },
}
// Feiticeiro usa a mesma lista de magias que o Mago
MAGIAS_PADRAO['Feiticeiro'] = MAGIAS_PADRAO['Mago']

export const ESCOLAS_MAGIA = [
  'Abjuração',
  'Adivinhação',
  'Conjuração',
  'Encantamento',
  'Evocação',
  'Ilusão',
  'Necromancia',
  'Transmutação',
  'Universal',
]

export const TENDENCIAS = [
  'Leal e Bom',
  'Neutro e Bom',
  'Caótico e Bom',
  'Leal e Neutro',
  'Neutro',
  'Caótico e Neutro',
  'Leal e Mau',
  'Neutro e Mau',
  'Caótico e Mau',
]

export const RACAS = [
  'Humano', 'Elfo', 'Anão', 'Halfling', 'Gnomo',
  'Meio-Elfo', 'Meio-Orc', 'Outro'
]

export const TAMANHOS = ['Miúdo', 'Pequeno', 'Médio', 'Grande', 'Enorme', 'Imenso', 'Colossal']

export const GENEROS = ['Masculino', 'Feminino', 'Outro']

export const TIPOS_EQUIPAMENTO = [
  'Armadura Leve', 'Armadura Média', 'Armadura Pesada',
  'Escudo', 'Arma Corpo a Corpo', 'Arma à Distância',
  'Anel', 'Amuleto', 'Cinto', 'Botas', 'Luvas',
  'Capacete', 'Capa', 'Acessório'
]

export const SLOTS_EQUIPAMENTO = [
  { id: 'capacete', nome: 'Capacete' },
  { id: 'amuleto', nome: 'Amuleto' },
  { id: 'armadura', nome: 'Armadura' },
  { id: 'capa', nome: 'Capa' },
  { id: 'braco_esq', nome: 'Braço Esq.' },
  { id: 'braco_dir', nome: 'Braço Dir.' },
  { id: 'luvas', nome: 'Luvas' },
  { id: 'cinto', nome: 'Cinto' },
  { id: 'anel_esq', nome: 'Anel Esq.' },
  { id: 'anel_dir', nome: 'Anel Dir.' },
  { id: 'botas', nome: 'Botas' },
  { id: 'arma_principal', nome: 'Arma Principal' },
  { id: 'arma_secundaria', nome: 'Arma Secundária' },
]

export const CRIATURAS_CONVOCAR = {
  1: [
    { nome: 'Cão Celestial', tipo: 'Animal (Celestial)', tamanho: 'Pequeno', pv: 6, ca: 13, ataque: '+2 mordida', dano: '1d4+1', deslocamento: '12 m', habilidades: ['Bom, resistência ao mal +2'] },
    { nome: 'Águia Celestial', tipo: 'Animal (Celestial)', tamanho: 'Pequeno', pv: 6, ca: 14, ataque: '+3 garras (×2)', dano: '1d4', deslocamento: '3 m / voo 24 m', habilidades: ['Ataques mágicos'] },
    { nome: 'Coruja Celestial', tipo: 'Animal (Celestial)', tamanho: 'Miúdo', pv: 5, ca: 17, ataque: '+5 garras', dano: '1d4', deslocamento: '3 m / voo 18 m', habilidades: ['Visão no escuro, voo silencioso'] },
    { nome: 'Rato Dire Infernal', tipo: 'Animal (Infernal)', tamanho: 'Pequeno', pv: 5, ca: 15, ataque: '+4 mordida', dano: '1d4', deslocamento: '12 m', habilidades: ['Resistência ao frio/fogo 5'] },
  ],
  2: [
    { nome: 'Lobo Celestial', tipo: 'Animal (Celestial)', tamanho: 'Médio', pv: 13, ca: 14, ataque: '+3 mordida', dano: '1d6+1', deslocamento: '15 m', habilidades: ['Derrubar (For 13), Farejador'] },
    { nome: 'Coruja Gigante Celestial', tipo: 'Animal (Celestial)', tamanho: 'Grande', pv: 19, ca: 15, ataque: '+5 garras (×2) / +0 mordida', dano: '1d6+1 / 1d8+2', deslocamento: '3 m / voo 18 m', habilidades: ['Visão no escuro aprimorada'] },
    { nome: 'Morcego Dire Infernal', tipo: 'Animal (Infernal)', tamanho: 'Médio', pv: 22, ca: 13, ataque: '+5 mordida', dano: '1d8+4', deslocamento: '3 m / voo 12 m', habilidades: ['Ecolocalização, Resistência a frio/fogo 5'] },
    { nome: 'Tubarão Infernal', tipo: 'Animal (Infernal)', tamanho: 'Médio', pv: 22, ca: 15, ataque: '+4 mordida', dano: '1d6+3', deslocamento: 'Nado 18 m', habilidades: ['Farejador (água), Resistência ao mal +2'] },
  ],
  3: [
    { nome: 'Urso Negro Celestial', tipo: 'Animal (Celestial)', tamanho: 'Médio', pv: 19, ca: 13, ataque: '+6 garras (×2) / +1 mordida', dano: '1d4+4 / 1d6+2', deslocamento: '12 m', habilidades: ['Agarrar aprimorado'] },
    { nome: 'Macaco Infernal', tipo: 'Animal (Infernal)', tamanho: 'Grande', pv: 32, ca: 14, ataque: '+8 garras (×2) / +3 mordida', dano: '1d6+5 / 1d6+2', deslocamento: '9 m / escalar 9 m', habilidades: ['Agarrar aprimorado, Resistência a frio/fogo 5'] },
    { nome: 'Leão Celestial', tipo: 'Animal (Celestial)', tamanho: 'Grande', pv: 32, ca: 15, ataque: '+7 garras (×2) / +2 mordida', dano: '1d4+5 / 1d8+2', deslocamento: '12 m', habilidades: ['Arranhão traseiro (1d6+2), Salto'] },
    { nome: 'Cobra Constritora Infernal', tipo: 'Animal (Infernal)', tamanho: 'Grande', pv: 19, ca: 15, ataque: '+5 mordida / +5 constrição', dano: '1d6+4', deslocamento: '9 m / nado 9 m', habilidades: ['Constrição, Agarrar aprimorado, Resistência a frio/fogo 5'] },
  ],
  4: [
    { nome: 'Tigre Celestial', tipo: 'Animal (Celestial)', tamanho: 'Grande', pv: 45, ca: 14, ataque: '+9 garras (×2) / +4 mordida', dano: '1d8+6 / 2d6+3', deslocamento: '12 m', habilidades: ['Arranhão traseiro (1d8+3), Salto, SR 11'] },
    { nome: 'Urso Pardo Celestial', tipo: 'Animal (Celestial)', tamanho: 'Grande', pv: 51, ca: 15, ataque: '+11 garras (×2) / +6 mordida', dano: '1d8+8 / 2d6+4', deslocamento: '12 m', habilidades: ['Agarrar, Abraço do urso (2d8+8), SR 13'] },
    { nome: 'Grifo Celestial', tipo: 'Mágica (Celestial)', tamanho: 'Grande', pv: 59, ca: 17, ataque: '+8 mordida / +3 garras (×2)', dano: '2d6+4 / 1d4+2', deslocamento: '9 m / voo 24 m', habilidades: ['Pousar sobre presa, SR 12'] },
    { nome: 'Escorpião Enorme Infernal', tipo: 'Animal (Infernal)', tamanho: 'Grande', pv: 47, ca: 16, ataque: '+6 pinças (×2) / +1 ferrão', dano: '1d8+4 / 1d6+2+veneno', deslocamento: '15 m', habilidades: ['Veneno CD 14 (1d6/1d6 Con), Agarrar, Resist. frio/fogo 10'] },
  ],
  5: [
    { nome: 'Elemental de Ar (Grande)', tipo: 'Elemental', tamanho: 'Grande', pv: 52, ca: 18, ataque: '+7 slam (×2)', dano: '1d8+4', deslocamento: 'Voo 30 m (perfeito)', habilidades: ['Remoinho (2d6+7, CD 19), Imune a veneno/sono/paralisia'] },
    { nome: 'Elemental de Terra (Grande)', tipo: 'Elemental', tamanho: 'Grande', pv: 68, ca: 18, ataque: '+12 slam (×2)', dano: '2d8+7', deslocamento: '6 m / escavar 6 m', habilidades: ['Esmagar criaturas pequenas, Imune a veneno/sono/paralisia'] },
    { nome: 'Elemental de Fogo (Grande)', tipo: 'Elemental', tamanho: 'Grande', pv: 60, ca: 16, ataque: '+7 slam (×2)', dano: '2d6+4+2d6 fogo', deslocamento: '12 m', habilidades: ['Dano de fogo extra, Imune a fogo, Vulnerável a frio'] },
    { nome: 'Elemental de Água (Grande)', tipo: 'Elemental', tamanho: 'Grande', pv: 68, ca: 19, ataque: '+8 slam (×2)', dano: '2d6+5', deslocamento: '6 m / nado 24 m', habilidades: ['Redemoinho (2d6+7, CD 18), Imune a veneno/sono/paralisia'] },
    { nome: 'Leão Dire Infernal', tipo: 'Animal (Infernal)', tamanho: 'Grande', pv: 60, ca: 15, ataque: '+12 garras (×2) / +7 mordida', dano: '1d6+9 / 1d8+4', deslocamento: '12 m', habilidades: ['Arranhão traseiro (1d6+4), Agarrar, Salto, SR 14, Resist. frio/fogo 10'] },
  ],
  6: [
    { nome: 'Elemental de Ar (Enorme)', tipo: 'Elemental', tamanho: 'Enorme', pv: 88, ca: 20, ataque: '+11 slam (×2)', dano: '2d8+7', deslocamento: 'Voo 30 m (perfeito)', habilidades: ['Remoinho (2d8+12, CD 23), Imune a veneno/sono/paralisia'] },
    { nome: 'Elemental de Terra (Enorme)', tipo: 'Elemental', tamanho: 'Enorme', pv: 104, ca: 20, ataque: '+17 slam (×2)', dano: '2d10+11', deslocamento: '6 m / escavar 6 m', habilidades: ['Esmagar, Imune a veneno/sono/paralisia'] },
    { nome: 'Urso Dire Celestial', tipo: 'Animal (Celestial)', tamanho: 'Grande', pv: 105, ca: 17, ataque: '+19 garras (×2) / +14 mordida', dano: '2d4+10 / 2d8+5', deslocamento: '12 m', habilidades: ['Agarrar, Abraço do urso (2d4+15), SR 16'] },
    { nome: 'Tiranossauro Infernal', tipo: 'Animal (Infernal)', tamanho: 'Enorme', pv: 99, ca: 14, ataque: '+20 mordida', dano: '3d6+13', deslocamento: '9 m', habilidades: ['Engolir inteiro (2d8+8, CD 27), SR 15, Resist. frio/fogo 10'] },
  ],
  7: [
    { nome: 'Elemental de Ar (Elder)', tipo: 'Elemental', tamanho: 'Enorme', pv: 204, ca: 26, ataque: '+18 slam (×2)', dano: '2d10+10', deslocamento: 'Voo 30 m (perfeito)', habilidades: ['Remoinho (2d10+16, CD 28), Imune, SR 23'] },
    { nome: 'Elemental de Terra (Elder)', tipo: 'Elemental', tamanho: 'Enorme', pv: 228, ca: 26, ataque: '+24 slam (×2)', dano: '3d8+13', deslocamento: '6 m / escavar 6 m', habilidades: ['Esmagar, Imune, SR 23'] },
    { nome: 'Tigre Dire Celestial', tipo: 'Animal (Celestial)', tamanho: 'Grande', pv: 95, ca: 17, ataque: '+16 garras (×2) / +11 mordida', dano: '2d4+8 / 2d6+4', deslocamento: '12 m', habilidades: ['Arranhão traseiro (2d4+4), Agarrar, Salto, SR 17'] },
    { nome: 'Salamandra Infernal (Nobre)', tipo: 'Extraplanar (Infernal)', tamanho: 'Grande', pv: 76, ca: 18, ataque: '+13 lança / +8 cauda (×2)', dano: '2d6+7+1d6 fogo / 2d6+3+1d6 fogo', deslocamento: '9 m', habilidades: ['Calor intenso (2d6 fogo, CD 19), Vulnerável a frio, SR 20'] },
  ],
  8: [
    { nome: 'Elemental de Fogo (Elder)', tipo: 'Elemental', tamanho: 'Enorme', pv: 204, ca: 26, ataque: '+18 slam (×2)', dano: '4d6+11+4d6 fogo', deslocamento: '12 m', habilidades: ['Dano de fogo, Imune a fogo, Vulnerável a frio, SR 23'] },
    { nome: 'Elemental de Água (Elder)', tipo: 'Elemental', tamanho: 'Enorme', pv: 228, ca: 27, ataque: '+21 slam (×2)', dano: '3d6+13', deslocamento: '6 m / nado 24 m', habilidades: ['Redemoinho (3d6+16), Imune, SR 23'] },
    { nome: 'Tojanida Ancião', tipo: 'Extraplanar', tamanho: 'Grande', pv: 147, ca: 22, ataque: '+14 mordida / +12 garras (×2)', dano: '4d6+7 / 2d8+3', deslocamento: '3 m / nado 24 m', habilidades: ['Puxar para dentro, Imune a fogo/frio, SR 25'] },
    { nome: 'Roc Celestial', tipo: 'Animal (Celestial)', tamanho: 'Colossal', pv: 184, ca: 17, ataque: '+18 garras (×2) / +13 mordida', dano: '2d6+12 / 2d8+6', deslocamento: '6 m / voo 24 m', habilidades: ['Agarrar (2d6+12), SR 19'] },
  ],
  9: [
    { nome: 'Guardinal Leonal', tipo: 'Celestial', tamanho: 'Médio', pv: 110, ca: 30, ataque: '+19 garras (×2) / +14 mordida', dano: '2d6+9 / 1d8+4', deslocamento: '15 m', habilidades: ['Rugido (3d6 sônico, CD 22), SR 30, Imune a eletricidade/veneno'] },
    { nome: 'Rainha Formiana', tipo: 'Extraplanar (Lawful)', tamanho: 'Grande', pv: 212, ca: 23, ataque: '+17 ferroada', dano: '2d6+8+veneno', deslocamento: '9 m', habilidades: ['Veneno (CD 23, 2d6/2d6 Con), Conjurador 17º, SR 30'] },
    { nome: 'Ghaele Eladrin', tipo: 'Celestial', tamanho: 'Médio', pv: 123, ca: 30, ataque: '+20 espada longa / +14 arco', dano: '1d8+8+2d6 sagrado / 1d6+4', deslocamento: '15 m / voo 18 m', habilidades: ['Olhar (2d8 fogo, CD 19), SR 31, Imune a eletricidade/frio/veneno'] },
    { nome: 'Elemental de Ar (Maior)', tipo: 'Elemental', tamanho: 'Enorme', pv: 178, ca: 24, ataque: '+15 slam (×2)', dano: '2d8+8', deslocamento: 'Voo 30 m (perfeito)', habilidades: ['Remoinho (2d8+13, CD 26), Imune, SR 21'] },
  ],
}

export const RECURSOS_PADRAO = {
  'Bárbaro':       n => [{ nome: 'Fúria', icone: '🔥', total: 1 + Math.floor((n - 1) / 4) }],
  'Bardo':         n => [{ nome: 'Inspiração Bárdica', icone: '🎵', total: Math.max(1, Math.floor(n / 4) + 1) }],
  'Clérigo':       n => [{ nome: 'Expulsar Mortos-Vivos', icone: '☀️', total: 3 }],
  'Druida':        n => [{ nome: 'Forma Selvagem', icone: '🐺', total: n >= 18 ? 6 : n >= 14 ? 5 : n >= 12 ? 4 : n >= 8 ? 3 : n >= 6 ? 2 : 1 }],
  'Monge':         n => [{ nome: 'Ataque em Turbilhão', icone: '🌀', total: 1 }, { nome: 'Queda Suave (m)', icone: '🌟', total: n * 6 }],
  'Paladino':      n => [{ nome: 'Expulsar Mortos-Vivos', icone: '✝️', total: 3 }, { nome: 'Imposição de Mãos', icone: '💚', total: 1 }],
  'Duskblade':     n => [{ nome: 'Arcane Channeling', icone: '⚡', total: n >= 13 ? Math.max(3, Math.floor(n / 2)) : 1 }],
  'Factotum':      n => [{ nome: 'Inspiração', icone: '✨', total: n }],
  'Warlock':       n => [{ nome: 'Invocação (à vontade)', icone: '💜', total: 5 }],
  'Hexblade':      n => [{ nome: 'Maldição do Hexblade', icone: '🪄', total: 1 + Math.floor((n + 2) / 5) }],
  'Ninja':         n => [{ nome: 'Ki (Invisibilidade)', icone: '🌑', total: Math.max(1, Math.floor(n / 2)) }],
  'Dragon Shaman': n => [{ nome: 'Sopro do Dragão', icone: '🐉', total: 3 }],
  'Crusader':      n => [{ nome: 'Cura Persistente', icone: '❤️', total: Math.ceil(n / 2) }],
  'Swordsage':     n => [{ nome: 'Recuperar Manobra', icone: '🗡️', total: 1 }],
  'Warblade':      n => [{ nome: 'Recuperar Manobra', icone: '⚔️', total: 1 }],
  'Beguiler':      n => [{ nome: 'Magia Espontânea', icone: '🎯', total: 1 }],
  'Warmage':       n => [{ nome: 'Arma de Guerra', icone: '☄️', total: 1 }],
  'Scout':         n => [{ nome: 'Ataque em Movimento', icone: '🏹', total: 1 }],
}
