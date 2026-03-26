import express from 'express'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import * as XLSX from 'xlsx'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, 'data')
const DATA_FILE = join(DATA_DIR, 'grimoire_data.xlsx')
const FOTOS_FILE = join(DATA_DIR, 'fotos.json')

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR)

const EMPTY_DB = {
  personagens: [],
  magias: [],
  magias_preparadas: [],
  equipamentos: [],
  mochila: [],
  backgrounds: [],
  players: [],
  talentos: [],
  recursos: [],
  anotacoes: [],
  npcs: [],
  locais: [],
  quests: [],
}

const app = express()
app.use(express.json({ limit: '100mb' }))

function loadFotos() {
  if (!existsSync(FOTOS_FILE)) return {}
  try { return JSON.parse(readFileSync(FOTOS_FILE, 'utf8')) } catch { return {} }
}

function saveFotos(fotos) {
  writeFileSync(FOTOS_FILE, JSON.stringify(fotos), 'utf8')
}

app.get('/api/data', (req, res) => {
  if (!existsSync(DATA_FILE)) {
    return res.json(EMPTY_DB)
  }
  try {
    const buf = readFileSync(DATA_FILE)
    const wb = XLSX.read(buf, { type: 'buffer' })
    // Começa com os defaults do EMPTY_DB e sobrescreve com o que está no Excel
    const db = { ...EMPTY_DB }
    for (const sheet of wb.SheetNames) {
      db[sheet] = XLSX.utils.sheet_to_json(wb.Sheets[sheet])
    }
    // Merge fotos de volta nos personagens
    const fotos = loadFotos()
    db.personagens = db.personagens.map(p => ({
      ...p,
      foto_base64: fotos[p.id] || '',
    }))
    res.json(db)
  } catch (e) {
    console.error('Erro ao ler Excel:', e)
    res.status(500).json({ error: 'Erro ao ler dados' })
  }
})

app.post('/api/data', (req, res) => {
  try {
    const db = req.body

    // Extrair fotos antes de gravar no Excel
    const fotos = {}
    const personagensSemFoto = (db.personagens || []).map(p => {
      if (p.foto_base64) fotos[p.id] = p.foto_base64
      const { foto_base64, ...resto } = p
      return resto
    })
    saveFotos(fotos)

    const dbParaExcel = { ...db, personagens: personagensSemFoto }
    const wb = XLSX.utils.book_new()
    for (const [sheet, rows] of Object.entries(dbParaExcel)) {
      const ws = Array.isArray(rows) && rows.length > 0
        ? XLSX.utils.json_to_sheet(rows)
        : XLSX.utils.aoa_to_sheet([])
      XLSX.utils.book_append_sheet(wb, ws, sheet)
    }
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    writeFileSync(DATA_FILE, buf)
    res.json({ ok: true })
  } catch (e) {
    console.error('Erro ao salvar Excel:', e)
    res.status(500).json({ error: 'Erro ao salvar dados' })
  }
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Grimoire API rodando em http://localhost:${PORT}`)
  console.log(`Dados salvos em: ${DATA_FILE}`)
})
