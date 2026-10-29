// Schema v2. Se o banco veio do v1, as tabelas antigas são renomeadas para v1_* (vários nomes
// colidem: players, npcs, quests) e convertidas pela migração 002.
const V1_TABLES = ['personagens', 'magias', 'magias_preparadas', 'equipamentos', 'mochila', 'backgrounds',
  'players', 'talentos', 'recursos', 'anotacoes', 'npcs', 'locais', 'quests']

const abilityCols = ['str', 'dex', 'con', 'int', 'wis', 'cha']
  .map(a => `${a}_base INTEGER NOT NULL DEFAULT 10, ${a}_enh INTEGER NOT NULL DEFAULT 0, ${a}_misc INTEGER NOT NULL DEFAULT 0,
    ${a}_temp INTEGER NOT NULL DEFAULT 0, ${a}_damage INTEGER NOT NULL DEFAULT 0, ${a}_drain INTEGER NOT NULL DEFAULT 0`)
  .join(',\n    ')

const saveCols = ['fort', 'ref', 'will']
  .map(s => `${s}_magic INTEGER NOT NULL DEFAULT 0, ${s}_misc INTEGER NOT NULL DEFAULT 0, ${s}_temp INTEGER NOT NULL DEFAULT 0`)
  .join(',\n    ')

// Tabelas filhas de characters (todas com character_id + cascade + índice)
const child = (name, cols) => `
  CREATE TABLE ${name} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    ${cols}
  );
  CREATE INDEX idx_${name}_character ON ${name}(character_id);`

