// Backups do SQLite com a API online do better-sqlite3 (seguro com o servidor rodando).
import { mkdirSync, readdirSync, unlinkSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'

const KEEP = 20 // por tipo (boot, auto…)
// Nunca apagados pelo prune: o estado antes de cada migração e os backups pedidos pelo usuário
const PROTECTED = /^(pre-migration-v\d+|manual)$/
const LAST = 'last-backup.json' // { file, hash } do último backup, para pular backups idênticos

const pad = n => String(n).padStart(2, '0')
// Hora local: AAAAMMDD-HHMM
const stamp = (d = new Date()) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`
const NAME = /^grimoire-\d{8}-\d{4}-(.+)\.db$/

// Hash do conteúdo lógico do banco (inclui o que ainda está no WAL)
const contentHash = db => createHash('sha256').update(db.serialize()).digest('hex')

export function createBackupper(dataDir) {
  const dir = join(dataDir, 'backups')

  function readLast() {
    try { return JSON.parse(readFileSync(join(dir, LAST), 'utf8')) } catch { return null }
  }

  // opts.onlyIfChanged: não cria backup se o banco está igual ao último backup (que ainda existe)
  async function backup(db, label = 'auto', { onlyIfChanged = false } = {}) {
    mkdirSync(dir, { recursive: true })
    const hash = contentHash(db)
    const last = readLast()
    if (onlyIfChanged && last?.hash === hash && existsSync(join(dir, last.file))) return null
    const name = `grimoire-${stamp()}-${label}.db`
    await db.backup(join(dir, name))
    writeFileSync(join(dir, LAST), JSON.stringify({ file: name, hash }))
    prune()
    return join(dir, name)
  }

  // Mantém os KEEP mais recentes de cada tipo; PROTECTED, pre-v2.db e relatórios nunca são apagados
  function prune() {
    const byLabel = new Map()
    for (const f of readdirSync(dir).sort()) {
      const label = NAME.exec(f)?.[1]
      if (!label || PROTECTED.test(label)) continue
      if (!byLabel.has(label)) byLabel.set(label, [])
      byLabel.get(label).push(f)
    }
    for (const files of byLabel.values()) {
      for (const f of files.slice(0, Math.max(0, files.length - KEEP))) {
        try { unlinkSync(join(dir, f)) } catch { /* arquivo em uso: fica para a próxima */ }
      }
    }
  }

  return { backup, dir }
}
