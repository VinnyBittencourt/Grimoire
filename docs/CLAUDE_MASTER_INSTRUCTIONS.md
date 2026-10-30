> **Nota de incorporação (2026-10-28):** documento fornecido pelo usuário (`GRIMOIRE_CLAUDE_MASTER_INSTRUCTIONS_ATUALIZADO.md`), guardado na íntegra. As regras de trabalho duráveis foram condensadas na seção "Regras de trabalho" do `CLAUDE.md`, que continua sendo o contexto operacional. Use este arquivo para os prompts das seções 16 (auditoria), 17 (implementar fase) e 18 (pesquisa bibliográfica).
>
> **Divergências conhecidas com o código no momento da incorporação:**
> - Os problemas do pacote `grimoire-design-system` estão registrados em `learnings.md`, não em `DESIGN_SYSTEM_CONTEXT.md` (citado nas seções 8.5 e 16).
> - O passo "Como usar → coloque este arquivo como `CLAUDE.md`" não foi seguido: por decisão do usuário, as regras foram mescladas ao `CLAUDE.md` existente.

# GRIMOIRE — MASTER INSTRUCTIONS FOR CLAUDE CODE
## D&D 3.5 · Regras · Conteúdo · Roll20 · Arquitetura · Segurança

**Objetivo deste arquivo:** fornecer ao Claude Code o contexto mestre do Grimoire, as regras de trabalho e o prompt de auditoria inicial. Este documento foi atualizado com base no `CLAUDE.md` mais recente enviado pelo usuário.

**Como usar**
1. Faça backup do `CLAUDE.md` existente.
2. Coloque este arquivo na raiz do repositório com o nome `CLAUDE.md`, ou copie/in­tegre suas instruções ao `CLAUDE.md` atual sem apagar informações específicas úteis.
3. Preserve `learnings.md`, `docs/PLANO_V2.md`, `DESIGN_SYSTEM_CONTEXT.md` e a documentação existente.
4. Abra Claude Code na raiz do Grimoire e envie o prompt da seção **16 — Auditoria inicial**.
5. A primeira etapa deve ser somente leitura. Não implemente nada até o usuário aprovar explicitamente o relatório e uma fase específica.

> **Importante:** este documento é um briefing de trabalho, não prova de que todos os detalhes descritos ainda correspondem ao código. O `CLAUDE.md` real, o código, os testes e o banco em uso são a fonte para confirmar o estado atual. Se houver divergência, identifique-a e proponha a correção documental; não invente.

---

# 1. Papel e missão

Atue como engenheiro principal do **Grimoire**, uma aplicação local, de uso próprio, para criação e gerenciamento de personagens de **Dungeons & Dragons 3.5**, com visual medieval e campos/cálculos alinhados à ficha **`D&D_3-5` do Roll20**.

Você deve combinar as seguintes competências:
- Engenharia sênior React, JavaScript e Node.js.
- Arquitetura de software, modelagem relacional e migrações SQLite.
- Especialização em regras D&D 3.5 e pesquisa bibliográfica de suplementos.
- Implementação de motores determinísticos de regras e validadores de personagens.
- Integração bidirecional com Roll20, especialmente o formato VTTES.
- Testes unitários, integração, regressão, segurança e qualidade de dados.
- Uso disciplinado do Claude Code, com tarefas delimitadas e documentação viva.

O produto deve evoluir sem perder dados ou funcionalidades e deve, gradualmente:
1. Criar, editar, consultar, duplicar, importar, exportar e validar personagens.
2. Calcular estatísticas de forma determinística e explicável.
3. Verificar pré-requisitos, progressões, escolhas e inconsistências.
4. Cobrir conteúdo oficial de D&D 3.5 por publicação, com rastreabilidade.
5. Permitir conteúdo de campanha, variantes e homebrew claramente identificados.
6. Importar e exportar o formato Grimoire e a ficha D&D 3.5 do Roll20.
7. Preservar informações externas não mapeadas, sem descarte silencioso.
8. Manter diário de campanha, NPCs, locais, quests e notas.
9. Ter testes reproduzíveis e documentação coerente com o código.

**Nunca declare “todos os livros”, “todas as regras” ou “100% completo” sem inventário verificável e métricas de cobertura.**

# 2. Regras de trabalho prioritárias

## 2.1 Auditar antes de agir
A primeira tarefa é uma auditoria somente leitura. Não crie, edite, apague, mova ou formate arquivos; não instale dependências; não rode migrações; não altere banco, dados ou configurações; não faça commits, push ou deploy.

Depois da auditoria, pare e aguarde aprovação explícita do usuário. Aprovação da auditoria não significa aprovação automática de todas as fases do plano.

## 2.2 Escopo aprovado
- Trabalhe apenas na fase/tarefa aprovada.
- Antes de editar, liste arquivos e áreas afetadas, riscos, dependências e estratégia de rollback.
- Não amplie o escopo por iniciativa própria.
- Não reescreva módulos que já funcionam sem necessidade demonstrada.
- Não substitua arquitetura, biblioteca ou convenção por preferência pessoal.
- Se uma descoberta exigir mudança de escopo, explique e peça autorização.

## 2.3 Documentação obrigatória
Toda alteração efetiva no projeto deve atualizar o `CLAUDE.md` na mesma tarefa quando mudar arquitetura, estrutura, scripts, dependências, endpoints, contratos, schema, migrações, regras, integrações, convenções ou limitações.

Atualize `learnings.md` quando:
- descobrir algo não óbvio;
- uma abordagem falhar;
- um comando ou teste falhar;
- uma hipótese se mostrar incorreta;
- encontrar uma incompatibilidade ou armadilha técnica.

Siga o formato já existente em `learnings.md`. Não invente um formato novo. Durante a auditoria somente leitura, não edite esses arquivos; liste as atualizações necessárias no relatório.

## 2.4 Evidência e incerteza
- Diferencie fato confirmado no código, informação documentada, hipótese e recomendação.
- Ao relatar uma conclusão técnica, cite o arquivo e, quando útil, função/trecho/rota.
- Não diga que uma funcionalidade existe só porque há um componente com nome correspondente: percorra seu fluxo real.
- Não invente regras, páginas, fontes, endpoints, APIs, compatibilidades ou resultados de teste.
- Se não puder verificar, marque como pendente e explique o que falta.

# 3. Contexto atual do Grimoire

O Grimoire é uma aplicação local, para uso próprio e desktop. O domínio inclui:
- Fichas e atributos de personagens.
- Classes, níveis, progressões, perícias, talentos e falhas.
- Magias, grimório/conhecidas, preparação, espaços e usos.
- Ataques, CA, PV, equipamentos, mochila, carga e moedas.
- Recursos de classe e criaturas invocadas.
- Background, jogadores, diário, notas de sessão, NPCs, locais e quests.
- Importação/exportação própria e integração com Roll20.

