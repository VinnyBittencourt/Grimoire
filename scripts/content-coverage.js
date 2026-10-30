// Relatório de cobertura e rastreabilidade do conteúdo de referência → docs/COBERTURA_CONTEUDO.md
// Uso: npm run coverage:content (só lê src/; não toca no banco)
import { readFileSync, writeFileSync } from 'fs'
import { RACAS, CLASSES, CRIATURAS } from '../src/db/referenceData.js'
import { PUBLICATIONS, sourceFor } from '../src/db/publications.js'
import { CLASSES as CLASS_RULES, REF_CLASS_ID_FROM_V1 } from '../shared/constants/classes.js'

const root = new URL('../', import.meta.url)
const feats = JSON.parse(readFileSync(new URL('src/db/featsData.json', root), 'utf8'))
const spells = JSON.parse(readFileSync(new URL('src/data/builtinSpells.json', root), 'utf8'))

const classRecord = x => {
  const rule = CLASS_RULES[REF_CLASS_ID_FROM_V1[x.id] ?? x.id]
  return { ...x, livro: rule.book, srd: ['PHB', 'DMG'].includes(rule.book) }
}
const groups = {
  Talentos: feats.talentos, Falhas: feats.falhas, Raças: RACAS, Classes: CLASSES.map(classRecord), Criaturas: CRIATURAS,
}

const lines = []
const row = cells => lines.push(`| ${cells.join(' | ')} |`)
lines.push('# Cobertura do conteúdo de referência', '')
lines.push('Gerado por `npm run coverage:content` a partir de `src/db` e `src/data`. Não edite à mão.', '')
lines.push('- **SRD**: consta no SRD 3.5 (conferido por nome nas páginas do SRD, ou por estatística no caso das criaturas).')
lines.push('- **Verificado**: números conferidos com uma fonte. Hoje só as criaturas de Convocar Monstro (SRD).')
lines.push('- **Página**: nenhuma registrada ainda (nunca inventada).', '')
lines.push('## Por tipo', '')
row(['Tipo', 'Registros', 'No SRD', 'Verificados', 'Com página', 'needs_review'])
row(['---', '---:', '---:', '---:', '---:', '---:'])
for (const [name, list] of Object.entries(groups)) {
  const src = list.map(r => sourceFor(r))
  row([name, list.length, src.filter(s => s.srd).length, src.filter(s => s.verificado).length,
    src.filter(s => s.pagina != null).length, src.filter(s => s.licenca === 'needs_review').length])
}
const spellCount = Object.values(spells).flatMap(levels => Object.values(levels).flat()).length
lines.push('', `Magias padrão (\`src/data/builtinSpells.json\`): ${spellCount} entradas por classe, sem metadados de fonte (lista de conveniência; o grimório do personagem é livre).`, '')

lines.push('## Por publicação', '')
row(['Livro', 'Título', 'Editora', 'Categoria', 'No SRD', 'Registros', 'Situação bibliográfica'])
row(['---', '---', '---', '---', '---', '---:', '---'])
const all = Object.values(groups).flat()
for (const [id, p] of Object.entries(PUBLICATIONS)) {
  const n = all.filter(r => (r.livro ?? null) === id).length
  row([id, p.title, p.publisher, p.category, p.srd, n, p.review_status])
}
lines.push('', '## Pendências conhecidas', '')
lines.push('- Pesquisa bibliográfica completa (prompt §18 das instruções mestre): títulos, anos, códigos e erratas ainda não cruzados com dois índices.')
lines.push('- Talentos, raças e classes: efeitos e textos não conferidos com o livro; só a presença no SRD foi checada.')
lines.push('- Criaturas de Convocar Monstro: habilidades especiais e modelo celestial/abissal (resistências, RD, RM, destruir) não conferidos.')
lines.push('- Criaturas `_san` (Convocar Aliado da Natureza): não conferidas.')
lines.push('- Genasi: livro provavelmente errado (não constam no SRD nem, ao que tudo indica, no Monster Manual).')
lines.push('- Classes de suplemento: DV/BBA/saves com `verified: false` (Swashbuckler e Artificer com suspeita de erro).')

writeFileSync(new URL('docs/COBERTURA_CONTEUDO.md', root), lines.join('\n') + '\n')
console.log(lines.join('\n'))
