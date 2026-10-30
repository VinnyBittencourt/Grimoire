// Período de renovação dos recursos de classe: 'day' (renova no Novo Dia), 'week' (só no "Restaurar"
// do próprio recurso, ex.: Remover Doença do paladino) ou 'charges' (cargas de varinha: nunca renova sozinho).
// Antes desta coluna o Novo Dia zerava tudo e apagava as anotações. Recursos existentes ficam 'day'
// (comportamento anterior); só muda quando o usuário escolher outro período.
export function up(db) {
  const has = db.prepare("SELECT 1 FROM pragma_table_info('class_resources') WHERE name = 'period'").get()
  if (!has) db.exec("ALTER TABLE class_resources ADD COLUMN period TEXT NOT NULL DEFAULT 'day' CHECK (period IN ('day', 'week', 'charges'))")
}