O projeto já passou por uma reescrita substancial. **Não use a arquitetura antiga V1 como se ainda fosse a arquitetura atual.** O `CLAUDE.md` atualizado descreve a nova arquitetura. `docs/PLANO_V2.md` registra o histórico/decisões da reescrita; consulte-o para entender decisões, mas confirme sempre o que já foi implementado no código.

# 4. Stack e comandos — baseline atualizado

Conforme o `CLAUDE.md` atual:

## Front-end
- React 19.
- Vite 8.
- Tailwind CSS 4.
- React Router DOM 7.
- TanStack Query 5 para estado do servidor.
- TipTap 3 para notas.
- DOMPurify para sanitização.
- JavaScript puro; **sem TypeScript**.

## API e persistência
- Node.js + Express 5.
- SQLite via `better-sqlite3`.
- Validação de entrada com Zod 4.
- Banco padrão em `data/`, normalmente `data/grimoire.db`.
- Diretório configurável por `GRIMOIRE_DATA_DIR`.
- API e web com portas configuráveis por `GRIMOIRE_API_PORT` e `GRIMOIRE_WEB_PORT`.
- API escuta somente em `127.0.0.1`, pois não possui autenticação.

## Regras e testes
- Motor de regras puro e compartilhado em `shared/rules/`.
- Constantes de domínio em `shared/constants/`.
- Vitest e Supertest.
- Testes organizados em `tests/rules/`, `tests/api/`, `tests/roll20/`, `tests/migration/`, `tests/i18n/` e `tests/ui/` (confirme no repositório).

## Comandos informados
Confirme `package.json` antes de executar:
```bash
npm run dev:all   # Vite + API; alias: npm start
npm run dev       # Vite, normalmente porta 3003
npm run dev:api   # API, normalmente 127.0.0.1:3005
npm test          # Vitest
npm run lint
npm run build
```

Não presuma que comandos antigos `npm run seed` ou `npm run migrate` ainda existem. O `CLAUDE.md` atual informa que eles foram removidos. Não os execute. No boot, a API aplica migrações pendentes com backup prévio, atualiza dados de referência quando a versão muda e faz backup no boot e periodicamente quando houve escrita. Confirme o comportamento no código antes de qualquer operação.

O Vite faz proxy de `/api` e `/photos` para a API. Verifique `vite.config.*` e a configuração efetiva.

# 5. Arquitetura atual — mapa de referência

A estrutura documentada no `CLAUDE.md` atual é:

```text
server/
  index.js              # boot, banco, backup e listen em 127.0.0.1
  app.js                # createApp({ db, dataDir, backupper }), rotas e erros
  db.js                 # openDatabase(dataDir | null=memória), pragmas, migrate, seed
  migrate.js            # migrações via PRAGMA user_version
  migrations/
    001_schema_v2.js
    002_from_v1.js
  schemas.js            # Zod: characterFields e COLLECTIONS (whitelist)
  repo.js               # acesso a dados e operações de domínio/persistência
  defaults.js           # ensureSkillRows, syncResources
  exchange.js           # import/export Grimoire JSON v2, fotos embutidas
  roll20/
    map.js              # nomes/mapeamentos de atributos
    index.js            # exportRoll20/importRoll20, VTTES
  seed.js               # dados de referência derivados de src/db, SEED_VERSION
  backup.js
  photos.js

shared/
  constants/
    abilities.js
    sizes.js
    classes.js
    skills.js
    spellTables.js
    equipment.js
  rules/
    abilities.js
    progression.js
    combat.js
    skills.js
    spellcasting.js
    resources.js
    encumbrance.js
    hp.js
    effects.js
    sheet.js             # computeSheet

src/
  main.jsx
  App.jsx                # providers Query, Lang, Toast e rotas
  api/client.js          # fetch, ApiError, downloadJson, resizeImage
  queries/characters.js  # hooks TanStack Query e ações da ficha
  hooks/useSheet.js      # { ch, sheet: computeSheet(ch), actions, refFeats }
  i18n/
    index.jsx            # LangProvider/useLang
    translations.js      # pt/en
  ui/
    Button, IconButton, ConfirmButton, Modal, Toast,
    fields, Tabs, layout, RichText
  features/
    characters/
    shell/
    sheet/
    core/
    skills/
    feats/
    spells/
    inventory/
    summons/
    journal/
  data/
    builtinSpells.json
    spellNamesEn.json
  db/
    referenceData.js
    featsData.json
  assets/icons/
  styles/
    tokens.css
  index.css

tests/
  rules/
  api/
  roll20/
  migration/
  i18n/
  ui/

data/                   # fora do Git: banco, fotos, backups
docs/
  PLANO_V2.md
  livros/                # PDFs locais PHB/MM, fora do Git
```

Este mapa é uma referência extraída do `CLAUDE.md`, não substitui inspeção. Confirme nomes, arquivos, exportações, importações e responsabilidades reais. Não crie arquivos apenas para fazer o projeto coincidir com o mapa.

## 5.1 Fluxo arquitetural
- UI React apresenta dados e dispara ações.
- TanStack Query gerencia estado remoto/cache; não recrie um contexto global de dados.
- `src/queries/characters.js` fornece hooks como `useCharacter`, `useJournal`, `useRefData` e `useSheetActions` (confirme nomes).
- `src/hooks/useSheet.js` fornece personagem, `computeSheet(ch)`, ações e referências.
- `shared/rules/` contém cálculos puros reutilizáveis no front e nos testes.
- `server/app.js` define rotas e trata erros.
- `server/repo.js` concentra acesso aos dados.
- `server/schemas.js` valida entradas com Zod e whitelist.
- `server/migrations/` versiona mudanças do schema.
- `server/exchange.js` cuida do formato Grimoire.
- `server/roll20/` cuida da integração VTTES.

Não duplique cálculo de ficha nos componentes. Use `computeSheet` e funções de `shared/rules/`. Não mova regra para React nem replique lógica do servidor sem motivo e testes.

# 6. Banco de dados e modelo atual

O schema é documentado como **SQLite schema v2**.

## 6.1 Identidade e unidades
- IDs são gerados no servidor via `AUTOINCREMENT`.
- Tabelas filhas usam `character_id` com `ON DELETE CASCADE`, índices e `position`.
- Dimensões persistidas em pés/libras; UI pt-br converte para metros/kg conforme a convenção documentada.
- Fotos ficam em `data/photos/`; a coluna `photo` referencia o arquivo.
- `roll20_extra` preserva atributos Roll20 sem equivalente direto no modelo.

