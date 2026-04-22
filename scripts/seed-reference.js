// Popula as tabelas ref_* com dados estáticos do D&D 3.5
// node scripts/seed-reference.js
import Database from 'better-sqlite3'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { mkdirSync, existsSync } from 'fs'
import { readFileSync } from 'fs'
import { initSchema } from '../src/db/schema.js'
import { RACAS, CLASSES, CRIATURAS } from '../src/db/referenceData.js'

const { talentos: TALENTOS_DND35, falhas: FALHAS_DND35 } = JSON.parse(
  readFileSync(new URL('../src/db/featsData.json', import.meta.url))
)

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')
const DB_FILE = join(DATA_DIR, 'grimoire.db')

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR)

const db = new Database(DB_FILE)
db.pragma('journal_mode = WAL')
initSchema(db)

function j(v) { return v == null ? null : JSON.stringify(v) }

db.transaction(() => {
  // ── ref_talentos ──────────────────────────────────────────────────────────
  db.prepare('DELETE FROM ref_talentos').run()
  const stmtTalento = db.prepare(`
    INSERT INTO ref_talentos (id, nome, livro, categoria, prerequisitos, descricao, efeitos)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  for (const t of TALENTOS_DND35) {
    stmtTalento.run(
      t.id, t.nome, t.livro,
      j(t.categoria),
      t.prerequisitos ?? '',
      t.descricao ?? '',
      j(t.efeitos ?? [])
    )
  }
  console.log(`ref_talentos: ${TALENTOS_DND35.length} registros`)

  // ── ref_falhas ────────────────────────────────────────────────────────────
  db.prepare('DELETE FROM ref_falhas').run()
  const stmtFalha = db.prepare(`
    INSERT INTO ref_falhas (id, nome, livro, descricao, efeitos)
    VALUES (?, ?, ?, ?, ?)
  `)
  for (const f of FALHAS_DND35) {
    stmtFalha.run(f.id, f.nome, f.livro, f.descricao ?? '', j(f.efeitos ?? []))
  }
  console.log(`ref_falhas: ${FALHAS_DND35.length} registros`)

  // ── ref_racas ─────────────────────────────────────────────────────────────
  db.prepare('DELETE FROM ref_racas').run()
  const stmtRaca = db.prepare(`
    INSERT INTO ref_racas (id, nome, livro, descricao, atributos, tamanho, deslocamento, visao, habilidades)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  for (const r of RACAS) {
    stmtRaca.run(
      r.id, r.nome, r.livro, r.descricao ?? '',
      j(r.atributos ?? {}),
      r.tamanho ?? 'Médio',
      r.deslocamento ?? 9,
      r.visao ?? 'Normal',
      j(r.habilidades ?? [])
    )
  }
  console.log(`ref_racas: ${RACAS.length} registros`)

  // ── ref_classes ───────────────────────────────────────────────────────────
  db.prepare('DELETE FROM ref_classes').run()
  const stmtClasse = db.prepare(`
    INSERT INTO ref_classes (id, nome, livro, tipo, descricao, dado_vida, bab, saves, habilidades)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  for (const c of CLASSES) {
    stmtClasse.run(
      c.id, c.nome, c.livro, c.tipo ?? 'Base', c.descricao ?? '',
      c.dado_vida ?? 8,
      c.bab ?? 'Médio',
      j(c.saves ?? {}),
      j(c.habilidades ?? [])
    )
  }
  console.log(`ref_classes: ${CLASSES.length} registros`)

  // ── ref_criaturas ─────────────────────────────────────────────────────────
  db.prepare('DELETE FROM ref_criaturas').run()
  const stmtCriatura = db.prepare(`
    INSERT INTO ref_criaturas
      (id, nome, livro, nivel_sm, tamanho, tipo, alinhamento, pv, ca, "for", des, con, int_val, sab, car, ataque, habilidades)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  for (const c of CRIATURAS) {
    stmtCriatura.run(
      c.id, c.nome, c.livro ?? 'MM', c.nivel_sm ?? 1,
      c.tamanho ?? 'Médio', c.tipo ?? 'Besta', c.alinhamento ?? 'Neutro',
      c.pv ?? '1d8', c.ca ?? 10,
      c.for ?? 10, c.des ?? 10, c.con ?? 10,
      c.int ?? 1, c.sab ?? 10, c.car ?? 10,
      c.ataque ?? '', j(c.habilidades ?? [])
    )
  }
  console.log(`ref_criaturas: ${CRIATURAS.length} registros`)
})()

console.log('\nSeed concluído!')
