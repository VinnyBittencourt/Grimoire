export const TABLES = [
  'personagens',
  'magias',
  'magias_preparadas',
  'equipamentos',
  'mochila',
  'backgrounds',
  'players',
  'talentos',
  'recursos',
  'anotacoes',
  'npcs',
  'locais',
  'quests',
]

export const EMPTY_DB = Object.fromEntries(TABLES.map(t => [t, []]))

export function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS personagens (
      id INTEGER PRIMARY KEY,
      nome TEXT, classe TEXT, multiclasses TEXT, dominio TEXT, divindade TEXT,
      "for" INTEGER, des INTEGER, con INTEGER, "int" INTEGER, sab INTEGER, car INTEGER,
      pv INTEGER, ca INTEGER, level INTEGER,
      raca TEXT, idade TEXT, sexo TEXT, tamanho TEXT, deslocamento INTEGER,
      tendencia TEXT, falha TEXT, personalidade TEXT,
      moeda_cobre INTEGER DEFAULT 0, moeda_prata INTEGER DEFAULT 0,
      moeda_ouro INTEGER DEFAULT 0, moeda_platina INTEGER DEFAULT 0,
      criatura_invocada_json TEXT, foto_base64 TEXT
    );

    CREATE TABLE IF NOT EXISTS magias (
      id INTEGER PRIMARY KEY,
      personagem_id INTEGER, nome TEXT, nivel INTEGER, escola TEXT, descricao TEXT
    );

    CREATE TABLE IF NOT EXISTS magias_preparadas (
      id INTEGER PRIMARY KEY,
      personagem_id INTEGER, magia_id INTEGER,
      usos_restantes INTEGER, usos_max INTEGER,
      nome TEXT, nivel INTEGER, escola TEXT, descricao TEXT
    );

    CREATE TABLE IF NOT EXISTS equipamentos (
      id INTEGER PRIMARY KEY,
      personagem_id INTEGER, slot TEXT, nome TEXT, tipo TEXT, info TEXT
    );

    CREATE TABLE IF NOT EXISTS mochila (
      id INTEGER PRIMARY KEY,
      personagem_id INTEGER, nome TEXT, quantidade INTEGER, peso REAL, descricao TEXT
    );

    CREATE TABLE IF NOT EXISTS backgrounds (
      id INTEGER PRIMARY KEY,
      personagem_id INTEGER, texto TEXT
    );

    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY,
      personagem_id INTEGER, nome TEXT, contato TEXT
    );

    CREATE TABLE IF NOT EXISTS talentos (
      id INTEGER PRIMARY KEY,
      personagem_id INTEGER, nome TEXT, descricao TEXT
    );

    CREATE TABLE IF NOT EXISTS recursos (
      id INTEGER PRIMARY KEY,
      personagem_id INTEGER, classe TEXT, nome TEXT, descricao TEXT,
      total INTEGER, usos_json TEXT
    );

    CREATE TABLE IF NOT EXISTS anotacoes (
      id INTEGER PRIMARY KEY,
      personagem_id INTEGER, titulo TEXT, conteudo TEXT, data TEXT
    );

    CREATE TABLE IF NOT EXISTS npcs (
      id INTEGER PRIMARY KEY,
      personagem_id INTEGER, nome TEXT, descricao TEXT, relacionamento TEXT
    );

    CREATE TABLE IF NOT EXISTS locais (
      id INTEGER PRIMARY KEY,
      personagem_id INTEGER, nome TEXT, descricao TEXT, coordenadas TEXT
    );

    CREATE TABLE IF NOT EXISTS quests (
      id INTEGER PRIMARY KEY,
      personagem_id INTEGER, nome TEXT, descricao TEXT, status TEXT, recompensa TEXT
    );
  `)
}