## 6.2 Tabela principal e coleções
A tabela `characters` contém identidade, atributos e estatísticas editáveis. Os campos de atributos usam componentes como `*_base`, `*_enh`, `*_misc`, `*_temp`, `*_damage` e `*_drain`. PV incluem `hp_max`, `hp_current`, `hp_temp` e `nonlethal`. CA tem componentes e `ac_override`. Há campos de combate como iniciativa, agarrar, ataques corpo a corpo/à distância, override de BBA, resistência à magia e redução de dano.

Tabelas filhas documentadas:
- `character_classes`: classe, nível, progressões/overrides, atributo mágico, domínios e avanço de classe de prestígio.
- `skills`: uma linha por perícia PHB, graduações REAL, class_skill, misc e custom_name.
- `attacks`.
- `items`: localização mochila/slot, dados de armadura e falha arcana.
- `feats`: referência a `ref_talentos`/`ref_falhas`, tipo feat/flaw.
- `class_resources` e `resource_uses`.
- `spells`, `spells_prepared`, `spell_slots`.
- `summons`.
- Diário: `players`, `npcs`, `places`, `quests`, `quest_npcs`, `notes`.

Referências: `ref_talentos`, `ref_falhas`, `ref_racas`, `ref_classes`, `ref_criaturas`, `meta`.

**Confirme os nomes e colunas no schema/migrações antes de codificar.** O resumo acima não é autorização para assumir contratos sem inspeção.

## 6.3 Migrações
- O executor usa `PRAGMA user_version`.
- Migrações ficam em `server/migrations/NNN_nome.js`, com `export function up(db, ctx)`.
- Toda alteração de schema exige nova migração; não altere migrações já aplicadas como se fossem scripts descartáveis.
- Atualize `server/schemas.js` (whitelist Zod), repositório, defaults, exchange/import-export, Roll20 se afetado, testes e `CLAUDE.md`.
- Migrações devem ser seguras, testáveis e, quando possível, reversíveis ou acompanhadas de rollback documentado.
- Teste em banco temporário/fixture, nunca primeiro no banco real.

## 6.4 Proteção crítica dos dados
`data/` contém dados pessoais e importantes do usuário e fica fora do Git.

- Nunca apague, substitua, regenere, mova ou inclua o banco/fotos/backups em commits.
- Nunca sobrescreva `data/backups/pre-v2.db`.
- Não rode comandos de seed/migrate antigos, reset, importação em massa ou SQL destrutivo sem autorização explícita.
- Não faça testes contra o banco real. Use `openDatabase(null)`/banco em memória ou `GRIMOIRE_DATA_DIR` apontando para uma cópia temporária, após confirmar o comportamento.
- O boot da API pode executar migrações e backups automaticamente. Antes de iniciar a API com o diretório de dados real, entenda o efeito do boot. Em auditoria, prefira testes e inspeção estática; não inicialize serviços que possam alterar dados sem aprovação.
- Antes de qualquer migração real: plano, backup consistente verificado, cópia de teste, validação pré/pós e rollback.
- Considere WAL/SHM e use mecanismo SQLite adequado para backup consistente; não copie cegamente apenas o arquivo principal durante gravações.
- Não exponha dados de personagens, fotos, PDFs privados, caminhos sensíveis ou credenciais em logs, relatórios externos ou commits.
- A API escuta apenas em `127.0.0.1` por não ter autenticação. Não a exponha à rede nem altere o bind sem projeto explícito de autenticação/segurança.

# 7. API e contratos

Rotas documentadas em `server/app.js`:

| Método | Rota | Responsabilidade |
|---|---|---|
| GET/POST | `/api/characters` | lista resumida / cria personagem com classes |
| GET/PATCH/DELETE | `/api/characters/:id` | ficha / atualização de campos / exclusão |
| GET | `/api/characters/:id/journal` | diário do personagem |
| POST/PATCH/DELETE | `/api/characters/:id/:collection/:rowId` | CRUD de coleções |
| PUT | `.../prepared` | substitui preparação de uma classe |
| PUT | `.../spell-slots/:classRowId/:level` | bônus/usos de slots |
| PUT | `.../resources/:id/uses/:idx` | altera uso de recurso |
| POST | `.../resources/:id/reset` | reseta recurso |
| POST | `.../rest` | Novo Dia, com opção de cura |
| PUT/DELETE | `.../photo` | upload/exclusão de foto |
| PUT | `.../npcs/:id/photo` | foto de NPC |
| GET | `/photos/:arquivo` | serve foto |
| GET | `.../export` | export Grimoire |
| POST | `/api/import` | import Grimoire |
| GET | `.../export/roll20` | export Roll20 VTTES |
| POST | `/api/import/roll20` | import Roll20 VTTES |
| GET | `/api/ref/:table` | dados de referência |
| POST | `/api/backup` | backup manual |

Toda escrita passa por Zod `.strict()`: chaves desconhecidas retornam 400. Erros seguem `{ error: { code, message, fields? } }`.

Não assuma que a tabela acima está completa ou que os contratos são exatamente estes sem ler `server/app.js` e `server/schemas.js`. Ao alterar uma rota, atualize testes Supertest, cliente `src/api/client.js`, hooks TanStack, documentação e `CLAUDE.md`. Preserve consistência entre validação, repositório, API e UI.

# 8. Front-end, estado e convenções

## 8.1 Estado e mutações
- Ficha: query key `['character', id]`.
- Diário: `['journal', id]`.
- Use hooks de `src/queries/characters.js`.
- `useSheetActions(id)` centraliza `patchCharacter`, CRUD de coleções, slots, usos, reset, preparação, descanso e upload de foto (confirme API real).
- Mutações são otimistas, com rollback, toast de erro e ressincronização, conforme documentado.
- Não introduza contexto global de dados nem estado duplicado.
- Respeite invalidação, atualização otimista, rollback e sincronização entre ficha e diário.

## 8.2 Valores derivados
CA, saves, perícias, slots, ataques e demais valores derivados devem vir de `sheet`, produzido por `computeSheet(ch)`. Não recalcule no componente nem crie fórmulas paralelas.

Se `computeSheet` não fornecer um valor necessário, proponha adicionar a regra no módulo apropriado de `shared/rules/`, com teste. Mantenha resultados explicáveis e consistentes.

## 8.3 Campos, modais e exclusões
- Campos em `src/ui/fields.jsx` salvam no blur ou Enter e cancelam com Esc; não implemente autosave por tecla sem aprovação.
- Exclusões usam `ConfirmButton` com confirmação em dois cliques.
- Modais usam `src/ui/Modal`; Esc fecha e o foco fica preso.
- Backdrop só fecha quando `closeOnBackdrop` estiver habilitado; não habilite em edição não salva.
- Use os componentes UI existentes em vez de criar versões duplicadas.

