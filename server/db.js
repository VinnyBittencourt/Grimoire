import Database from 'better-sqlite3'
import { mkdirSync } from 'fs'
import { join } from 'path'
import { migrate } from './migrate.js'
import { seedIfNeeded } from './seed.js'
import { createBackupper } from './backup.js'

/**
 * Abre (ou cria) o banco, aplica migrações e garante os dados de referência.
 * dataDir null → banco em memória (testes).
 */
export async function openDatabase(dataDir) {
  let db, backupper = null
  if (dataDir) {
    mkdirSync(dataDir, { recursive: true })
    db = new Database(join(dataDir, 'grimoire.db'))
    db.pragma('journal_mode = WAL')
    backupper = createBackupper(dataDir)
  } else {
    db = new Database(':memory:')
  }
  db.pragma('foreign_keys = ON')
  await migrate(db, { dataDir, backup: backupper?.backup })
  seedIfNeeded(db)
  return { db, backupper }
}
