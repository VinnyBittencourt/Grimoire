// Popula as tabelas ref_* a partir de src/db/referenceData.js e src/db/featsData.json.
// Roda no boot do servidor quando SEED_VERSION muda (guardado em meta.ref_seed_version),
// então editar os dados de referência + incrementar a versão basta — sem script manual.
import { readFileSync } from 'fs'
import { RACAS, CLASSES, CRIATURAS } from '../src/db/referenceData.js'
import { REF_CLASS_ID_FROM_V1 } from '../shared/constants/classes.js'

export const SEED_VERSION = 3

const j = v => (v == null ? null : JSON.stringify(v))
const toTitle = s => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
const idToNameEn = id => toTitle(id.replace(/^[^_]+_/, ''))
const BAB = { boa: 'good', media: 'avg', ruim: 'poor' }
const SAVE = { boa: 'good', ruim: 'poor' }

export function seedReference(db) {
  const { talentos, falhas } = JSON.parse(readFileSync(new URL('../src/db/featsData.json', import.meta.url)))

  db.transaction(() => {
    db.prepare('DELETE FROM ref_talentos').run()
    const t = db.prepare(`INSERT INTO ref_talentos (id, nome, nome_en, livro, categoria, prerequisitos, descricao, descricao_en, efeitos)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    for (const f of talentos) {
      t.run(f.id, f.nome, f.nome_en ?? idToNameEn(f.id), f.livro, j(f.categoria), f.prerequisitos ?? '',
        f.descricao ?? '', f.descricao_en ?? null, j(f.efeitos ?? []))
    }

    db.prepare('DELETE FROM ref_falhas').run()
    const fl = db.prepare('INSERT INTO ref_falhas (id, nome, livro, descricao, efeitos) VALUES (?, ?, ?, ?, ?)')
    for (const f of falhas) fl.run(f.id, f.nome, f.livro, f.descricao ?? '', j(f.efeitos ?? []))

    db.prepare('DELETE FROM ref_racas').run()
    const r = db.prepare(`INSERT INTO ref_racas (id, nome, livro, descricao, atributos, tamanho, deslocamento, visao, habilidades)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    for (const x of RACAS) r.run(x.id, x.nome, x.livro, x.descricao, j(x.atributos), x.tamanho, x.deslocamento, x.visao, j(x.habilidades))

    db.prepare('DELETE FROM ref_classes').run()
    const c = db.prepare(`INSERT INTO ref_classes (id, nome, livro, tipo, descricao, dado_vida, bab, saves, habilidades)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    for (const x of CLASSES) {
      const saves = Object.fromEntries(Object.entries(x.saves ?? {}).map(([k, v]) => [k, SAVE[v] ?? v]))
      c.run(REF_CLASS_ID_FROM_V1[x.id] ?? x.id, x.nome, x.livro, x.tipo, x.descricao, x.dado_vida, BAB[x.bab] ?? x.bab, j(saves), j(x.habilidades))
    }

    db.prepare('DELETE FROM ref_criaturas').run()
    const cr = db.prepare(`INSERT INTO ref_criaturas (id, nome, livro, nivel_sm, tamanho, tipo, alinhamento, pv, ca, "for", des, con, int_val, sab, car, ataque, habilidades)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    for (const x of CRIATURAS) {
      cr.run(x.id, x.nome, x.livro, x.nivel_sm, x.tamanho, x.tipo, x.alinhamento, x.pv, x.ca,
        x.for, x.des, x.con, x.int_val, x.sab, x.car, x.ataque, j(x.habilidades))
    }

    db.prepare("INSERT INTO meta (key, value) VALUES ('ref_seed_version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
      .run(String(SEED_VERSION))
  })()
}

export function seedIfNeeded(db) {
  const row = db.prepare("SELECT value FROM meta WHERE key = 'ref_seed_version'").get()
  if (Number(row?.value) !== SEED_VERSION) seedReference(db)
}