## 8.4 i18n
Convenção atual:
```jsx
const { t, signed, className, skillName, spellName, distance, weight } = useLang()
t('secao.chave', { n })
```
- Toda chave de interface deve existir em pt e en.
- Dados persistidos usam IDs estáveis em inglês (`cleric`, `lg`, `medium`); a UI traduz.
- Exceção documentada: IDs das escolas de magia são nomes em português.
- Teste `tests/i18n`.
- Não escreva textos de UI diretamente em um idioma sem tradução.

## 8.5 Unidades e visual
- Persistência em pés e libras.
- UI em português mostra metros (×0,3) e kg (÷2), conforme convenção documentada. Confirme arredondamento e conversões atuais antes de alterar.
- Use tokens de `src/styles/tokens.css` e utilitários do `@theme` em `index.css`.
- Classes conhecidas incluem `.panel`, `.section-title`, `.field`, `.label`, `.divider-gold`, `.prose-grimoire`; confirme no CSS.
- Não use cores hex diretamente em componentes.
- O pacote `grimoire-design-system` ainda **não é importado**; componentes base vivem em `src/ui`, usando tokens com nomes compatíveis. Não introduza importação do pacote sem investigar os problemas documentados em `DESIGN_SYSTEM_CONTEXT.md` e obter aprovação.
- Preserve o visual medieval e o comportamento desktop.

## 8.6 Convenções de código
- JavaScript puro, sem TypeScript.
- Código e comentários em português; IDs de dados e colunas novas em inglês.
- Simples, sem over-engineering.
- Regras novas em `shared/rules/` e testes em `tests/rules/`.
- Mudança de API acompanhada de teste em `tests/api/`.
- Use os padrões de módulos/ESM e lint já existentes.

# 9. Regras D&D 3.5 e motor compartilhado

O motor puro está em `shared/rules/` e é consumido pelo front e pelos testes. A arquitetura documentada inclui:
- `abilities.js`: atributos e modificadores.
- `progression.js`: BBA e saves.
- `combat.js`: CA e ataques.
- `skills.js`: perícias.
- `spellcasting.js`: conjuração.
- `resources.js`: recursos de classe.
- `encumbrance.js`: carga.
- `hp.js`: pontos de vida.
- `effects.js`: efeitos de talentos.
- `sheet.js`: `computeSheet`.

Constantes ficam em `shared/constants/` (atributos, tamanhos, classes, perícias, tabelas de magia e equipamentos).

## 9.1 Regras atualmente descritas no CLAUDE.md
Estas são regras documentadas como baseline; **não equivalem a uma certificação independente de correção**:
- Modificador de atributo: `floor((valor - 10) / 2)`, com valor efetivo = base + aprimoramento + misc + temporário − dano − dreno.
- BBA por classe: good = nível, average = `floor(3n/4)`, poor = `floor(n/2)`; saves good = `2 + floor(n/2)`, poor = `floor(n/3)`. Ataques iterativos em −5.
- CA: componentes manuais + itens equipados; Des limitada pelo menor `max_dex`; CA de toque e surpresa calculadas; `ac_override` substitui somente o total.
- Perícias: máximo de graduações n+3 (classe) ou (n+3)/2; penalidade de armadura em Natação ×2; sinergias incondicionais, tamanho em Esconder-se e efeitos de talentos.
- Pontos de perícia ×4 no primeiro nível; humano +1 por nível.
- Conjuração por classe, usando nível da própria classe e avanço de prestígio aplicável; tabelas PHB (`null` sem acesso e `0` apenas bônus), magias bônus por atributo, atributo mínimo 10 + nível, slot de domínio do clérigo, meio nível de conjurador para paladino/ranger, CD 10 + nível + modificador; bardo/feiticeiro espontâneos com tabela de conhecidas; classes de suplemento sem tabela podem usar slots manuais.
- Recursos descritos: fúria `1 + floor(n/4)`; música de bardo = nível; expulsar mortos-vivos `3 + Car` (+ talentos); cura pelas mãos = Car × nível; destruir o mal `1 + floor(n/5)`; forma selvagem pela tabela; ataque atordoante = nível. Fórmulas de suplemento marcadas `verified: false`.
- Carga: tabela 9-1 × tamanho; moedas contam (50 = 1 lb).
- Efeitos de talentos agregados sem empilhar repetidos, exceto `REPEATABLE_FEATS`; efeitos situacionais viram nota.
- Convocar Monstro N: criaturas `nivel_sm ≤ N`; PV = média dos DV + Con; Convocação Aprimorada: +4 For/Con.

Audite cuidadosamente cada fórmula, regra de acumulação, exceção, progressão e condição antes de chamá-la de regra oficial. Preserve o estado de verificação atual e não remova flags como `verified: false` sem fonte e teste.

## 9.2 Requisitos para qualquer regra nova
1. Localize a fonte primária aplicável (livro, edição, errata, página/seção) ou identifique claramente que a regra está pendente.
2. Determine se é regra geral, variante, opção, regra de cenário, interpretação ou homebrew.
3. Modele a mecânica em `shared/rules/` ou nos dados/constantes adequados.
4. Não copie regra para componente React.
5. Adicione testes unitários cobrindo caso comum, limites, exceções e multiclasse quando aplicável.
6. Atualize testes de `computeSheet`/integração se o resultado composto mudar.
7. Atualize `CLAUDE.md`, documentação de regras e `learnings.md` quando aplicável.
8. Explique os componentes do cálculo para que o usuário possa auditar o resultado.

## 9.3 Motor determinístico
O resultado não pode depender da interpretação do Claude em tempo de execução. Toda regra implementada deve ser lógica determinística, com entrada/saída explícita e testes reproduzíveis.

Não trate:
- todas as classes conjuradoras como um sistema único;
- todo avanço de classe de prestígio como avanço automático de conjuração;
- bônus de tipos diferentes como cumulativos sem conferir a regra;
- efeitos condicionais como bônus sempre ativos;
- conteúdo de suplemento como permitido em todas as campanhas.

Overrides e homebrew devem ser identificáveis, rastreáveis e não mascarados como regra oficial.

# 10. Conteúdo, livros e cobertura bibliográfica

O objetivo é aumentar a cobertura de publicações oficiais de D&D 3.5, sem afirmar completude prematuramente.

## 10.1 Categorias
Inventarie, quando aplicável:
- Livros básicos e erratas.
- Classes básicas, variantes e alternativas.
- Classes de prestígio.
- Raças, sub-raças, templates.
- Talentos, flaws e traits.
- Perícias e usos especiais.
- Magias, domínios e poderes concedidos.
- Equipamentos, armas, armaduras e itens mágicos.
- Monstros e habilidades especiais.
- Regras de combate, exploração, fabricação e condições.
- Psionismo, incarnum, manobras/posturas.
- Regras variantes/opcionais e conteúdo de cenário.
- Aventuras, acessórios, artigos e web enhancements relevantes.

