// Dados de referência estáticos do D&D 3.5 — raças, classes e criaturas invocáveis
// Talentos e falhas vêm de dnd35Feats.js (importados no seed script)

export const RACAS = [
  // ── PHB ──────────────────────────────────────────────────────────────────
  { id: 'humano', nome: 'Humano', livro: 'PHB', tamanho: 'Médio', deslocamento: 9, visao: 'Normal',
    atributos: {}, descricao: 'Versátil e adaptável. Ganha um talento extra no 1º nível e 4 pontos de perícia extras.',
    habilidades: ['Talento bônus no nível 1', '+4 pontos de perícia no nível 1', '+1 ponto de perícia por nível', 'Qualquer idioma bônus'] },

  { id: 'anao', nome: 'Anão', livro: 'PHB', tamanho: 'Médio', deslocamento: 6, visao: 'Visão no Escuro 18m',
    atributos: { con: 2, car: -2 }, descricao: 'Resistente, teimoso e hábil com pedra e metal.',
    habilidades: ['Estabilidade (+4 vs. investida e viagem)', '+2 Fortitude vs. veneno', '+2 Fortitude vs. magia', '+1 ataque vs. orcs e goblinoids', '+4 CA vs. gigantes', '+2 Avaliação/Artesanato (pedra)', 'Detectar inclinações em pedra 1-5'] },

  { id: 'elfo', nome: 'Elfo', livro: 'PHB', tamanho: 'Médio', deslocamento: 9, visao: 'Visão na Penumbra',
    atributos: { des: 2, con: -2 }, descricao: 'Gracioso e inteligente, com afinidade pela magia e natureza.',
    habilidades: ['Imune a sono mágico', '+2 vs. encantamentos', 'Proficiência com espada longa/fina e arco', '+2 Ouvir/Procurar/Observar', 'Detectar portas secretas passivamente'] },

  { id: 'gnomo', nome: 'Gnomo', livro: 'PHB', tamanho: 'Pequeno', deslocamento: 6, visao: 'Visão na Penumbra',
    atributos: { con: 2, for: -2 }, descricao: 'Curioso e inventivo, com dons para ilusões e comunicação com animais.',
    habilidades: ['+1 DC ilusões', 'Falar com animais (toupeiras/mustelídeos, 1/dia)', '+2 Ouvir', '+4 CA vs. gigantes', '+2 Artesanato (alquimia)'] },

  { id: 'meio_elfo', nome: 'Meio-Elfo', livro: 'PHB', tamanho: 'Médio', deslocamento: 9, visao: 'Visão na Penumbra',
    atributos: {}, descricao: 'Combina o melhor das duas raças com habilidades sociais únicas.',
    habilidades: ['Imune a sono mágico', '+2 vs. encantamentos', '+1 Reunir Informações/Diplomacia', '+2 Ouvir/Procurar/Observar'] },

  { id: 'meio_orc', nome: 'Meio-Orc', livro: 'PHB', tamanho: 'Médio', deslocamento: 9, visao: 'Visão no Escuro 18m',
    atributos: { for: 2, int: -2, car: -2 }, descricao: 'Forte e resistente, mas mal visto pela sociedade.',
    habilidades: ['Orc Blood (conta como orc para qualificações)'] },

  { id: 'halfling', nome: 'Halfling', livro: 'PHB', tamanho: 'Pequeno', deslocamento: 6, visao: 'Normal',
    atributos: { des: 2, for: -2 }, descricao: 'Ágil, corajoso e sortudo.',
    habilidades: ['+2 Escalar/Saltar/Mover em Silêncio', '+1 todos saves', '+2 vs. medo', '+1 ataque com arremesso'] },

  // ── MM / Suplementos ─────────────────────────────────────────────────────
  { id: 'aasimar', nome: 'Aasimar', livro: 'Monster Manual', tamanho: 'Médio', deslocamento: 9, visao: 'Visão no Escuro 18m',
    atributos: { sab: 2, car: 2 }, descricao: 'Descendente de seres celestiais com poderes divinos naturais.',
    habilidades: ['Resistência ácido/frio/eletricidade 5', 'Luz (1/dia como feiticeiro nível 1)', '+2 Diplomatia/Percepção'] },

  { id: 'tiefling', nome: 'Tiefling', livro: 'Monster Manual', tamanho: 'Médio', deslocamento: 9, visao: 'Visão no Escuro 18m',
    atributos: { int: 2, des: 2, car: -2 }, descricao: 'Descendente de seres infernais com poderes sombrios.',
    habilidades: ['Resistência fogo/frio/eletricidade 5', 'Escuridão (1/dia como feiticeiro nível 1)', '+2 Blefar/Esconder'] },

  { id: 'genasi_fogo', nome: 'Genasi de Fogo', livro: 'Monster Manual', tamanho: 'Médio', deslocamento: 9, visao: 'Normal',
    atributos: { int: 2, sab: -2 }, descricao: 'Descendente de efreet ou espíritos do fogo.',
    habilidades: ['Imune a fogo', 'Vulnerável a frio', 'Produzir Chama (1/dia)', 'Resistência planar'] },

  { id: 'genasi_ar', nome: 'Genasi de Ar', livro: 'Monster Manual', tamanho: 'Médio', deslocamento: 9, visao: 'Normal',
    atributos: { des: 2, sab: -2 }, descricao: 'Descendente de djinni ou espíritos do ar.',
    habilidades: ['Levitar (1/dia)', 'Respirar livremente', 'Resistência planar'] },

  { id: 'genasi_terra', nome: 'Genasi de Terra', livro: 'Monster Manual', tamanho: 'Médio', deslocamento: 9, visao: 'Normal',
    atributos: { for: 2, con: 2, sab: -2, car: -2 }, descricao: 'Descendente de dao ou espíritos da terra.',
    habilidades: ['Passagem pela Pedra (1/dia)', 'Estabilidade (+4 vs. investida)', 'Resistência planar'] },

  { id: 'genasi_agua', nome: 'Genasi de Água', livro: 'Monster Manual', tamanho: 'Médio', deslocamento: 9, visao: 'Normal',
    atributos: { con: 2, sab: -2 }, descricao: 'Descendente de marids ou espíritos da água.',
    habilidades: ['Respirar na água', 'Nadar (deslocamento 9m)', 'Criar Água (1/dia)', 'Resistência planar'] },

  { id: 'drow', nome: 'Drow (Elfo Negro)', livro: 'Monster Manual', tamanho: 'Médio', deslocamento: 9, visao: 'Visão no Escuro 36m',
    atributos: { des: 2, int: 2, car: 2, con: -2 }, descricao: 'Elfos das profundezas, cruéis e magicamente dotados. Ajuste de nível +2.',
    habilidades: ['Imune a sono', '+2 vs. encantamentos', 'Resistência mágica 11+nível', 'Magias à vontade: Luzes Dançantes/Escuridão/Luz Fada', 'Sensível à luz (desv. em luz solar)'] },

  { id: 'duergar', nome: 'Duergar (Anão das Profundezas)', livro: 'Monster Manual', tamanho: 'Médio', deslocamento: 6, visao: 'Visão no Escuro 36m',
    atributos: { con: 2, car: -4 }, descricao: 'Anões sombrios das profundezas com poderes psiônicos. Ajuste de nível +1.',
    habilidades: ['Imune a paralisia/ilusão/veneno', '+2 Reflexos/Vontade vs. magia', 'Ampliação (1/dia)', 'Invisibilidade (1/dia)', 'Sensível à luz'] },

  // ── Eberron ──────────────────────────────────────────────────────────────
  { id: 'warforged', nome: 'Warforged', livro: 'Eberron Campaign Setting', tamanho: 'Médio', deslocamento: 9, visao: 'Normal',
    atributos: { con: 2, sab: -2, car: -2 }, descricao: 'Soldados construídos, vivos mas feitos de madeira, pedra e metal.',
    habilidades: ['Imunidade a veneno/sono/doença/náusea/fadiga/exaustão/efeitos de energia', 'Não come/respira/dorme', 'Armadura composta (+2 CA natural)', 'Curado por magias de reparação; prejudicado por cura normal'] },

  { id: 'changeling', nome: 'Changeling', livro: 'Eberron Campaign Setting', tamanho: 'Médio', deslocamento: 9, visao: 'Normal',
    atributos: { des: 2, for: -2 }, descricao: 'Descendentes de doppelgangers com capacidade de transformação limitada.',
    habilidades: ['Alterar forma (aparência de humanoide à vontade)', '+2 Blefar/Intuição/Sentido de Rua'] },

  { id: 'shifter', nome: 'Shifter', livro: 'Eberron Campaign Setting', tamanho: 'Médio', deslocamento: 9, visao: 'Visão na Penumbra',
    atributos: { des: 2, sab: -2 }, descricao: 'Descendentes de licantropes com capacidade de despertar traços bestiais.',
    habilidades: ['Shifting (bônus ao ativar, 1 vez/dia + Con por turno)', '+2 Equilíbrio/Escalar/Saltar'] },

  { id: 'kalashtar', nome: 'Kalashtar', livro: 'Eberron Campaign Setting', tamanho: 'Médio', deslocamento: 9, visao: 'Normal',
    atributos: { sab: 2, car: 2, for: -2 }, descricao: 'Humanos fundidos com espíritos quori, dotados de poderes mentais.',
    habilidades: ['Resistência mental 5 (vs. encantamento)', 'Mindlink (1/dia com um ser)', '+2 Sentido de Rua', 'Baseado em Sabedoria para poderes psiônicos'] },

  // ── Dragonlance ──────────────────────────────────────────────────────────
  { id: 'kender', nome: 'Kender', livro: 'Dragonlance Campaign Setting', tamanho: 'Pequeno', deslocamento: 6, visao: 'Normal',
    atributos: { des: 2, car: 2, for: -2, sab: -2 }, descricao: 'Raça de humanoide curioso e destemido, imune a medo mundano.',
    habilidades: ['Imune a medo não-mágico', '+4 vs. medo mágico', 'Mãos Vazias (habilidade especial de "pegar" itens)', '+2 Ladinagem/Abrir Fechadura'] },

  // ── Races of Stone ────────────────────────────────────────────────────────
  { id: 'goliath', nome: 'Goliath', livro: 'Races of Stone', tamanho: 'Médio', deslocamento: 9, visao: 'Normal',
    atributos: { for: 4, con: 2, des: -2, sab: -2 }, descricao: 'Humanoides montanhosos enormes, tratados como Grande para carregar e agarrar.',
    habilidades: ['Constituição Poderosa (Powerful Build)', '+2 Atletismo/Escalar/Nadar', 'Aclimatado a Altitude'] },

  // ── Races of the Wild ─────────────────────────────────────────────────────
  { id: 'raptorian', nome: 'Raptorian', livro: 'Races of the Wild', tamanho: 'Médio', deslocamento: 9, visao: 'Normal',
    atributos: { des: 2, sab: 2, for: -2 }, descricao: 'Humanoides aviários com asas vestigiais que se tornam funcionais ao subir de nível.',
    habilidades: ['Asas (voo 18m boa maneuverability ao nível 5)', '+4 Observar', '+2 Ouvir'] },
]

