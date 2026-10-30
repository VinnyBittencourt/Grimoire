// Ponto de entrada da API: `npm run dev:api`
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { openDatabase } from './db.js'
import { createApp } from './app.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DATA_DIR = process.env.GRIMOIRE_DATA_DIR ?? join(ROOT, 'data')
const PORT = Number(process.env.GRIMOIRE_API_PORT ?? 3005)
const HOST = '127.0.0.1' // só a própria máquina: a API não tem autenticação
const BACKUP_EVERY_MS = 30 * 60 * 1000

const { db, backupper } = await openDatabase(DATA_DIR)

// Backup periódico, só quando houve escrita desde o último
let dirty = false
const app = createApp({ db, dataDir: DATA_DIR, backupper, onWrite: () => { dirty = true } })
// Pula o backup de boot se nada mudou desde o último (reiniciar não gasta a rotação)
await backupper.backup(db, 'boot', { onlyIfChanged: true })
const timer = setInterval(async () => {
  if (!dirty) return
  dirty = false
  try { await backupper.backup(db, 'auto') } catch (e) { console.error('Backup falhou:', e) }
}, BACKUP_EVERY_MS)

const server = app.listen(PORT, HOST, () => {
  console.log(`Grimoire API em http://${HOST}:${PORT}`)
  console.log(`Dados em ${DATA_DIR}`)
})

function shutdown() {
  clearInterval(timer)
  server.close()
  try { db.pragma('wal_checkpoint(TRUNCATE)'); db.close() } catch { /* já fechado */ }
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