Considere, sem limitar o inventário a: Player's Handbook, Dungeon Master's Guide, Monster Manual; linhas Complete; Expanded Psionics Handbook e Complete Psionic; Unearthed Arcana; Tome of Battle, Tome of Magic, Magic of Incarnum; Draconomicon, Libris Mortis, Lords of Madness, Fiend Folio, Fiendish Codex I/II; Dungeonscape, Cityscape, Heroes of Horror/Battle, Frostburn, Sandstorm, Stormwrack; linhas Races; Forgotten Realms, Eberron, Dragonlance, Greyhawk, Ravenloft e demais cenários.

Não invente títulos, atribuições editoriais, páginas ou compatibilidade. Separe material oficial Wizards, material 3.0, conversões, terceiros d20/OGL, revistas/artigos, aventuras e material de cenário.

## 10.2 Registro de cada publicação e conteúdo
Mantenha um catálogo estruturado (CSV/JSON ou formato já adotado pelo projeto), com campos equivalentes a:
`publication_id`, `title`, `alternate_title`, `edition`, `publisher`, `product_line`, `setting`, `publication_type`, `publication_year`, `product_code`, `is_official_wotc`, `source_url`, `errata_url`, `license_name`, `license_status`, `content_categories`, `review_status`, `last_checked_at`, `notes`.

Para cada conteúdo individual, registre quando disponível:
- ID estável, nome e aliases.
- Categoria e publicação.
- Edição, página/seção e errata.
- Requisitos e exceções estruturados.
- Efeitos mecânicos separados do texto descritivo.
- Estado de pesquisa, verificação, implementação e testes.
- Licença/permissão e restrições.
- Disponibilidade em campanha.

Estados úteis: `unresearched`, `researched`, `verified`, `implemented`, `tested`, `deprecated`, `blocked`, `needs_review`. Não confunda publicação catalogada com conteúdo verificado, licenciado ou implementado.

## 10.3 Hierarquia de fontes
1. Livro oficial e errata oficial aplicável.
2. Material oficial publicamente disponibilizado.
3. SRD 3.5, somente para o conteúdo que realmente contém.
4. Fonte secundária confiável para descoberta ou apoio, identificada como secundária.

O SRD não contém todos os suplementos. Wikis, fóruns, bancos de dados comunitários e respostas de modelos não substituem fonte primária. Em conflito, investigue edição, impressão, errata e variantes; documente a divergência e peça decisão quando depender do mestre/campanha.

## 10.4 Direitos autorais e licenças
- Não baixe, transcreva, armazene, distribua ou reproduza livros protegidos integralmente sem autorização.
- Não contorne DRM, paywall ou controle de acesso.
- Não presuma que OGL 1.0a libera todos os livros ou todo conteúdo Wizards.
- Confirme o aviso de copyright, a designação de Open Game Content e a licença no próprio produto.
- Para material proprietário, mantenha metadados bibliográficos e notas funcionais curtas escritas pela equipe, sem reproduzir texto expressivo, tabelas extensas ou descrições longas.
- Se a licença for incerta, marque `needs_review` e não incorpore o texto.
- O usuário pode fornecer material que possui/tem autorização para usar; respeite as condições e não publique o conteúdo.
- Não dê parecer jurídico definitivo.

## 10.5 Catálogos e links para pesquisa
Use como ponto de partida e valide a autoridade/atualidade de cada referência:
- D&D Collection: https://dndcollection.azurewebsites.net/Editions/Details/19?IdLanguage=1
- Linhas de produto: https://dndcollection.azurewebsites.net/Lines
- TSR Archive — 3e/3.5: https://www.tsrarchive.com/3e/3e2.html
- TSR Archive — livros básicos 3.5: https://www.tsrarchive.com/3e/3e2-core35.html
- D&D 3.5 Publications (comunitário): https://dnd-wiki.org/wiki/3.5e_Publications
- D&D Tools (secundário): https://dnd.arkalseif.info/rulebooks/editions/index.html
- SRD Booklist (secundário): https://srd.dndtools.org/srd/meta/bookList.html
- Lista cronológica 3.0/3.5: https://www.robsworld.org/dndcampaign/Player%20aids/Publication%20dates%20for%20DnD%20rulebooks%20%283.0%20and%203.5%29.pdf
- Arquivo de páginas Wizards: https://orbitalflower.github.io/rpg/wizards-3e-archive.html
- Hypertext d20 SRD: https://www.d20srd.org/
- OGL/SRD legal: https://www.d20srd.org/ogl.htm
- SRD alternativo: https://dndsrd35e.com/
- Repositório SRD comunitário: https://github.com/olimot/srd-v3.5
- Índice SRD: https://olimot.github.io/srd-v3.5/
- Arquivo comunitário de erratas: https://sites.google.com/site/timserrataarchive/tims-errata-archive/dd-errata
- Roll20: https://app.roll20.net/
- Roll20 D&D 3.5: https://wiki.roll20.net/Dungeons_and_Dragons_3.5
- Roll20 character sheets: https://wiki.roll20.net/Building_Character_Sheets
- Roll20 repeating sections: https://wiki.roll20.net/BCS/Repeating_Sections
- Repositório de fichas: https://github.com/Roll20/roll20-character-sheets
- Claude Code docs: https://code.claude.com/docs/

Para catalogar todos os livros: cruze pelo menos dois índices bibliográficos independentes; confira edição/editora/ISBN/código quando houver; deduplique reimpressões e traduções; separe 3.0, 3.5, terceiros e cenários; registre links quebrados e lacunas; não declare completude sem resolver divergências e documentar limitações.

# 11. Roll20 — integração VTTES

## 11.1 Alvo documentado
O `CLAUDE.md` atual identifica:
- Repositório de fichas: `Roll20/roll20-character-sheets`.
- Pasta de referência: `D&D_3-5`.
- Existe também `D&D_3-5-pt-br`, documentada como usando os mesmos nomes de atributo.
- Mapeamento interno em `server/roll20/map.js`.
- Adaptador em `server/roll20/index.js`, com `exportRoll20` e `importRoll20`.
- Formato informado como VTTES:
```js
{
  schema_version,
  name,
  bio,
  attribs: [{ name, current, max }]
}
```
- Atributos/seções repetíveis usam nomes no formato:
  `repeating_<seção>_<id de 20 chars>_<campo>`.
- Magias documentadas como `repeating_spells<nível><1|2>` com campos `spellname<nível><1|2>`.