export const CLASSES = [
  // ── PHB — Classes Base ────────────────────────────────────────────────────
  { id: 'barbaro', nome: 'Bárbaro', livro: 'PHB', tipo: 'base', dado_vida: 12, bab: 'boa',
    saves: { fort: 'boa', ref: 'ruim', will: 'ruim' }, descricao: 'Guerreiro selvagem movido pela fúria primitiva.',
    habilidades: ['Fúria (1+/dia)', 'Deslocamento Acelerado +3m', 'Resistência Incansável', 'Evasão Selvagem', 'Redução de Dano (a partir do nível 7)'] },

  { id: 'bardo', nome: 'Bardo', livro: 'PHB', tipo: 'base', dado_vida: 6, bab: 'media',
    saves: { fort: 'ruim', ref: 'boa', will: 'boa' }, descricao: 'Artista com magias arcanas e habilidades sociais incomparáveis.',
    habilidades: ['Música de Bardo (Inspiração Bárdica, Canção de Sugestão, etc.)', 'Conhecimento de Bardo', 'Conjurar magias arcanas (lista própria, espontâneo)', 'Neutralizar Armadilhas (a partir do nível 2)'] },

  { id: 'clerigo', nome: 'Clérigo', livro: 'PHB', tipo: 'base', dado_vida: 8, bab: 'media',
    saves: { fort: 'boa', ref: 'ruim', will: 'boa' }, descricao: 'Sacerdote guerreiro que canaliza o poder divino de sua divindade.',
    habilidades: ['Conjurar magias divinas', 'Expulsar/Repreender Mortos-Vivos', '2 Domínios (poderes e magias)', 'Magia Espontânea (cura ou inflito)'] },

  { id: 'druida', nome: 'Druida', livro: 'PHB', tipo: 'base', dado_vida: 8, bab: 'media',
    saves: { fort: 'boa', ref: 'ruim', will: 'boa' }, descricao: 'Guardião da natureza com poderes de transformação e companheiro animal.',
    habilidades: ['Conjurar magias divinas (lista druida)', 'Companheiro Animal', 'Empatia Selvagem', 'Andante do Bosque', 'Imunidade a Veneno (nível 9)', 'Forma Selvagem (nível 5+)', 'Forma Vegetal (nível 13+)'] },

  { id: 'guerreiro', nome: 'Guerreiro', livro: 'PHB', tipo: 'base', dado_vida: 10, bab: 'boa',
    saves: { fort: 'boa', ref: 'ruim', will: 'ruim' }, descricao: 'Especialista em combate com talentos bônus de guerreiro.',
    habilidades: ['Talento bônus de Guerreiro a cada 2 níveis'] },

  { id: 'monge', nome: 'Monge', livro: 'PHB', tipo: 'base', dado_vida: 8, bab: 'media',
    saves: { fort: 'boa', ref: 'boa', will: 'boa' }, descricao: 'Artista marcial disciplinado que aprimora corpo e mente.',
    habilidades: ['Ataque Desarmado (dano crescente)', 'Rajada de Golpes (Flurry of Blows)', 'Esquiva de Sabedoria (+Sab na CA)', 'Ki Strike (mágico, legal, adamantino)', 'Queda Lenta', 'Passo Além da Vento', 'Mente Vazia', 'Corpo de Diamante'] },

  { id: 'paladino', nome: 'Paladino', livro: 'PHB', tipo: 'base', dado_vida: 10, bab: 'boa',
    saves: { fort: 'boa', ref: 'ruim', will: 'ruim' }, descricao: 'Campeão sagrado da ordem e do bem com poderes divinos.',
    habilidades: ['Detecção do Mal (à vontade)', 'Golpe Sagrado (1+Cha/dia)', 'Imposição de Mãos (Cha×nível PV/dia)', 'Aura Divina (+Cha saves aliados)', 'Curar Doença (1+/semana)', 'Montaria Sagrada (nível 5)', 'Expulsar Mortos-Vivos', 'Magias divinas (nível 4+)'] },

  { id: 'ranger', nome: 'Ranger', livro: 'PHB', tipo: 'base', dado_vida: 8, bab: 'boa',
    saves: { fort: 'boa', ref: 'boa', will: 'ruim' }, descricao: 'Explorador e caçador com expertise em terreno e inimigos específicos.',
    habilidades: ['Inimigo Favorito (+2 por escolha)', 'Terreno Favorito (nível 3+)', 'Companheiro Animal (nível 4)', 'Luta com Duas Armas (sem pré-req)', 'Magias divinas (nível 4+)', 'Senso do Bosque (nível 9)'] },

  { id: 'ladino', nome: 'Ladino', livro: 'PHB', tipo: 'base', dado_vida: 6, bab: 'media',
    saves: { fort: 'ruim', ref: 'boa', will: 'ruim' }, descricao: 'Especialista em furtividade, armadilhas e ataques por surpresa.',
    habilidades: ['Ataque Furtivo (+1d6 a cada 2 níveis)', 'Desviar Dispositivos/Neutralizar Armadilhas', 'Evasão (nível 2)', 'Sentido de Armadilha (nível 3)', 'Esquiva Instintiva (nível 4)', 'Talentos Especiais de Ladino (nível 10+)'] },

  { id: 'feiticeiro', nome: 'Feiticeiro', livro: 'PHB', tipo: 'base', dado_vida: 4, bab: 'ruim',
    saves: { fort: 'ruim', ref: 'ruim', will: 'boa' }, descricao: 'Lançador arcano inato com magias espontâneas e familiar.',
    habilidades: ['Conjurar magias arcanas (espontâneo, lista mago)', 'Familiar', 'Magias conhecidas fixas mas usos ilimitados por dia'] },

  { id: 'mago', nome: 'Mago', livro: 'PHB', tipo: 'base', dado_vida: 4, bab: 'ruim',
    saves: { fort: 'ruim', ref: 'ruim', will: 'boa' }, descricao: 'Estudioso da magia arcana com grimório e especialização opcional.',
    habilidades: ['Conjurar magias arcanas (preparado, lista mago)', 'Familiar', 'Especialização em escola (opcional)', 'Elaborar Pergaminho (nível 1)'] },

  // ── Complete Warrior ──────────────────────────────────────────────────────
  { id: 'hexblade', nome: 'Hexblade', livro: 'Complete Warrior', tipo: 'base', dado_vida: 10, bab: 'boa',
    saves: { fort: 'boa', ref: 'ruim', will: 'boa' }, descricao: 'Guerreiro arcano que amaldiçoa inimigos e conjura com armadura.',
    habilidades: ['Maldição do Hexblade (–2 em testes, 1+Cha/dia)', 'Aura Arcana (bônus em saves)', 'Familiar (nível 4)', 'Magias arcanas (nível 4+)'] },

  { id: 'swashbuckler', nome: 'Swashbuckler', livro: 'Complete Warrior', tipo: 'base', dado_vida: 10, bab: 'boa',
    saves: { fort: 'boa', ref: 'boa', will: 'ruim' }, descricao: 'Duelista ágil e gracioso que usa INT e DES no combate.',
    habilidades: ['Graça (DES em dano corpo-a-corpo nível 3)', 'Insightful Strike (INT em dano nível 5)', 'Evasão (nível 8)', 'Dodge Bonus crescente'] },

  // ── Complete Arcane ───────────────────────────────────────────────────────
  { id: 'warlock', nome: 'Warlock', livro: 'Complete Arcane', tipo: 'base', dado_vida: 6, bab: 'media',
    saves: { fort: 'ruim', ref: 'ruim', will: 'boa' }, descricao: 'Pactuante arcano com poderes à vontade derivados de seu patrono.',
    habilidades: ['Explosão Sobrenatural (Eldritch Blast, à vontade)', 'Invocações (Least/Lesser/Greater/Dark)', 'Detecção de Magia (à vontade)', 'Resistência a Dano (nível 3+)', 'Engano dos Sentidos (nível 8)'] },

  { id: 'warmage', nome: 'Warmage', livro: 'Complete Arcane', tipo: 'base', dado_vida: 6, bab: 'media',
    saves: { fort: 'ruim', ref: 'ruim', will: 'boa' }, descricao: 'Soldado arcano especializado em magia de dano, podendo conjurar com armadura.',
    habilidades: ['Armadura Arcana (nível 1, reduz falha de magia)', 'Lista de magias restrita (dano)', 'INT em dano de magias (nível 5)', 'Magias espontâneas'] },

  // ── Complete Divine ───────────────────────────────────────────────────────
  { id: 'favored_soul', nome: 'Alma Favorita', livro: 'Complete Divine', tipo: 'base', dado_vida: 8, bab: 'media',
    saves: { fort: 'boa', ref: 'boa', will: 'boa' }, descricao: 'Conjurador divino espontâneo, favorito de sua divindade.',
    habilidades: ['Magias divinas espontâneas (lista clérigo)', 'Proficiência com arma da divindade', 'Energia Bônus (nível 12)', 'Armadura Bônus (nível 17)'] },

  // ── Complete Adventurer ───────────────────────────────────────────────────
  { id: 'ninja', nome: 'Ninja', livro: 'Complete Adventurer', tipo: 'base', dado_vida: 6, bab: 'media',
    saves: { fort: 'ruim', ref: 'boa', will: 'boa' }, descricao: 'Agente das sombras com poderes ki e furtividade superior.',
    habilidades: ['Ataque Furtivo (+1d6/2 níveis)', 'Golpe Ki (adiciona For ou Des)', 'Passo Fantasma (invisibilidade momentânea)', 'Pulmão d\'Ferro (sem penalidade de concentração sob dano)', 'Surto de Velocidade'] },

  { id: 'scout', nome: 'Scout', livro: 'Complete Adventurer', tipo: 'base', dado_vida: 8, bab: 'boa',
    saves: { fort: 'ruim', ref: 'boa', will: 'ruim' }, descricao: 'Explorador rápido que causa mais dano ao se mover em combate.',
    habilidades: ['Escaramuça (+1d6 dano, +1 CA ao mover)', 'Detecção de Armadilhas', 'Ataque Não Letal', 'Treinamento em Terreno (nível 5+)'] },

  // ── PHB II ────────────────────────────────────────────────────────────────
  { id: 'duskblade', nome: 'Duskblade', livro: 'PHB II', tipo: 'base', dado_vida: 8, bab: 'boa',
    saves: { fort: 'boa', ref: 'ruim', will: 'ruim' }, descricao: 'Guerreiro arcano que canaliza magias através de sua arma.',
    habilidades: ['Canalização Arcana (magia → dano de arma)', 'Armadura Arcana completa (nível 7)', 'Ataque Instantâneo (nível 13)', 'Magias arcanas (lista própria)'] },

  { id: 'beguiler', nome: 'Beguiler', livro: 'PHB II', tipo: 'base', dado_vida: 6, bab: 'media',
    saves: { fort: 'ruim', ref: 'boa', will: 'boa' }, descricao: 'Trickster arcano especializado em encantamento e ilusão.',
    habilidades: ['Magias de encantamento/ilusão espontâneas', 'Armadura Arcana', 'Ataque Furtivo (+1d6 a cada 3 níveis)', 'Lista de magias expandida automaticamente'] },

  { id: 'knight', nome: 'Cavaleiro (Knight)', livro: 'PHB II', tipo: 'base', dado_vida: 12, bab: 'boa',
    saves: { fort: 'boa', ref: 'ruim', will: 'ruim' }, descricao: 'Protetor dedicado que provoca e absorve ataques para proteger aliados.',
    habilidades: ['Desafio do Cavaleiro (força inimigos a atacar o cavaleiro)', 'Escudo do Cavaleiro (proteção a aliados)', 'Resistência Cavaleiresca', 'Montura Cavaleiresca'] },

  // ── Eberron ───────────────────────────────────────────────────────────────
  { id: 'artificer', nome: 'Artificer', livro: 'Eberron Campaign Setting', tipo: 'base', dado_vida: 6, bab: 'media',
    saves: { fort: 'ruim', ref: 'ruim', will: 'boa' }, descricao: 'Construtor de itens mágicos e infusões, manipulador de energia mágica.',
    habilidades: ['Infusões (encantamentos em objetos)', 'Homúnculo (familiar construído)', 'Desativar Item Mágico', 'Reparar dano a constructs', 'Pontos de Artesanato bônus'] },

  // ── Tome of Battle ────────────────────────────────────────────────────────
  { id: 'crusader', nome: 'Crusader', livro: 'Tome of Battle', tipo: 'base', dado_vida: 10, bab: 'boa',
    saves: { fort: 'boa', ref: 'ruim', will: 'boa' }, descricao: 'Guerreiro divino com manobras de Devoted Spirit e capacidade de cura em batalha.',
    habilidades: ['Manobras (Devoted Spirit, White Raven, Stone Dragon)', 'Fúria Sagrada (cura aliados ao atacar)', 'Inspiração do Batalha (bônus temporário a aliados)'] },

  { id: 'swordsage', nome: 'Swordsage', livro: 'Tome of Battle', tipo: 'base', dado_vida: 8, bab: 'media',
    saves: { fort: 'ruim', ref: 'boa', will: 'boa' }, descricao: 'Artista marcial místico com domínio de várias disciplinas de combate.',
    habilidades: ['Manobras (Desert Wind, Diamond Mind, Setting Sun, Shadow Hand, Stone Dragon, Tiger Claw)', 'CA de Sabedoria (como monge)', 'Recuperação Rápida de Manobras'] },

  { id: 'warblade', nome: 'Warblade', livro: 'Tome of Battle', tipo: 'base', dado_vida: 12, bab: 'boa',
    saves: { fort: 'boa', ref: 'ruim', will: 'ruim' }, descricao: 'Guerreiro supremo com domínio de manobras marciais avançadas.',
    habilidades: ['Manobras (Diamond Mind, Iron Heart, Stone Dragon, Tiger Claw, White Raven)', 'Clareza de Batalha (INT em Reflexos)', 'Recuperação de Manobras como ação de movimento'] },

  // ── PHB — Prestígio ───────────────────────────────────────────────────────
  { id: 'arcane_archer', nome: 'Arqueiro Arcano', livro: 'PHB', tipo: 'prestigio', dado_vida: 8, bab: 'boa',
    saves: { fort: 'ruim', ref: 'boa', will: 'ruim' }, descricao: 'Arqueiro élfico que imbuí flechas com magia arcana.',
    habilidades: ['Flecha +1 a +5 (nível 2-10)', 'Flecha Buscadora (nível 2)', 'Flecha de Morte (nível 10)'] },

  { id: 'arcane_trickster', nome: 'Trickster Arcano', livro: 'PHB', tipo: 'prestigio', dado_vida: 4, bab: 'ruim',
    saves: { fort: 'ruim', ref: 'boa', will: 'boa' }, descricao: 'Combina magia arcana com habilidades de ladino.',
    habilidades: ['Ataque Furtivo (+1d6/nível)', 'Prestidigitação Rangeada', 'Prodígio Mágico'] },

  { id: 'assassin', nome: 'Assassino', livro: 'PHB', tipo: 'prestigio', dado_vida: 6, bab: 'media',
    saves: { fort: 'ruim', ref: 'boa', will: 'ruim' }, descricao: 'Matador profissional com habilidades de veneno e morte instantânea.',
    habilidades: ['Ataque Mortal (1/dia)', 'Ataque Furtivo (+1d6/nível)', 'Magias de Assassino', 'Evitar Veneno (nível 2)', 'Morte Silenciosa (nível 9)'] },

  { id: 'blackguard', nome: 'Guarda Negro', livro: 'PHB', tipo: 'prestigio', dado_vida: 10, bab: 'boa',
    saves: { fort: 'boa', ref: 'ruim', will: 'ruim' }, descricao: 'Anti-paladino sombrio que serve forças malignas.',
    habilidades: ['Golpe Profano', 'Expulsar Exalted', 'Aura do Desespero', 'Magias divinas do mal', 'Companheiro Sombrio'] },

  { id: 'dragon_disciple', nome: 'Discípulo do Dragão', livro: 'PHB', tipo: 'prestigio', dado_vida: 10, bab: 'media',
    saves: { fort: 'boa', ref: 'ruim', will: 'ruim' }, descricao: 'Feiticeiro que abraça seu sangue dracônico, transformando-se em dragão.',
    habilidades: ['Atributos dracônicos crescentes (+STR, +CON, +INT)', 'Armadura natural crescente', 'Sopro Dracônico (nível 4)', 'Asas (nível 9)'] },

  { id: 'duelist', nome: 'Duelista', livro: 'PHB', tipo: 'prestigio', dado_vida: 10, bab: 'boa',
    saves: { fort: 'ruim', ref: 'boa', will: 'ruim' }, descricao: 'Especialista em combate um-contra-um com armas de fineza.',
    habilidades: ['CA de Inteligência', 'Reflexo Apurado (adicional AoO)', 'Velocidade de Lâmina (ataque extra)', 'Golpe Preciso (dano extra vs. desprevenidos)'] },

  { id: 'eldritch_knight', nome: 'Cavaleiro Sobrenatural', livro: 'PHB', tipo: 'prestigio', dado_vida: 6, bab: 'boa',
    saves: { fort: 'boa', ref: 'ruim', will: 'ruim' }, descricao: 'Guerreiro-mago que combina perícia marcial com magia arcana.',
    habilidades: ['Progressão arcana completa (exceto nível 1)', 'Conjuração em Armadura'] },

  { id: 'mystic_theurge', nome: 'Teúrgo Místico', livro: 'PHB', tipo: 'prestigio', dado_vida: 4, bab: 'ruim',
    saves: { fort: 'ruim', ref: 'ruim', will: 'boa' }, descricao: 'Conjurador misto que avança em magia arcana e divina simultaneamente.',
    habilidades: ['Progressão arcana e divina simultânea', 'Nível efetivo total de ambas as classes crescente'] },

  { id: 'shadowdancer', nome: 'Dançarino das Sombras', livro: 'PHB', tipo: 'prestigio', dado_vida: 8, bab: 'media',
    saves: { fort: 'ruim', ref: 'boa', will: 'ruim' }, descricao: 'Artista das sombras que se teleporta e usa escuridão como aliada.',
    habilidades: ['Esconder nas Sombras', 'Passo das Sombras (teleporte curto)', 'Sombra Companheira (nível 3)', 'Defesa das Sombras (evasão aprimorada)'] },

  { id: 'loremaster', nome: 'Mestre do Saber', livro: 'PHB', tipo: 'prestigio', dado_vida: 4, bab: 'ruim',
    saves: { fort: 'ruim', ref: 'ruim', will: 'boa' }, descricao: 'Erudito supremo com segredos de poder mágico acumulado.',
    habilidades: ['Segredos (bônus diversos a cada 2 níveis)', 'Progressão arcana completa', '+1d6 em Conhecimento (qualquer)'] },
]

