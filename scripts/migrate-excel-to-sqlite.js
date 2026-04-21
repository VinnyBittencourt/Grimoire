// Roda uma vez: node scripts/migrate-excel-to-sqlite.js
import Database from 'better-sqlite3'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import * as XLSX from 'xlsx'
import { TABLES, initSchema } from '../src/db/schema.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')
const EXCEL_FILE = join(DATA_DIR, 'grimoire_data.xlsx')
const FOTOS_FILE = join(DATA_DIR, 'fotos.json')
const DB_FILE = join(DATA_DIR, 'grimoire.db')

if (!existsSync(EXCEL_FILE)) {
  console.log('Nenhum arquivo Excel encontrado. Nada a migrar.')
  process.exit(0)
}

console.log('Lendo Excel...')
const buf = readFileSync(EXCEL_FILE)
const wb = XLSX.read(buf, { type: 'buffer' })
const data = {}
for (const sheet of wb.SheetNames) {
  data[sheet] = XLSX.utils.sheet_to_json(wb.Sheets[sheet])
}

// Merge fotos nos personagens
if (existsSync(FOTOS_FILE)) {
  const fotos = JSON.parse(readFileSync(FOTOS_FILE, 'utf8'))
  data.personagens = (data.personagens || []).map(p => ({
    ...p,
    foto_base64: fotos[p.id] || '',
  }))
}

console.log('Inicializando SQLite...')
const db = new Database(DB_FILE)
db.pragma('journal_mode = WAL')
initSchema(db)

// Adiciona colunas que existem nos dados mas não no schema (dados legacy)
function ensureColumns(table, rows) {
  if (!rows || rows.length === 0) return
  const existing = db.pragma(`table_info("${table}")`).map(c => c.name)
  for (const col of Object.keys(rows[0])) {
    if (!existing.includes(col)) {
      db.exec(`ALTER TABLE "${table}" ADD COLUMN "${col}" TEXT`)
      console.log(`  [schema] Adicionada coluna "${col}" em "${table}"`)
    }
  }
}

let total = 0
db.transaction(() => {
  for (const table of TABLES) {
    const rows = data[table]
    if (!Array.isArray(rows) || rows.length === 0) continue
    ensureColumns(table, rows)
    const cols = Object.keys(rows[0])
    const stmt = db.prepare(
      `INSERT OR REPLACE INTO "${table}" (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`
    )
    for (const row of rows) {
      stmt.run(cols.map(c => row[c] ?? null))
    }
    console.log(`  ${table}: ${rows.length} registros migrados`)
    total += rows.length
  }
})()

console.log(`\nMigração concluída! ${total} registros no total.`)
console.log(`Banco: ${DB_FILE}`)
console.log('O arquivo Excel original foi mantido como backup em data/grimoire_data.xlsx')