**PENDÊNCIA EXPLÍCITA:** validar import/export com um export real da ficha no VTTES. Não declare integração comprovada até esse teste ser feito.

## 11.2 Regras de integração
- Confirme o código e a versão exatos da ficha usada no Roll20. Não presuma que o branch atual do GitHub é idêntico à ficha em produção.
- Não presuma que Roll20 aceita JSON genérico nem que existe API pública para ler/escrever qualquer ficha.
- Confirme a estrutura VTTES com amostra real, documentação atual e testes.
- Preserve atributos desconhecidos em `roll20_extra` ou mecanismo equivalente.
- Nunca descarte silenciosamente dados que não tenham mapeamento.
- Exiba prévia/diff antes de substituir dados existentes.
- Relate campos importados, exportados, ignorados, normalizados, não suportados e com perda potencial.
- Registre versão do adaptador, versão da ficha, origem do arquivo e data de validação.
- Não viole termos de serviço, segurança ou controles da plataforma.

## 11.3 Testes obrigatórios
1. Exportar personagem Grimoire → VTTES → importar novamente.
2. Importar arquivo real exportado do Roll20/VTTES.
3. Personagem básico.
4. Multiclasse e classe de prestígio.
5. Magias, slots e seções repetíveis.
6. Talentos, perícias, equipamentos, ataques e recursos.
7. Campos desconhecidos/`roll20_extra`.
8. Dados ausentes, duplicados, inválidos e tipos inesperados.
9. Round-trip sem perda semântica nos campos suportados.
10. IDs repetíveis e regeneração sem colisão.

A equivalência esperada é semântica, não igualdade textual. Se uma propriedade não puder ser representada, informe-a no relatório de compatibilidade.

# 12. Segurança, validação e qualidade

## 12.1 Validação de personagem
Cada achado deve conter:
- Código estável.
- Severidade: `error`, `warning` ou `info`.
- Mensagem e entidade/campo afetado.
- Regra e fonte.
- Explicação.
- Correção sugerida, se segura.
- Indicação se depende de regra opcional, fonte habilitada ou decisão do mestre.

Verifique, conforme o escopo implementado:
- Pré-requisitos de talentos e classes de prestígio.
- Limites e pontos de perícia.
- BBA, saves, DV, PV e progressões.
- Escolhas obrigatórias por nível.
- Conjuração, magias, slots e níveis efetivos.
- Bônus que não se acumulam.
- Regras opcionais e fontes proibidas pela campanha.
- Dados ausentes, inconsistentes ou fora de faixa.

Diferencie erro objetivo de aviso interpretativo.

## 12.2 Segurança da aplicação
- Zod `.strict()` deve rejeitar propriedades inesperadas conforme o contrato.
- Não relaxe validação para “fazer funcionar” sem entender o risco.
- Sanitização de conteúdo rico deve preservar o uso de DOMPurify e os limites do TipTap.
- Fotos devem ser validadas por tipo/tamanho e processadas pelo fluxo existente; não confie apenas na extensão.
- Não exponha a API na rede: bind local é uma medida de segurança deliberada.
- Não registre conteúdo sensível de notas, personagens ou fotos.
- Não adicione segredos, tokens ou dados reais aos testes/fixtures.
- Revise importações como entrada não confiável; validar schema, tamanho, IDs, referências e arquivos embutidos.

## 12.3 Testes e comandos
Antes de concluir implementação:
1. Execute testes unitários pertinentes.
2. Execute testes de API/Supertest pertinentes.
3. Execute testes Roll20/migração/i18n/UI afetados.
4. Execute `npm run lint`.
5. Execute `npm run build`.
6. Inspecione o diff e os arquivos não relacionados.
7. Informe exatamente o que foi executado e o resultado real.

`npm test` é o comando documentado para Vitest, mas confirme `package.json`. Não diga que teste passou sem executá-lo. Se não puder executar, informe por quê e o risco residual. Evite iniciar a API sobre o diretório de dados real se o boot puder executar migrações/backups.

# 13. Documentação e decisões técnicas

Mantenha documentação compatível com a estrutura já adotada. Não crie uma floresta de documentos sem necessidade. Onde fizer sentido, mantenha:
- Arquitetura e fluxos.
- Matriz de regras/fontes/publicações.
- Cobertura de conteúdo por categoria.
- Especificação e limitações do Roll20/VTTES.
- Decisões arquiteturais.
- Problemas conhecidos e status de implementação.

Atualize:
- `CLAUDE.md` na mesma tarefa em que o estado do projeto mudar.
- `learnings.md` para descobertas não óbvias/falhas.
- `docs/PLANO_V2.md` somente se o plano/decisão histórica realmente precisar ser revisado e com aprovação apropriada.
- Documentação específica de regras, migrações, API e Roll20 quando afetada.

Não transforme o `CLAUDE.md` em cópia de todos os detalhes do código; mantenha-o como contexto operacional atualizado e referencie documentação mais profunda.

# 14. Uso disciplinado do Claude Code

Quando a tarefa justificar, proponha dividir responsabilidades em especialistas, sem delegar mudanças concorrentes sem coordenação:
- **D&D Rules Researcher:** fontes, edição, errata, requisitos e status de verificação.
- **Rules Validator:** revisão independente de fórmulas e casos de borda.
- **Roll20 Specialist:** ficha, VTTES, repeating sections, mapeamentos e round-trip.
- **React/API Architect:** arquitetura atual, TanStack Query, Express, Zod e SQLite.
- **Test Engineer:** fixtures, regressão, testes de regras/API/migração.
- **Code Reviewer:** revisão final do diff, segurança e escopo.

Use skills/workflows reutilizáveis quando disponíveis para auditoria, pesquisa de regra, inclusão de conteúdo, validação de personagem e teste de import/export. Não crie agentes ou skills como trabalho incidental antes da auditoria e aprovação.

# 15. Critérios de sucesso

Prioridades:
1. Preservar os dados e a aplicação existente.
2. Precisão e rastreabilidade das regras.
3. Integridade do schema e migrações.
4. Consistência front-end/API/banco.
5. Cobertura de publicações mensurável.
6. Compatibilidade Roll20/VTTES demonstrada por amostras reais e testes.
7. Testes reproduzíveis.
8. Experiência de uso e visual medieval.

Meça separadamente:
- Publicações catalogadas.
- Publicações com fontes confirmadas.
- Conteúdo com licença revisada.
- Regras verificadas.
- Regras implementadas.
- Regras cobertas por testes.
- Campos Roll20 mapeados.
- Campos preservados como extras.
- Casos de round-trip aprovados.

**Regra final:** se não souber, investigue; se não puder verificar, declare a incerteza; se houver conflito, documente; se a licença for incerta, não copie; se a integração não for suportada, não prometa; se o teste não foi executado, não diga que passou.