// ─────────────────────────────────────────────────────────────────────────────
// CRIATURAS INVOCÁVEIS
// nivel_sm: nível de Convocar Monstro (1-9); 0 = Convocar Aliado Natural
// ─────────────────────────────────────────────────────────────────────────────
export const CRIATURAS = [
  // ── Convocar Monstro I ────────────────────────────────────────────────────
  { id: 'celestial_dog', nome: 'Cão Celestial', livro: 'Monster Manual', nivel_sm: 1, tamanho: 'Pequeno', tipo: 'Animal', alinhamento: 'Neutro Bom',
    pv: '4d8', ca: 15, for: 13, des: 17, con: 15, int_val: 2, sab: 12, car: 6,
    ataque: 'Mordida +2 (1d4+1)', habilidades: ['Farejador', 'Resistência ácido/frio/eletricidade 5', 'Golpe Sagrado 1d6 (vs. mal)'] },

  { id: 'fiendish_rat_dire', nome: 'Rato Gigante Infernal', livro: 'Monster Manual', nivel_sm: 1, tamanho: 'Pequeno', tipo: 'Animal', alinhamento: 'Neutro Mau',
    pv: '1d8+1', ca: 15, for: 10, des: 17, con: 12, int_val: 1, sab: 12, car: 4,
    ataque: 'Mordida +4 (1d4)', habilidades: ['Resistência frio/fogo 5', 'RM 5', 'Ataque Furtivo +1d6'] },

  { id: 'celestial_owl', nome: 'Coruja Celestial', livro: 'Monster Manual', nivel_sm: 1, tamanho: 'Minúsculo', tipo: 'Animal', alinhamento: 'Neutro Bom',
    pv: '1d8', ca: 17, for: 4, des: 17, con: 10, int_val: 2, sab: 14, car: 4,
    ataque: 'Garras +5 (1d4-2)', habilidades: ['Visão na Penumbra', 'Farejador', 'Resistência ácido/frio/eletricidade 5'] },

  { id: 'fiendish_centipede_medium', nome: 'Centopeinha Monstruosa Média Infernal', livro: 'Monster Manual', nivel_sm: 1, tamanho: 'Médio', tipo: 'Animal', alinhamento: 'Neutro Mau',
    pv: '2d8', ca: 14, for: 9, des: 17, con: 10, int_val: 1, sab: 10, car: 2,
    ataque: 'Mordida +2 (1d6–1 + veneno)', habilidades: ['Veneno (Fort CD 10; 1d3 Des/1d3 Des)', 'RM 5'] },

  // ── Convocar Monstro II ───────────────────────────────────────────────────
  { id: 'celestial_eagle', nome: 'Águia Celestial', livro: 'Monster Manual', nivel_sm: 2, tamanho: 'Pequeno', tipo: 'Animal', alinhamento: 'Neutro Bom',
    pv: '1d8+1', ca: 14, for: 10, des: 15, con: 12, int_val: 2, sab: 14, car: 6,
    ataque: 'Garras +3 (1d4)', habilidades: ['Visão da Águia (+8 Observar)', 'Resistência ácido/frio/eletricidade 5', 'Golpe Sagrado 1d6'] },

  { id: 'celestial_wolf', nome: 'Lobo Celestial', livro: 'Monster Manual', nivel_sm: 2, tamanho: 'Médio', tipo: 'Animal', alinhamento: 'Neutro Bom',
    pv: '2d8+4', ca: 14, for: 13, des: 15, con: 15, int_val: 2, sab: 12, car: 6,
    ataque: 'Mordida +3 (1d6+1)', habilidades: ['Derrubada (após mordida, FOR CD 11)', 'Farejador', 'Resistência ácido/frio/eletricidade 5'] },

  { id: 'lantern_archon', nome: 'Archon Lanterna', livro: 'Monster Manual', nivel_sm: 2, tamanho: 'Pequeno', tipo: 'Outsider (Bom, Legal)', alinhamento: 'Legal Bom',
    pv: '1d8+1', ca: 13, for: 10, des: 13, con: 12, int_val: 6, sab: 11, car: 10,
    ataque: 'Raio de Luz +2 (1d6)', habilidades: ['Aura de Menagem', 'Luz Permanente', 'Teleporte (sem erro)', 'RM 11'] },

  { id: 'lemure', nome: 'Lêmure', livro: 'Monster Manual', nivel_sm: 2, tamanho: 'Médio', tipo: 'Outsider (Mau, Legal)', alinhamento: 'Legal Mau',
    pv: '2d8', ca: 10, for: 10, des: 10, con: 10, int_val: 0, sab: 11, car: 5,
    ataque: '2 Garras +2 (1d4)', habilidades: ['RM 5', 'Regeneração (qualquer dano sagrado ou bom)', 'Imune a fogo/veneno/mente'] },

  { id: 'fiendish_spider_medium', nome: 'Aranha Monstruosa Média Infernal', livro: 'Monster Manual', nivel_sm: 2, tamanho: 'Médio', tipo: 'Animal', alinhamento: 'Neutro Mau',
    pv: '2d8+2', ca: 14, for: 11, des: 17, con: 12, int_val: 1, sab: 10, car: 2,
    ataque: 'Mordida +4 (1d6 + veneno)', habilidades: ['Veneno (Fort CD 12; 1d4 For/1d4 For)', 'Escalar (velocidade 6m)', 'Teia', 'RM 5'] },

  // ── Convocar Monstro III ──────────────────────────────────────────────────
  { id: 'celestial_bear_black', nome: 'Urso Negro Celestial', livro: 'Monster Manual', nivel_sm: 3, tamanho: 'Médio', tipo: 'Animal', alinhamento: 'Neutro Bom',
    pv: '3d8+6', ca: 13, for: 19, des: 13, con: 15, int_val: 2, sab: 12, car: 6,
    ataque: '2 Garras +6 (1d4+4) + Mordida +1 (1d6+2)', habilidades: ['Abraço (abraço adicional se acertar garra)', 'Resistência ácido/frio/eletricidade 5', 'Golpe Sagrado 1d6'] },

  { id: 'dretch', nome: 'Dretch', livro: 'Monster Manual', nivel_sm: 3, tamanho: 'Pequeno', tipo: 'Outsider (Caótico, Mau)', alinhamento: 'Caótico Mau',
    pv: '2d8', ca: 16, for: 10, des: 10, con: 10, int_val: 5, sab: 11, car: 4,
    ataque: '2 Garras +2 (1d4) + Mordida –3 (1d4)', habilidades: ['Nuvem Fedorenta (3m, Fort CD 11 ou enjuada 1d6 rodadas)', 'RM 9', 'Telepatia 9m'] },

  { id: 'hound_archon', nome: 'Archon Cão (Hound Archon)', livro: 'Monster Manual', nivel_sm: 4, tamanho: 'Médio', tipo: 'Outsider (Bom, Legal)', alinhamento: 'Legal Bom',
    pv: '6d8+6', ca: 19, for: 15, des: 12, con: 13, int_val: 10, sab: 13, car: 12,
    ataque: 'Espada Longa +8 (1d8+3) ou Mordida +7 (1d8+2)', habilidades: ['Morfar em Cão', 'Boa Esperança (à vontade)', 'Detectar o Mal (à vontade)', 'Mensagem (à vontade)', 'RM 13'] },

  { id: 'fiendish_ape', nome: 'Macaco Infernal', livro: 'Monster Manual', nivel_sm: 3, tamanho: 'Grande', tipo: 'Animal', alinhamento: 'Neutro Mau',
    pv: '5d8+10', ca: 14, for: 21, des: 15, con: 14, int_val: 2, sab: 12, car: 7,
    ataque: '2 Punhos +8 (1d6+5) + Mordida +3 (1d6+2)', habilidades: ['Resistência frio/fogo 5', 'RM 7', 'Arremesso de Rochas'] },

  { id: 'fiendish_dire_wolf', nome: 'Lobo Gigante Infernal', livro: 'Monster Manual', nivel_sm: 3, tamanho: 'Grande', tipo: 'Animal', alinhamento: 'Neutro Mau',
    pv: '6d8+18', ca: 14, for: 25, des: 15, con: 17, int_val: 2, sab: 12, car: 10,
    ataque: 'Mordida +11 (1d8+10)', habilidades: ['Derrubada (FOR CD 23)', 'Farejador', 'RM 9'] },

  // ── Convocar Monstro IV ───────────────────────────────────────────────────
  { id: 'celestial_lion', nome: 'Leão Celestial', livro: 'Monster Manual', nivel_sm: 4, tamanho: 'Grande', tipo: 'Animal', alinhamento: 'Neutro Bom',
    pv: '5d8+10', ca: 15, for: 21, des: 17, con: 15, int_val: 2, sab: 12, car: 6,
    ataque: '2 Garras +7 (1d4+5) + Mordida +2 (1d8+2)', habilidades: ['Salto (pounce com ataque completo)', 'Rugido Aterrorizante', 'Resistência ácido/frio/eletricidade 5', 'Golpe Sagrado 2d6'] },

  { id: 'howler', nome: 'Howler', livro: 'Monster Manual', nivel_sm: 4, tamanho: 'Grande', tipo: 'Outsider (Caótico, Mau)', alinhamento: 'Caótico Mau',
    pv: '6d8+12', ca: 17, for: 19, des: 15, con: 15, int_val: 6, sab: 10, car: 8,
    ataque: 'Mordida +8 (2d8+4) + 1d4 Espinhos +3 (1d4+2)', habilidades: ['Uivo (Will CD 13 ou abalado)', 'RM 15'] },

  { id: 'fiendish_rhinoceros', nome: 'Rinoceronte Infernal', livro: 'Monster Manual', nivel_sm: 4, tamanho: 'Grande', tipo: 'Animal', alinhamento: 'Neutro Mau',
    pv: '8d8+24', ca: 16, for: 26, des: 10, con: 17, int_val: 2, sab: 13, car: 2,
    ataque: 'Chifre +12 (2d6+8)', habilidades: ['Investida (2d6+12, 4,5m)', 'Pisoteio (2d6+3)', 'RM 10'] },

  // ── Convocar Monstro V ────────────────────────────────────────────────────
  { id: 'celestial_brown_bear', nome: 'Urso Pardo Celestial', livro: 'Monster Manual', nivel_sm: 5, tamanho: 'Grande', tipo: 'Animal', alinhamento: 'Neutro Bom',
    pv: '6d8+24', ca: 15, for: 27, des: 13, con: 19, int_val: 2, sab: 12, car: 6,
    ataque: '2 Garras +11 (1d8+8) + Mordida +6 (2d6+4)', habilidades: ['Abraço (abraço após garra)', 'Resistência ácido/frio/eletricidade 10', 'Golpe Sagrado 2d6', 'RM 13'] },

  { id: 'xorn_minor', nome: 'Xorn Menor', livro: 'Monster Manual', nivel_sm: 5, tamanho: 'Pequeno', tipo: 'Outsider (Terra)', alinhamento: 'Neutro',
    pv: '3d8+3', ca: 23, for: 17, des: 10, con: 13, int_val: 10, sab: 11, car: 10,
    ataque: '3 Garras +6 (1d3+3) + Mordida +1 (2d6+1)', habilidades: ['Passagem pela Pedra', 'Detecção de Metais e Pedras Preciosas', 'Resistência a Fogo 10', 'Imunidade a Eletricidade/Frio'] },

  { id: 'elemental_medium_fire', nome: 'Elemental de Fogo (Médio)', livro: 'Monster Manual', nivel_sm: 5, tamanho: 'Médio', tipo: 'Elemental (Fogo)', alinhamento: 'Neutro',
    pv: '4d8+8', ca: 16, for: 14, des: 17, con: 14, int_val: 4, sab: 11, car: 11,
    ataque: 'Slam +4 (1d6+2 + 1d4 fogo)', habilidades: ['Imune a fogo', 'Vulnerável a frio', 'Illumination (claridade 3m)', 'Queimar (Fort CD 12 ou continua queimando)'] },

  { id: 'elemental_medium_water', nome: 'Elemental de Água (Médio)', livro: 'Monster Manual', nivel_sm: 5, tamanho: 'Médio', tipo: 'Elemental (Água)', alinhamento: 'Neutro',
    pv: '4d8+12', ca: 17, for: 18, des: 16, con: 17, int_val: 4, sab: 11, car: 11,
    ataque: 'Slam +7 (1d6+4)', habilidades: ['Movimento aquático total (9m)', 'Encharcar (apagar fogo natural)', 'Afogamento (agarrar; Fort CD 13 ou sufoca)'] },

  { id: 'elemental_medium_earth', nome: 'Elemental de Terra (Médio)', livro: 'Monster Manual', nivel_sm: 5, tamanho: 'Médio', tipo: 'Elemental (Terra)', alinhamento: 'Neutro',
    pv: '4d8+12', ca: 18, for: 20, des: 8, con: 17, int_val: 4, sab: 11, car: 11,
    ataque: 'Slam +8 (1d8+7)', habilidades: ['Passagem pela Terra', 'Golpe Arrasador (derruba automaticamente)'] },

  { id: 'elemental_medium_air', nome: 'Elemental de Ar (Médio)', livro: 'Monster Manual', nivel_sm: 5, tamanho: 'Médio', tipo: 'Elemental (Ar)', alinhamento: 'Neutro',
    pv: '4d8', ca: 17, for: 14, des: 21, con: 10, int_val: 4, sab: 11, car: 11,
    ataque: 'Slam +5 (1d6+2)', habilidades: ['Voo (9m, perfeita)', 'Vórtice (cilindro 3m de diâmetro, Fort CD 12 ou 2d6)'] },

  // ── Convocar Monstro VI ───────────────────────────────────────────────────
  { id: 'osyluth', nome: 'Osyluth (Diabo dos Ossos)', livro: 'Monster Manual', nivel_sm: 6, tamanho: 'Grande', tipo: 'Outsider (Mau, Legal)', alinhamento: 'Legal Mau',
    pv: '9d8+27', ca: 22, for: 21, des: 17, con: 17, int_val: 14, sab: 14, car: 14,
    ataque: 'Picada +9 (1d6+5 + veneno) + 2 Garras +4 (1d4+2) + Cauda +4 (3d4+2)',
    habilidades: ['Veneno (Fort CD 19; 1d6 FOR/1d6 FOR)', 'Medo (Will CD 14)', 'RM 21', 'Magias à vontade'] },

  { id: 'elemental_large_fire', nome: 'Elemental de Fogo (Grande)', livro: 'Monster Manual', nivel_sm: 6, tamanho: 'Grande', tipo: 'Elemental (Fogo)', alinhamento: 'Neutro',
    pv: '8d8+24', ca: 18, for: 20, des: 19, con: 16, int_val: 6, sab: 11, car: 11,
    ataque: '2 Slam +8 (2d6+5 + 2d6 fogo)', habilidades: ['Imune a fogo', 'Vulnerável a frio', 'Queimar (Fort CD 17)', 'Vórtice de Fogo (3d6)'] },

  { id: 'chaos_beast', nome: 'Besta do Caos', livro: 'Monster Manual', nivel_sm: 6, tamanho: 'Médio', tipo: 'Outsider (Caótico)', alinhamento: 'Caótico Neutro',
    pv: '8d8+8', ca: 16, for: 14, des: 13, con: 13, int_val: 10, sab: 10, car: 10,
    ataque: '2 Garras +8 (1d6+2 + Fluxo Corporal)', habilidades: ['Fluxo Corporal (Fort CD 15 ou trans. em Besta do Caos em 1d6 minutos)', 'Imune a transformação', 'Forma Amorfa'] },

  // ── Convocar Monstro VII ──────────────────────────────────────────────────
  { id: 'vrock', nome: 'Vrock', livro: 'Monster Manual', nivel_sm: 7, tamanho: 'Grande', tipo: 'Outsider (Caótico, Mau)', alinhamento: 'Caótico Mau',
    pv: '10d8+30', ca: 22, for: 23, des: 16, con: 17, int_val: 14, sab: 16, car: 16,
    ataque: '2 Garras +14 (2d6+6) + Picada +9 (1d8+3) + 2 Asas +9 (1d6+3)',
    habilidades: ['Esporos (2d6 dano + 1d2 por rodada por 10 rodadas; cura: Bênção)', 'Grito Ensurdecedor (1/hora, 3d6 + surdo)', 'RM 22', 'Magias à vontade'] },

  { id: 'bearded_devil', nome: 'Diabo Barbudo (Barbazu)', livro: 'Monster Manual', nivel_sm: 7, tamanho: 'Médio', tipo: 'Outsider (Mau, Legal)', alinhamento: 'Legal Mau',
    pv: '6d8+12', ca: 19, for: 15, des: 15, con: 15, int_val: 6, sab: 13, car: 11,
    ataque: 'Alabarda +8 (1d10+3 + infecção) ou Barba +3 (1d6+1 + infecção)',
    habilidades: ['Infecção da Barba (Fort CD 13 ou –1 FOR permanente)', 'Frenesi (haste quando ferido)', 'RM 17'] },

  { id: 'celestial_elephant', nome: 'Elefante Celestial', livro: 'Monster Manual', nivel_sm: 7, tamanho: 'Grande', tipo: 'Animal', alinhamento: 'Neutro Bom',
    pv: '11d8+44', ca: 15, for: 30, des: 10, con: 18, int_val: 2, sab: 13, car: 7,
    ataque: 'Presas +16 (2d6+10) ou Pisoteio +16 (2d8+15)', habilidades: ['Pisoteio', 'Presas', 'Resistência ácido/frio/eletricidade 10', 'Golpe Sagrado 3d6'] },

  // ── Convocar Monstro VIII ─────────────────────────────────────────────────
  { id: 'hezrou', nome: 'Hezrou', livro: 'Monster Manual', nivel_sm: 8, tamanho: 'Grande', tipo: 'Outsider (Caótico, Mau)', alinhamento: 'Caótico Mau',
    pv: '10d8+63', ca: 22, for: 29, des: 10, con: 25, int_val: 14, sab: 14, car: 18,
    ataque: 'Mordida +14 (4d4+9) + 2 Garras +9 (1d8+4)',
    habilidades: ['Abraço (abraço após mordida + 1d8+4/rodada)', 'Pestilência (Fort CD 23 ou doença)', 'RM 22', 'Magias à vontade'] },

  { id: 'hamatula', nome: 'Hamatula (Diabo Barbado)', livro: 'Monster Manual', nivel_sm: 8, tamanho: 'Médio', tipo: 'Outsider (Mau, Legal)', alinhamento: 'Legal Mau',
    pv: '12d8+36', ca: 20, for: 23, des: 17, con: 17, int_val: 12, sab: 14, car: 16,
    ataque: '2 Garras +13 (2d8+6) + Mordida +8 (2d8+3)',
    habilidades: ['Abraço de Espinhos (espinhos +4 no grapple)', 'Medo (Will CD 18)', 'RM 21', 'Magias à vontade'] },

  { id: 'elemental_greater_fire', nome: 'Elemental de Fogo (Grande Superior)', livro: 'Monster Manual', nivel_sm: 8, tamanho: 'Enorme', tipo: 'Elemental (Fogo)', alinhamento: 'Neutro',
    pv: '16d8+64', ca: 20, for: 26, des: 21, con: 18, int_val: 8, sab: 11, car: 11,
    ataque: '2 Slam +16 (3d6+8 + 2d6 fogo)', habilidades: ['Imune a fogo', 'Vórtice de Fogo (3d6+8)', 'Queimar (Fort CD 24)'] },

  // ── Convocar Monstro IX ───────────────────────────────────────────────────
  { id: 'astral_deva', nome: 'Deva Astral', livro: 'Monster Manual', nivel_sm: 9, tamanho: 'Médio', tipo: 'Outsider (Bom)', alinhamento: 'Neutro Bom',
    pv: '12d8+48', ca: 29, for: 22, des: 22, con: 18, int_val: 18, sab: 18, car: 20,
    ataque: 'Mace +5 de Atordoamento +18/+13/+8 (1d8+9 + atordoamento)',
    habilidades: ['Voo (18m, boa)', 'Magias à vontade (Ajuda, Cura Moderada, etc.)', 'Golpe Sagrado 5d6', 'Resistência 10 a tudo', 'RM 30'] },

  { id: 'glabrezu', nome: 'Glabrezu', livro: 'Monster Manual', nivel_sm: 9, tamanho: 'Grande', tipo: 'Outsider (Caótico, Mau)', alinhamento: 'Caótico Mau',
    pv: '12d8+96', ca: 27, for: 31, des: 10, con: 27, int_val: 16, sab: 16, car: 20,
    ataque: '2 Pinças +15 (2d8+10) + 2 Garras +10 (1d6+5) + Mordida +10 (1d8+5)',
    habilidades: ['Abraço de Pinças (2d8+15/rodada)', 'Confusão (Will CD 22)', 'Poderoso Lançador (+4 para Convocar)', 'RM 24', 'Magias à vontade'] },

  { id: 'elemental_elder_fire', nome: 'Elemental de Fogo (Ancião)', livro: 'Monster Manual', nivel_sm: 9, tamanho: 'Enorme', tipo: 'Elemental (Fogo)', alinhamento: 'Neutro',
    pv: '24d8+96', ca: 22, for: 30, des: 23, con: 18, int_val: 10, sab: 11, car: 11,
    ataque: '2 Slam +24 (4d6+10 + 4d6 fogo)', habilidades: ['Imune a fogo', 'Vórtice de Fogo (4d6+10)', 'Queimar (Fort CD 27)'] },

  { id: 'treant', nome: 'Treant', livro: 'Monster Manual', nivel_sm: 9, tamanho: 'Enorme', tipo: 'Planta', alinhamento: 'Neutro Bom',
    pv: '7d8+35', ca: 20, for: 29, des: 6, con: 21, int_val: 12, sab: 15, car: 12,
    ataque: '2 Socos +12 (2d6+9)', habilidades: ['Animar Árvores (2 árvores a cada 1 rodada, 1/dia)', 'Pisoteio (2d6+9)', 'Vulnerável a fogo'] },

  // ── Convocar Aliado Natural (Druida/Ranger) ───────────────────────────────
  { id: 'dire_wolf_san', nome: 'Lobo Gigante', livro: 'Monster Manual', nivel_sm: 0, tamanho: 'Grande', tipo: 'Animal', alinhamento: 'Neutro',
    pv: '6d8+18', ca: 14, for: 25, des: 15, con: 17, int_val: 2, sab: 12, car: 10,
    ataque: 'Mordida +11 (1d8+10)', habilidades: ['Derrubada (FOR CD 23)', 'Farejador'] },

  { id: 'bear_brown_san', nome: 'Urso Pardo', livro: 'Monster Manual', nivel_sm: 0, tamanho: 'Grande', tipo: 'Animal', alinhamento: 'Neutro',
    pv: '6d8+24', ca: 15, for: 27, des: 13, con: 19, int_val: 2, sab: 12, car: 6,
    ataque: '2 Garras +11 (1d8+8) + Mordida +6 (2d6+4)', habilidades: ['Abraço (após garra bem-sucedida)'] },

  { id: 'giant_crocodile_san', nome: 'Crocodilo Gigante', livro: 'Monster Manual', nivel_sm: 0, tamanho: 'Enorme', tipo: 'Animal', alinhamento: 'Neutro',
    pv: '7d8+28', ca: 16, for: 27, des: 10, con: 19, int_val: 1, sab: 12, car: 2,
    ataque: 'Mordida +11 (2d8+12) ou Cauda +6 (1d12+12)', habilidades: ['Rolar na Água (após mordida, dano automático)', 'Mergulhar (movimento aquático total)'] },

  { id: 'dire_bear_san', nome: 'Urso Gigante', livro: 'Monster Manual', nivel_sm: 0, tamanho: 'Grande', tipo: 'Animal', alinhamento: 'Neutro',
    pv: '12d8+51', ca: 17, for: 31, des: 13, con: 19, int_val: 2, sab: 12, car: 10,
    ataque: '2 Garras +18 (2d4+10) + Mordida +13 (2d8+5)', habilidades: ['Abraço Aprimorado (2d4+15/rodada)'] },

  { id: 'giant_eagle_san', nome: 'Águia Gigante', livro: 'Monster Manual', nivel_sm: 0, tamanho: 'Grande', tipo: 'Animal', alinhamento: 'Neutro Bom',
    pv: '4d8+4', ca: 15, for: 16, des: 15, con: 12, int_val: 10, sab: 14, car: 13,
    ataque: '2 Garras +4 (1d6+3) + Mordida –1 (1d8+1)', habilidades: ['Fala (Comum e Sylvan)', 'Voo (30m, boa manobrabilidade)'] },

  { id: 'shark_large_san', nome: 'Tubarão Grande', livro: 'Monster Manual', nivel_sm: 0, tamanho: 'Grande', tipo: 'Animal', alinhamento: 'Neutro',
    pv: '7d8+7', ca: 15, for: 21, des: 15, con: 13, int_val: 1, sab: 12, car: 2,
    ataque: 'Mordida +8 (1d8+7)', habilidades: ['Faro de Sangue (detectar sangue a 450m)', 'Ataques Frenéticos (+2 ataque/dano ao atacar criatura ferida)'] },

  { id: 'shambling_mound_san', nome: 'Monte Cambaleante', livro: 'Monster Manual', nivel_sm: 0, tamanho: 'Grande', tipo: 'Planta', alinhamento: 'Neutro',
    pv: '8d8+24', ca: 20, for: 21, des: 10, con: 16, int_val: 7, sab: 10, car: 9,
    ataque: '2 Socos +11 (2d6+5)', habilidades: ['Abraço (após soco; 2d6+7/rodada)', 'Imune a fogo elétrico (cura PV)', 'Vulnerável a fogo'] },
]
