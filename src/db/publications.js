// Catálogo das publicações citadas pelos dados de referência (campo `livro`).
// Só metadados bibliográficos; nenhum texto dos livros. review_status 'unresearched' = título,
// editora e linha vêm do conhecimento da equipe e ainda não foram cruzados com dois índices
// bibliográficos (ver docs/CLAUDE_MASTER_INSTRUCTIONS.md §10 e §18).
//
// srd: 'parcial' → o SRD 3.5 contém parte do conteúdo (o registro individual diz se consta: `srd: true`)
//      'nao'     → o SRD 3.5 não contém o livro
// license_default: licença presumida de um registro desse livro que NÃO consta no SRD
//   'proprietario' → guardamos só nome, efeitos mecânicos e notas curtas da equipe
//   'needs_review' → licença incerta (não incorporar texto)

const wotc = (title, extra = {}) => ({
  title, publisher: 'Wizards of the Coast', official_wotc: true, setting: null, category: 'suplemento',
  srd: 'nao', license_default: 'proprietario', review_status: 'unresearched', ...extra,
})

export const PUBLICATIONS = {
  'PHB': wotc("Player's Handbook (v.3.5)", { category: 'basico', srd: 'parcial' }),
  'DMG': wotc("Dungeon Master's Guide (v.3.5)", { category: 'basico', srd: 'parcial' }),
  'Monster Manual': wotc('Monster Manual (v.3.5)', { category: 'basico', srd: 'parcial' }),
  'Expanded Psionics': wotc('Expanded Psionics Handbook', { srd: 'parcial' }),
  // Unearthed Arcana tem Open Game Content declarado, mas não faz parte do SRD 3.5 original
  'Unearthed Arcana': wotc('Unearthed Arcana', { license_default: 'needs_review' }),
  'Complete Warrior': wotc('Complete Warrior'),
  'Complete Divine': wotc('Complete Divine'),
  'Complete Arcane': wotc('Complete Arcane'),
  'Complete Adventurer': wotc('Complete Adventurer'),
  'Complete Champion': wotc('Complete Champion'),
  'Complete Mage': wotc('Complete Mage'),
  'Complete Scoundrel': wotc('Complete Scoundrel'),
  'PHB II': wotc("Player's Handbook II"),
  'Tome of Battle': wotc('Tome of Battle: The Book of Nine Swords'),
  'Tome of Magic': wotc('Tome of Magic'),
  'Miniatures Handbook': wotc('Miniatures Handbook'),
  'Dungeonscape': wotc('Dungeonscape'),
  'Races of the Dragon': wotc('Races of the Dragon'),
  'Races of the Wild': wotc('Races of the Wild'),
  'Races of Stone': wotc('Races of Stone'),
  'Libris Mortis': wotc('Libris Mortis: The Book of the Dead'),
  'Heroes of Horror': wotc('Heroes of Horror'),
  'Dragon Magic': wotc('Dragon Magic'),
  'Sandstorm': wotc('Sandstorm'),
  'Frostburn': wotc('Frostburn'),
  'Stormwrack': wotc('Stormwrack'),
  'Eberron Campaign Setting': wotc('Eberron Campaign Setting', { category: 'cenario', setting: 'Eberron' }),
  'Dragonlance Campaign Setting': wotc('Dragonlance Campaign Setting', { category: 'cenario', setting: 'Dragonlance' }),
  // Linha Dragonlance 3.5 licenciada: editora a confirmar, não é publicação da Wizards
  'Legends of the Twins': {
    title: 'Legends of the Twins', publisher: 'Margaret Weis Productions (a confirmar)', official_wotc: false,
    setting: 'Dragonlance', category: 'cenario', srd: 'nao', license_default: 'needs_review', review_status: 'needs_review',
  },
}

export const SOURCE_TYPES = ['oficial', 'cenario', 'licenciado', 'homebrew']
export const LICENSES = ['srd', 'proprietario', 'needs_review']

/**
 * Metadados de fonte de um registro de referência (talento, falha, raça, classe, criatura).
 * `record.srd` = consta no SRD 3.5 (conferido por nome); `record.fonte` sobrescreve campos.
 * página: sempre null até alguém conferir no livro (nunca inventar página).
 * verificado: só true quando os números do registro foram conferidos numa fonte (hoje: SRD).
 */
export function sourceFor(record, livro = record.livro) {
  const pub = PUBLICATIONS[livro]
  const tipo = !pub ? 'homebrew' : !pub.official_wotc ? 'licenciado' : pub.category === 'cenario' ? 'cenario' : 'oficial'
  const srd = Boolean(record.srd ?? record.fonte?.srd)
  return {
    livro: livro ?? null,
    pagina: null,
    tipo,
    licenca: srd ? 'srd' : pub?.license_default ?? 'needs_review',
    srd,
    verificado: false,
    conferido_em: null,
    nota: null,
    ...(record.fonte ?? {}),
    ...(record.fonte?.verificado ? { conferido_em: 'SRD 3.5 (olimot/srd-v3.5, conversão dos RTFs da Wizards)' } : {}),
  }
}
