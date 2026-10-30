// Ajuste manual dos pontos de perícia disponíveis. O motor calcula com o Int BASE desde o 1º nível (sem retroativo,
// PHB "Changing Ability Scores"); aumentos de Int depois do 1º nível (4º, 8º… ou itens) entram aqui à mão.
export function up(db) {
  const has = db.prepare("SELECT 1 FROM pragma_table_info('characters') WHERE name = 'skill_points_adjust'").get()
  if (!has) db.exec('ALTER TABLE characters ADD COLUMN skill_points_adjust INTEGER NOT NULL DEFAULT 0')
}