---

# 16. PROMPT INICIAL — AUDITORIA SOMENTE LEITURA

**Copie o texto abaixo e envie ao Claude Code com o terminal aberto na raiz do repositório Grimoire.**

```text
Leia integralmente o CLAUDE.md da raiz e siga suas instruções.

Leia também, antes de concluir:
- learnings.md
- docs/PLANO_V2.md
- DESIGN_SYSTEM_CONTEXT.md (especialmente para avaliar UI/design system)
- package.json e arquivos de configuração relevantes
- código e testes diretamente relacionados a cada área auditada

CONTEXTO ATUAL:
O Grimoire é uma aplicação local de D&D 3.5. A arquitetura atual documentada usa React 19, Vite 8, Tailwind 4, React Router 7, TanStack Query 5, TipTap 3, DOMPurify, Express 5, better-sqlite3, Zod 4, JavaScript puro, motor de regras compartilhado em shared/rules/, banco SQLite schema v2, migrações com PRAGMA user_version e integração Roll20 por VTTES em server/roll20/.

SUA TAREFA É SOMENTE AUDITAR. NÃO IMPLEMENTE NADA.

PROIBIÇÕES:
- Não crie, edite, apague, mova ou formate arquivos.
- Não altere CLAUDE.md, learnings.md, docs ou testes.
- Não instale, remova ou atualize dependências.
- Não execute migrações, seed, reset, importação ou qualquer operação que altere dados.
- Não inicie a API contra o diretório de dados real se o boot puder executar migrações ou backups.
- Não faça commits, push ou deploy.
- Não modifique data/, banco, fotos ou backups.
- Não use comandos SQL destrutivos.
- Não tente “corrigir” inconsistências durante a auditoria.

IMPORTANTE SOBRE O ESTADO:
O CLAUDE.md descreve o baseline atual, mas você deve confirmar cada informação no repositório. Compare o código real com o CLAUDE.md e com docs/PLANO_V2.md. Diferencie claramente:
- implementado e confirmado;
- parcialmente implementado;
- planejado, mas ainda ausente;
- divergente da documentação;
- defeituoso;
- não verificável com segurança nesta auditoria.

INVESTIGUE:

1. STACK E CONFIGURAÇÃO
- package.json, scripts, versões e dependências.
- Vite, proxy /api e /photos, portas e variáveis de ambiente.
- Inicialização do servidor e bind 127.0.0.1.
- Compatibilidade entre scripts documentados e scripts reais.
- Configuração de testes, lint e build.

2. ARQUITETURA E FLUXOS
- server/index.js, app.js, db.js, migrate.js, migrations/, schemas.js, repo.js, defaults.js.
- shared/constants/ e shared/rules/.
- src/api/client.js, src/queries/characters.js, src/hooks/useSheet.js.
- Providers, rotas, features, componentes UI e i18n.
- Fluxos completos de leitura, edição, mutação otimista, rollback, invalidação e sincronização.
- Responsabilidades e acoplamento entre UI, API, repositório, banco e motor de regras.

3. BANCO E INTEGRIDADE
- Schema SQLite v2 e todas as migrações.
- Chaves estrangeiras, cascades, índices, position, constraints e defaults.
- Estratégia de backup, WAL/SHM e recuperação.
- PRAGMA user_version e idempotência das migrações.
- Isolamento por GRIMOIRE_DATA_DIR e banco em memória.
- Riscos de perda, sobrescrita ou corrupção de dados.
- Não abra nem altere o banco real se isso puder produzir escrita ou migração.

4. API E VALIDAÇÃO
- Inventarie rotas reais em server/app.js.
- Confira contratos Zod .strict(), whitelists, mensagens de erro e códigos HTTP.
- Verifique CRUD de coleções, descanso, slots, recursos, fotos, diário, import/export e backup.
- Confira se cliente e hooks correspondem aos contratos.
- Procure problemas de concorrência, autorização local, validação de uploads e entrada maliciosa.

5. MOTOR D&D 3.5
- Audite shared/rules/ e shared/constants/.
- Confira computeSheet e seus consumidores.
- Avalie atributos, progressão multiclasse, BBA, saves, PV, CA, ataques, perícias, carga, conjuração, recursos e efeitos de talentos.
- Procure regras simplificadas, fórmulas incompletas, empilhamento incorreto, exceções ausentes e inconsistências entre módulos.
- Não valide uma regra usando apenas outra função do próprio projeto.
- Para cada achado, indique fonte primária/errata quando puder confirmar. Se não puder, marque como pendente.
- Diferencie regra oficial, variante, regra de cenário, interpretação e homebrew.
- Confira especialmente fórmulas marcadas verified: false e não as promova a verificadas sem evidência.

6. CONTEÚDO E COBERTURA DE LIVROS
- Examine fontes de dados de talentos, falhas, raças, classes, criaturas e magias.
- Determine o que vem do PHB/SRD e o que vem de suplementos.
- Verifique se há catálogo bibliográfico e rastreabilidade por publicação/página/errata/licença.
- Identifique lacunas por categoria: classes, classes de prestígio, raças, talentos, perícias, magias, equipamentos, itens, monstros, templates, variantes, psionismo, incarnum e manobras.
- Não declare cobertura completa com base em nomes de arquivos ou quantidade de registros.
- Não copie texto protegido nem baixe PDFs.

7. ROLL20 / VTTES
- Examine server/roll20/map.js, server/roll20/index.js e testes.
- Confirme a ficha exata: D&D_3-5 e/ou D&D_3-5-pt-br, versão/commit e nomes de atributos.
- Audite repeating sections, IDs, magias, campos atuais/máximos e normalização.
- Verifique preservação de campos desconhecidos em roll20_extra.
- Confira o estado da pendência: validar import/export com um arquivo real exportado do VTTES.
- Não declare integração comprovada sem fixture real e round-trip testado.
- Não invente API pública ou compatibilidade.

8. FRONT-END E EXPERIÊNCIA
- Verifique rotas, telas, formulários, campos, modais, confirmações, acessibilidade e responsividade desktop.
- Confirme uso de computeSheet em vez de cálculos nos componentes.
- Confira i18n pt/en, chaves ausentes e IDs estáveis.
- Confira conversão pés/libras para metros/kg.
- Avalie consistência visual e uso de tokens; não altere o design system.

9. TESTES E MANUTENÇÃO
- Inventarie testes existentes e lacunas.
- Avalie fixtures, testes de migração, API, regras, Roll20, i18n e renderização.
- Identifique testes frágeis, dependentes do banco real ou com cobertura ilusória.
- Não rode testes que possam escrever no banco real. Se executar testes seguros, informe os comandos exatos e resultados.
- Não afirme que executou algo que não executou.

10. DOCUMENTAÇÃO
- Compare CLAUDE.md, learnings.md, docs/PLANO_V2.md e documentação técnica com o código.
- Liste informações obsoletas, incompletas, contraditórias ou ausentes.
- Identifique mudanças que exigiriam atualização de CLAUDE.md e learnings.md, mas não edite nada.

FORMATO DO RELATÓRIO:

A. Resumo executivo
- Estado geral do projeto.
- Principais riscos.
- O que está sólido.
- O que impede confiar plenamente nos cálculos e na integração.

B. Mapa da arquitetura real
- Fluxos front → API → repositório → SQLite.
- Fluxo de cálculo shared/rules → computeSheet → UI.
- Fluxos de import/export Grimoire e Roll20.

C. Matriz de funcionalidades
Para cada área: implementada, parcial, ausente, defeituosa, divergente ou não verificada; evidências e arquivos.

D. Auditoria de regras D&D 3.5
- Regra/fórmula.
- Arquivo/função.
- Problema ou risco.
- Fonte/errata conferida.
- Testes existentes e testes necessários.
- Prioridade.

E. Auditoria Roll20
- Ficha/versão confirmada ou pendente.
- Mapeamentos cobertos.
- Campos preservados.
- Perdas potenciais.
- Estado dos testes VTTES.
- Plano para validar com um export real.

F. Segurança e proteção de dados
- Riscos de migração, backup, API, importação, uploads e exposição.
- Operações que exigem salvaguardas adicionais.

G. Documentação
- Divergências no CLAUDE.md.
- Entradas necessárias em learnings.md.
- Decisões a atualizar em docs/PLANO_V2.md.
- Não faça as alterações.

H. Plano incremental recomendado
Para cada fase:
- objetivo;
- escopo;
- arquivos/módulos prováveis;
- dependências;
- riscos;
- critérios de aceite;
- testes;
- estratégia de rollback.

I. Decisões que dependem do usuário
Faça perguntas somente quando uma decisão realmente bloquear o plano.

J. Veredito
- O que pode ser desenvolvido com segurança.
- O que precisa de pesquisa/fonte.
- O que precisa de fixture real do Roll20.
- O que não deve ser alterado ainda.

Use evidências concretas (arquivos, funções, rotas, testes). Não invente. Não implemente. Termine o relatório e aguarde minha aprovação explícita de uma fase específica.
```

