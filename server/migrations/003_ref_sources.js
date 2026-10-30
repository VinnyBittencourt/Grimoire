// Rastreabilidade do conteúdo de referência: coluna `fonte` (JSON) em todas as tabelas ref_*,
// com livro, página, tipo, licença, se consta no SRD e se foi verificado (src/db/publications.js).
// Só tabelas de referência (recriadas pelo seed); nenhum dado do usuário é tocado.
export function up(db, ctx) {
  for (const t of ['ref_talentos', 'ref_falhas', 'ref_racas', 'ref_classes', 'ref_criaturas']) {
    const has = db.prepare(`SELECT 1 FROM pragma_table_info('${t}') WHERE name = 'fonte'`).get()
    if (!has) db.exec(`ALTER TABLE "${t}" ADD COLUMN fonte TEXT`)
  }
  // O seed da migração 002 rodou antes da coluna existir: popula de novo, agora com `fonte`
  ctx.seed(db)
}
