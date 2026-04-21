import express from 'express'
import Database from 'better-sqlite3'
import { existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { initSchema, TABLES, EMPTY_DB } from './src/db/schema.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, 'data')
const DB_FILE = join(DATA_DIR, 'grimoire.db')

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR)

const db = new Database(DB_FILE)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')
initSchema(db)

const app = express()
app.use(express.json({ limit: '100mb' }))

// Lê todas as tabelas e retorna o objeto completo (mesma forma do Excel)
app.get('/api/data', (req, res) => {
  try {
    const result = { ...EMPTY_DB }
    for (const table of TABLES) {
      result[table] = db.prepare(`SELECT * FROM "${table}"`).all()
    }
    res.json(result)
  } catch (e) {
    console.error('Erro ao ler dados:', e)
    res.status(500).json({ error: 'Erro ao ler dados' })
  }
})

// Salva o DB completo (substitui tudo em transação — mesma semântica do Excel)
app.post('/api/data', (req, res) => {
  try {
    const data = req.body
    db.transaction(() => {
      for (const table of TABLES) {
        db.prepare(`DELETE FROM "${table}"`).run()
        const rows = data[table]
        if (!Array.isArray(rows) || rows.length === 0) continue
        const cols = Object.keys(rows[0])
        const placeholders = cols.map(() => '?').join(', ')
        const stmt = db.prepare(
          `INSERT INTO "${table}" (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders})`
        )
        for (const row of rows) {
          stmt.run(cols.map(c => row[c] ?? null))
        }
      }
    })()
    res.json({ ok: true })
  } catch (e) {
    console.error('Erro ao salvar dados:', e)
    res.status(500).json({ error: 'Erro ao salvar dados' })
  }
})

// Exporta um personagem e todos os seus dados relacionados como JSON
app.get('/api/personagem/:id/export', (req, res) => {
  const id = Number(req.params.id)
  const personagem = db.prepare('SELECT * FROM personagens WHERE id = ?').get(id)
  if (!personagem) return res.status(404).json({ error: 'Personagem não encontrado' })

  const exportData = { personagem }
  const tabelas = TABLES.filter(t => t !== 'personagens')
  for (const table of tabelas) {
    exportData[table] = db.prepare(`SELECT * FROM "${table}" WHERE personagem_id = ?`).all(id)
  }

  const nome = personagem.nome?.replace(/[^a-z0-9]/gi, '_') || 'personagem'
  res.setHeader('Content-Disposition', `attachment; filename="${nome}_export.json"`)
  res.json(exportData)
})

// Importa um personagem exportado (remapeia IDs para evitar conflitos)
app.post('/api/personagem/import', (req, res) => {
  try {
    const { personagem, ...tabelas } = req.body
    if (!personagem) return res.status(400).json({ error: 'Dados inválidos' })

    db.transaction(() => {
      // Gera novo ID para o personagem
      const maxId = db.prepare('SELECT MAX(id) as m FROM personagens').get()?.m || 0
      const novoId = maxId + 1
      const idAntigo = personagem.id

      const cols = Object.keys(personagem)
      const stmt = db.prepare(
        `INSERT INTO personagens (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`
      )
      stmt.run(cols.map(c => c === 'id' ? novoId : (personagem[c] ?? null)))

      // Insere registros relacionados com personagem_id remapeado
      for (const [table, rows] of Object.entries(tabelas)) {
        if (!Array.isArray(rows) || rows.length === 0) continue
        const maxRowId = db.prepare(`SELECT MAX(id) as m FROM "${table}"`).get()?.m || 0
        let idCounter = maxRowId + 1
        for (const row of rows) {
          const newRow = { ...row, id: idCounter++, personagem_id: novoId }
          const c = Object.keys(newRow)
          db.prepare(
            `INSERT INTO "${table}" (${c.map(x => `"${x}"`).join(', ')}) VALUES (${c.map(() => '?').join(', ')})`
          ).run(c.map(x => newRow[x] ?? null))
        }
      }
    })()

    res.json({ ok: true })
  } catch (e) {
    console.error('Erro ao importar personagem:', e)
    res.status(500).json({ error: 'Erro ao importar personagem' })
  }
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Grimoire API rodando em http://localhost:${PORT}`)
  console.log(`Banco de dados: ${DB_FILE}`)
})
