// Backups do SQLite com a API online do better-sqlite3 (seguro com o servidor rodando).
import { mkdirSync, readdirSync, unlinkSync } from 'fs'
import { join } from 'path'

const KEEP = 20

const pad = n => String(n).padStart(2, '0')
// Hora local: AAAAMMDD-HHMM
const stamp = (d = new Date()) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`

export function createBackupper(dataDir) {
  const dir = join(dataDir, 'backups')

  async function backup(db, label = 'auto') {
    mkdirSync(dir, { recursive: true })
    const file = join(dir, `grimoire-${stamp()}-${label}.db`)
    await db.backup(file)
    prune()
    return file
  }

  // Mantém os KEEP mais recentes de cada tipo; pre-v2.db e relatórios nunca são apagados
  function prune() {
    const files = readdirSync(dir).filter(f => /^grimoire-\d{8}-\d{4}-.+\.db$/.test(f)).sort()
    for (const f of files.slice(0, Math.max(0, files.length - KEEP))) {
      try { unlinkSync(join(dir, f)) } catch { /* arquivo em uso: fica para a próxima */ }
    }
  }

  return { backup, dir }
}
