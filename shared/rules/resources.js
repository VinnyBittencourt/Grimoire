// Recursos de classe por dia (PHB 3.5). Cada entrada:
//   class: id da classe; kind: 'uses' (fichas) | 'pool' (reserva numérica, ex. Cura pelas Mãos)
//   total(n, ctx): n = nível da classe; ctx = { abilities, effects }
//   minLevel: nível em que a classe ganha o recurso
//   verified: false → fórmula de suplemento ainda não conferida no livro
const cha = ctx => ctx.abilities.cha.mod
const wis = ctx => ctx.abilities.wis.mod
const fx = (ctx, key) => ctx.effects?.resources?.[key] ?? 0

export const RESOURCES = {
  rage: { class: 'barbarian', icon: '🔥', kind: 'uses', minLevel: 1,
    total: (n, ctx) => 1 + Math.floor(n / 4) + fx(ctx, 'rage') },
  bardicmusic: { class: 'bard', icon: '🎵', kind: 'uses', minLevel: 1,
    total: (n, ctx) => n + fx(ctx, 'bardicmusic') },
  turnundead: { class: 'cleric', icon: '☀️', kind: 'uses', minLevel: 1,
    total: (n, ctx) => Math.max(0, 3 + cha(ctx)) + (ctx.effects?.turning ?? 0) },
  turnundead_paladin: { class: 'paladin', icon: '✝️', kind: 'uses', minLevel: 4,
    total: (n, ctx) => Math.max(0, 3 + cha(ctx)) + (ctx.effects?.turning ?? 0) },
  layonhands: { class: 'paladin', icon: '💚', kind: 'pool', minLevel: 2,
    total: (n, ctx) => Math.max(0, cha(ctx)) * n },
  smite: { class: 'paladin', icon: '⚔️', kind: 'uses', minLevel: 1,
    total: (n, ctx) => 1 + Math.floor(n / 5) + fx(ctx, 'smite') },
  wildshape: { class: 'druid', icon: '🐺', kind: 'uses', minLevel: 5,
    total: (n, ctx) => (n >= 18 ? 6 : n >= 14 ? 5 : n >= 10 ? 4 : n >= 7 ? 3 : n >= 6 ? 2 : 1) + fx(ctx, 'wildshape') },
  stunningfist: { class: 'monk', icon: '👊', kind: 'uses', minLevel: 1,
    total: n => n },
  // Suplementos
  // A classe factotum ainda não existe em CLASSES: o recurso não é criado automaticamente,
  // só funciona em linhas já existentes (vindas do v1) ligadas a uma classe por class_row_id.
  inspiration: { class: 'factotum', icon: '✨', kind: 'uses', minLevel: 1, verified: false,
    total: (n, ctx) => n + fx(ctx, 'inspiration') },
  hexbladecurse: { class: 'hexblade', icon: '🪄', kind: 'uses', minLevel: 1, verified: false,
    total: n => 1 + Math.floor((n + 2) / 5) },
  ki: { class: 'ninja', icon: '🌑', kind: 'uses', minLevel: 1, verified: false,
    total: (n, ctx) => Math.max(1, Math.floor(n / 2) + wis(ctx)) },
}

// Nome do recurso no v1 (pt) → chave
export const RESOURCE_FROM_V1 = {
  'Fúria': 'rage', 'Inspiração Bárdica': 'bardicmusic', 'Expulsar Mortos-Vivos': 'turnundead',
  'Forma Selvagem': 'wildshape', 'Imposição de Mãos': 'layonhands', 'Inspiração': 'inspiration',
  'Maldição do Hexblade': 'hexbladecurse', 'Ki (Invisibilidade)': 'ki',
}

// Recursos padrão para as classes do personagem: [{ key, classRowId, total }]
export function defaultResourcesFor(classes) {
  const out = []
  for (const row of classes) {
    for (const [key, def] of Object.entries(RESOURCES)) {
      if (def.class === row.class_id && (Number(row.level) || 0) >= def.minLevel) {
        out.push({ key, classRowId: row.id })
      }
    }
  }
  return out
}

// Total efetivo de um recurso do personagem (linha de class_resources)
export function resourceTotal(resource, classes, ctx) {
  if (resource.total_override != null && resource.total_override !== '') return Number(resource.total_override)
  const def = RESOURCES[resource.key]
  if (!def) return 0
  const row = classes.find(c => c.id === resource.class_row_id) ?? classes.find(c => c.class_id === def.class)
  const level = Number(row?.level) || 0
  if (level < def.minLevel) return 0
  return def.total(level, ctx)
}
