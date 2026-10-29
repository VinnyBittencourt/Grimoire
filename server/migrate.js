// Executor de migrações: arquivos server/migrations/NNN_nome.js com `export function up(db, ctx)`.
// A versão aplicada fica em PRAGMA user_version. Cada migração roda em transação própria e,
// se houver alguma pendente num banco em arquivo, um backup é feito antes.
import { readdirSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { seedReference } from './seed.js'

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), 'migrations')

export async function loadMigrations() {
  const files = readdirSync(MIGRATIONS_DIR).filter(f => /^\d{3}_.+\.js$/.test(f)).sort()
  const out = []
  for (const file of files) {
    const mod = await import(pathToFileURL(join(MIGRATIONS_DIR, file)).href)
    out.push({ version: Number(file.slice(0, 3)), name: file, up: mod.up })
  }
  return out
}

/**
 * opts: { dataDir, backup(db, label) } — dataDir null em testes (banco em memória)
 * Retorna as migrações aplicadas.
 */
export async function migrate(db, opts = {}) {
  const migrations = await loadMigrations()
  const current = db.pragma('user_version', { simple: true })
  const pending = migrations.filter(m => m.version > current)
  if (pending.length === 0) return []

  if (opts.backup) await opts.backup(db, `pre-migration-v${current}`)

  const reports = []
  const ctx = {
    photosDir: opts.dataDir ? join(opts.dataDir, 'photos') : join(process.cwd(), '.tmp-photos'),
    seed: seedReference,
    report: (name, lines) => reports.push(`## ${name}\n${lines.join('\n')}`),
  }

  // foreign_keys não pode mudar dentro de transação; desliga para renomear/copiar tabelas
  db.pragma('foreign_keys = OFF')
  try {
    for (const m of pending) {
      db.transaction(() => {
        m.up(db, ctx)
        db.pragma(`user_version = ${m.version}`)
      })()
    }
  } finally {
    db.pragma('foreign_keys = ON')
  }
  const problems = db.pragma('foreign_key_check')
  if (problems.length) throw new Error(`Migração deixou referências quebradas: ${JSON.stringify(problems.slice(0, 5))}`)

  if (reports.length && opts.dataDir) {
    const dir = join(opts.dataDir, 'backups')
    mkdirSync(dir, { recursive: true })
    const file = join(dir, `migration-report-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.md`)
    writeFileSync(file, `# Relatório de migração\n\n${reports.join('\n\n')}\n`)
    console.log(`Relatório de migração: ${file}`)
  }
  return pending.map(m => m.name)
}
