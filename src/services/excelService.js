const API_URL = '/api/data'

// ── Carregar dados do servidor ────────────────────────────────
export async function loadData() {
  const res = await fetch(API_URL)
  if (!res.ok) throw new Error('Erro ao carregar dados')
  return res.json()
}

// ── Salvar dados no servidor ──────────────────────────────────
export async function saveDb(db) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(db),
  })
  if (!res.ok) throw new Error('Erro ao salvar dados')
  return true
}

// ── Helpers de ID ─────────────────────────────────────────────
export function newId(list) {
  if (!list || list.length === 0) return 1
  return Math.max(...list.map(r => r.id || 0)) + 1
}

// ── CRUD genérico ─────────────────────────────────────────────
export function addRecord(db, table, record) {
  const list = db[table] || []
  const id = newId(list)
  const newRecord = { id, ...record }
  db[table] = [...list, newRecord]
  return { db, record: newRecord }
}

export function updateRecord(db, table, id, updates) {
  db[table] = db[table].map(r => r.id === id ? { ...r, ...updates } : r)
  return db
}

export function deleteRecord(db, table, id) {
  db[table] = db[table].filter(r => r.id !== id)
  return db
}