export function up(db) {
  const existing = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map(r => r.name))
  if (existing.has('personagens')) {
    for (const t of V1_TABLES) if (existing.has(t)) db.exec(`ALTER TABLE "${t}" RENAME TO "v1_${t}"`)
  }

  db.exec(`
  CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT);

  CREATE TABLE characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL DEFAULT '',
    player TEXT,
    race_id TEXT, race_name TEXT,
    alignment TEXT, deity TEXT, gender TEXT, age TEXT, height TEXT, weight TEXT,
    eyes TEXT, hair TEXT, skin TEXT, languages TEXT,
    size TEXT NOT NULL DEFAULT 'medium',
    speed_ft INTEGER NOT NULL DEFAULT 30,
    xp INTEGER NOT NULL DEFAULT 0,
    personality TEXT, flaw TEXT, background TEXT,
    photo TEXT,
    cp INTEGER NOT NULL DEFAULT 0, sp INTEGER NOT NULL DEFAULT 0,
    gp INTEGER NOT NULL DEFAULT 0, pp INTEGER NOT NULL DEFAULT 0,
    hp_max INTEGER NOT NULL DEFAULT 0, hp_current INTEGER NOT NULL DEFAULT 0,
    hp_temp INTEGER NOT NULL DEFAULT 0, nonlethal INTEGER NOT NULL DEFAULT 0,
    ${abilityCols},
    ac_armor INTEGER NOT NULL DEFAULT 0, ac_shield INTEGER NOT NULL DEFAULT 0,
    ac_natural INTEGER NOT NULL DEFAULT 0, ac_deflection INTEGER NOT NULL DEFAULT 0,
    ac_dodge INTEGER NOT NULL DEFAULT 0, ac_misc INTEGER NOT NULL DEFAULT 0,
    ac_temp INTEGER NOT NULL DEFAULT 0, ac_override INTEGER,
    ${saveCols},
    init_misc INTEGER NOT NULL DEFAULT 0, grapple_misc INTEGER NOT NULL DEFAULT 0,
    melee_misc INTEGER NOT NULL DEFAULT 0, ranged_misc INTEGER NOT NULL DEFAULT 0,
    bab_override INTEGER,
    sr INTEGER NOT NULL DEFAULT 0, dr TEXT,
    roll20_extra TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  ${child('character_classes', `
    class_id TEXT NOT NULL,
    custom_name TEXT,
    level INTEGER NOT NULL DEFAULT 1 CHECK (level BETWEEN 0 AND 40),
    hd INTEGER, bab_prog TEXT, fort_prog TEXT, ref_prog TEXT, will_prog TEXT,
    caster_ability TEXT,
    domains TEXT,
    advances_id INTEGER REFERENCES character_classes(id) ON DELETE SET NULL,
    advance_levels INTEGER`)}

  ${child('skills', `
    skill_id TEXT NOT NULL,
    custom_name TEXT,
    ability TEXT,
    ranks REAL NOT NULL DEFAULT 0,
    class_skill INTEGER,
    misc INTEGER NOT NULL DEFAULT 0`)}

  ${child('attacks', `
    name TEXT NOT NULL DEFAULT '',
    kind TEXT NOT NULL DEFAULT 'melee',
    ability TEXT,
    enh INTEGER NOT NULL DEFAULT 0, misc INTEGER NOT NULL DEFAULT 0,
    damage_dice TEXT, damage_ability TEXT, damage_mult REAL, damage_misc INTEGER NOT NULL DEFAULT 0,
    crit_range INTEGER NOT NULL DEFAULT 20, crit_mult INTEGER NOT NULL DEFAULT 2,
    range_ft INTEGER, damage_type TEXT, ammo INTEGER, notes TEXT`)}

  ${child('items', `
    location TEXT NOT NULL DEFAULT 'backpack',
    icon TEXT, name TEXT NOT NULL DEFAULT '',
    qty REAL NOT NULL DEFAULT 1, weight_lb REAL NOT NULL DEFAULT 0, cost_gp REAL,
    notes TEXT,
    ac_type TEXT, ac_bonus INTEGER, max_dex INTEGER, acp INTEGER, spell_failure INTEGER`)}

  ${child('feats', `
    ref_id TEXT,
    kind TEXT NOT NULL DEFAULT 'feat',
    name TEXT NOT NULL DEFAULT '',
    description TEXT`)}

  ${child('class_resources', `
    key TEXT,
    class_row_id INTEGER REFERENCES character_classes(id) ON DELETE CASCADE,
    name TEXT, icon TEXT,
    kind TEXT NOT NULL DEFAULT 'uses',
    total_override INTEGER,
    pool_used INTEGER NOT NULL DEFAULT 0,
    notes TEXT`)}

  CREATE TABLE resource_uses (
    resource_id INTEGER NOT NULL REFERENCES class_resources(id) ON DELETE CASCADE,
    idx INTEGER NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    note TEXT,
    PRIMARY KEY (resource_id, idx)
  );

  ${child('spells', `
    class_row_id INTEGER REFERENCES character_classes(id) ON DELETE SET NULL,
    level INTEGER NOT NULL DEFAULT 0 CHECK (level BETWEEN 0 AND 9),
    name TEXT NOT NULL DEFAULT '',
    school TEXT, description TEXT,
    builtin_key TEXT,
    is_domain INTEGER NOT NULL DEFAULT 0`)}

  ${child('spells_prepared', `
    spell_id INTEGER NOT NULL REFERENCES spells(id) ON DELETE CASCADE,
    class_row_id INTEGER REFERENCES character_classes(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 0,
    is_domain INTEGER NOT NULL DEFAULT 0,
    used INTEGER NOT NULL DEFAULT 0`)}

  CREATE TABLE spell_slots (
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    class_row_id INTEGER NOT NULL REFERENCES character_classes(id) ON DELETE CASCADE,
    level INTEGER NOT NULL CHECK (level BETWEEN 0 AND 9),
    bonus INTEGER NOT NULL DEFAULT 0,
    used INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (class_row_id, level)
  );
  CREATE INDEX idx_spell_slots_character ON spell_slots(character_id);

  ${child('summons', `
    name TEXT NOT NULL DEFAULT '',
    ref_creature_id TEXT,
    data TEXT,
    hp_current INTEGER NOT NULL DEFAULT 0,
    hp_max INTEGER NOT NULL DEFAULT 0,
    spell_level INTEGER,
    rounds_left INTEGER`)}

  ${child('players', `name TEXT NOT NULL DEFAULT '', class TEXT, race TEXT, notes TEXT`)}

  ${child('npcs', `name TEXT NOT NULL DEFAULT '', gender TEXT, occupation TEXT, notes TEXT, photo TEXT`)}

  ${child('places', `name TEXT NOT NULL DEFAULT '', notes TEXT`)}

  ${child('quests', `
    name TEXT NOT NULL DEFAULT '',
    place_id INTEGER REFERENCES places(id) ON DELETE SET NULL,
    kind TEXT NOT NULL DEFAULT 'side',
    status TEXT NOT NULL DEFAULT 'open',
    reward TEXT, notes TEXT`)}

  CREATE TABLE quest_npcs (
    quest_id INTEGER NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    npc_id INTEGER NOT NULL REFERENCES npcs(id) ON DELETE CASCADE,
    PRIMARY KEY (quest_id, npc_id)
  );

  ${child('notes', `
    title TEXT NOT NULL DEFAULT '',
    content TEXT,
    session_date TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))`)}
  `)

  // Tabelas de referência: recriadas sempre pelo seed (server/seed.js)
  for (const t of ['ref_talentos', 'ref_falhas', 'ref_racas', 'ref_classes', 'ref_criaturas']) {
    db.exec(`DROP TABLE IF EXISTS "${t}"`)
  }
  db.exec(`
  CREATE TABLE ref_talentos (id TEXT PRIMARY KEY, nome TEXT, nome_en TEXT, livro TEXT, categoria TEXT,
    prerequisitos TEXT, descricao TEXT, descricao_en TEXT, efeitos TEXT);
  CREATE TABLE ref_falhas (id TEXT PRIMARY KEY, nome TEXT, livro TEXT, descricao TEXT, efeitos TEXT);
  CREATE TABLE ref_racas (id TEXT PRIMARY KEY, nome TEXT, livro TEXT, descricao TEXT, atributos TEXT,
    tamanho TEXT, deslocamento INTEGER, visao TEXT, habilidades TEXT);
  CREATE TABLE ref_classes (id TEXT PRIMARY KEY, nome TEXT, livro TEXT, tipo TEXT, descricao TEXT,
    dado_vida INTEGER, bab TEXT, saves TEXT, habilidades TEXT);
  CREATE TABLE ref_criaturas (id TEXT PRIMARY KEY, nome TEXT, livro TEXT, nivel_sm INTEGER, tamanho TEXT,
    tipo TEXT, alinhamento TEXT, pv TEXT, ca INTEGER, "for" INTEGER, des INTEGER, con INTEGER,
    int_val INTEGER, sab INTEGER, car INTEGER, ataque TEXT, habilidades TEXT);
  `)
}