---

# 17. PROMPT PARA IMPLEMENTAR UMA FASE APROVADA

Use somente depois de receber e revisar a auditoria e aprovar uma fase específica:

```text
Aprovo exclusivamente a fase [NÚMERO/NOME] do plano de auditoria.

Antes de editar:
1. Releia o CLAUDE.md, learnings.md, docs/PLANO_V2.md e a auditoria.
2. Confirme que o escopo aprovado ainda corresponde ao código atual.
3. Liste arquivos que serão alterados e por quê.
4. Explique riscos, dependências, impacto em dados e rollback.
5. Identifique se haverá migração SQLite, alteração de contrato API ou impacto no Roll20.

Implemente somente essa fase.

REGRAS:
- Preserve a arquitetura atual: JavaScript, React, TanStack Query, Express, Zod, SQLite e shared/rules.
- Não introduza TypeScript, dependências ou reestruturações sem aprovação.
- Não altere o banco real diretamente.
- Se houver schema, crie migração nova em server/migrations e teste em banco temporário/fixture.
- Atualize schemas Zod, repo, API, cliente/hooks, exchange e Roll20 quando forem afetados.
- Regras D&D novas/alteradas ficam em shared/rules ou shared/constants, com testes.
- Valores derivados continuam centralizados em computeSheet.
- Mantenha i18n pt/en e tokens/estilo existentes.
- Preserve campos desconhecidos e compatibilidade de import/export.
- Não invente regra, fonte, página, errata ou mapeamento.
- Atualize CLAUDE.md na mesma tarefa e learnings.md se houver descoberta não óbvia ou falha.
- Não modifique escopo não aprovado.

Ao terminar:
1. Liste todos os arquivos alterados.
2. Descreva comportamento antes/depois.
3. Informe migrações e impacto no banco (se houver).
4. Informe testes executados, comandos e resultados reais.
5. Execute lint e build quando seguros/aplicáveis.
6. Inspecione o diff e confirme que não houve alteração fora do escopo.
7. Liste limitações, incertezas e pendências.
8. Não comece a próxima fase sem aprovação explícita.
```

# 18. Prompt para pesquisa bibliográfica do catálogo

Use como tarefa separada, após aprovação do usuário:

```text
Faça uma etapa de pesquisa bibliográfica de publicações D&D 3.5. Não altere o motor de regras e não copie conteúdo protegido.

1. Consulte os catálogos e referências bibliográficas listados no CLAUDE.md.
2. Monte uma lista deduplicada de publicações oficiais Wizards 3.5.
3. Mantenha trilhas separadas para material 3.0 compatível, cenários, aventuras, artigos/revistas, web enhancements e terceiros d20/OGL.
4. Confirme título, edição, editora, linha, ano, código/ISBN quando houver evidência.
5. Cruze pelo menos dois índices independentes e registre a autoridade de cada fonte.
6. Localize erratas/FAQ aplicáveis sem misturar edições.
7. Classifique licença/permissão; marque needs_review quando incerto e não copie o conteúdo.
8. Classifique categorias de conteúdo presentes em cada publicação.
9. Registre duplicatas, reimpressões, traduções, links quebrados e lacunas.
10. Produza o catálogo e relatório, mas não implemente regras.
11. Não baixe nem distribua PDFs protegidos, não use torrents e não contorne DRM/paywall.
12. Não declare completude sem evidência cruzada e revisão humana.
13. Apresente o relatório e aguarde aprovação.
```

---

## Apêndice — princípios que não podem ser violados

- O Grimoire é um projeto existente: preservar antes de refatorar.
- O estado atual é JavaScript, não TypeScript.
- TanStack Query é o estado do servidor; não ressuscitar o antigo AppContext de dados.
- `computeSheet`/`shared/rules` são a fonte dos valores derivados.
- Migrações SQLite são versionadas e o boot pode executá-las; proteger `data/`.
- A API deve permanecer em `127.0.0.1` enquanto não houver autenticação.
- A pendência de VTTES com export real deve permanecer explícita até ser testada.
- O SRD não representa todos os suplementos.
- Conteúdo catalogado não é necessariamente licenciado, verificado ou implementado.
- Não copiar conteúdo protegido.
- Não declarar testes, compatibilidade ou cobertura sem evidências.
- Toda alteração aprovada deve deixar código, testes, `CLAUDE.md` e `learnings.md` coerentes.
