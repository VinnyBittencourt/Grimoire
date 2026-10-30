# Grimoire — Contexto do Projeto

App local, de uso próprio, de ficha de personagem **D&D 3.5**. Visual medieval, com campos e cálculos alinhados à ficha **"D&D_3-5" do Roll20** (e import/export nesse formato). Uso no desktop.

## Aprendizados (leitura obrigatória)

@learnings.md

**Regras de documentação (obrigatórias em toda tarefa):**

1. **CLAUDE.md sempre atualizado:** toda alteração no projeto (arquitetura, pasta, arquivo importante, script, dependência, endpoint, tabela/coluna, regra de jogo, convenção) deve atualizar este CLAUDE.md **na mesma tarefa**, antes de encerrá-la. Ele precisa sempre descrever o estado atual do código.
2. **learnings.md:** sempre que descobrir algo não óbvio, ou quando algo não funcionar de primeira (erro, abordagem errada, comando que falhou, suposição incorreta), adicione uma entrada em `learnings.md` no formato descrito no próprio arquivo.

Histórico da reescrita v2 e decisões: `docs/PLANO_V2.md`.

## Regras de trabalho

Versão condensada de `docs/CLAUDE_MASTER_INSTRUCTIONS.md`. O documento completo traz detalhes, fontes, links e os prompts de **auditoria (§16)**, **implementar fase (§17)** e **pesquisa bibliográfica (§18)**.

**Fluxo**
- Comece por uma auditoria somente leitura quando o escopo não estiver claro.
- Trabalhe **só na fase/tarefa aprovada**. Antes de editar, liste os arquivos afetados, riscos, dependências e rollback.
- Não amplie o escopo, não reescreva o que funciona e não troque arquitetura ou biblioteca por preferência. Se surgir uma mudança de escopo, explique e peça autorização.
- A aprovação de uma fase não aprova as seguintes.

**Evidência**
- Diferencie fato confirmado no código, informação documentada, hipótese e recomendação. Cite o arquivo/função.
- Percorra o fluxo real antes de dizer que algo existe.
- Nunca invente regra, página, fonte, endpoint, compatibilidade ou resultado de teste.
- Nunca diga "100%", "todos os livros" ou "teste passou" sem evidência executada.

**Dados (`data/`)**
- Nunca apague, mova, regenere ou faça commit do banco, das fotos ou dos backups. Nunca sobrescreva `data/backups/pre-v2.db`.
- O boot da API **migra e faz backup**: não suba a API contra `data/` sem aprovação.
- Teste com `openDatabase(null)` ou com `GRIMOIRE_DATA_DIR` apontando para uma cópia.
- Migração real só com plano, backup consistente verificado (`db.backup`), ensaio em cópia, validação pré/pós e rollback.
- Mantenha o bind em `127.0.0.1` enquanto não houver autenticação.
- Não registre conteúdo de notas, personagens ou fotos em logs ou relatórios externos.

**Regras D&D**
- Hierarquia de fontes:
  1. livro oficial + errata;
  2. material oficial público;
  3. SRD 3.5 (só o que ele contém);
  4. fonte secundária, identificada como tal.
- Wikis e respostas de modelo não são fonte primária.
- Classifique cada regra como oficial, variante, cenário, interpretação ou homebrew. Overrides e homebrew devem ficar identificáveis.
- O motor é determinístico: regra nova vai para `shared/rules`/`shared/constants`, com testes (caso comum, limites, exceções, multiclasse). Nunca vai para componente.
- Não trate bônus de tipos diferentes como cumulativos sem conferir, nem efeitos condicionais como sempre ativos.
- Não remova `verified: false` sem fonte e teste.

**Conteúdo e licenças**
- Não copie texto protegido de livros nem baixe ou distribua PDFs.
- Para material proprietário, guarde metadados e notas funcionais curtas.
- Licença incerta → `needs_review`, sem incorporar o texto.
- Catalogado ≠ verificado ≠ licenciado ≠ implementado.

**Roll20**
- O import foi conferido com um export real da VTTES (`tests/roll20/fixtures/`). Importar no Roll20 um arquivo gerado pelo Grimoire continua **sem teste**: não declare a ida e volta comprovada.
- Preserve atributos desconhecidos (`roll20_extra`). Nunca descarte dados sem avisar.
- Mostre prévia/diff antes de sobrescrever dados existentes.

**Antes de concluir uma implementação**
- Rode os testes pertinentes, `npm run lint` e `npm run build`, e revise o diff.
- Relate exatamente o que foi executado e o resultado. Se algo não pôde ser executado, diga por quê.

**Prioridades**
1. Preservar dados e o app.
2. Precisão e rastreabilidade das regras.
3. Integridade do schema.
4. Consistência front/API/banco.
5. Cobertura mensurável.
6. Roll20 comprovado com amostra real.
7. Testes reproduzíveis.
8. UX e visual medieval.

**Regra final:** se não souber, investigue; se não puder verificar, declare a incerteza; se houver conflito, documente; se a licença for incerta, não copie; se a integração não for suportada, não prometa; se o teste não foi executado, não diga que passou.

## Stack

- **Front:** React 19 + Vite 8 + Tailwind CSS 4, React Router 7, **TanStack Query 5** (estado do servidor), TipTap 3 (notas), DOMPurify
- **API:** Express 5 + **better-sqlite3** (`data/grimoire.db`), validação com **zod 4**
- **Regras:** motor puro em `shared/rules/`, usado no front e nos testes
- **Testes:** Vitest + supertest; jsdom + Testing Library (`@testing-library/react`) para interação
- JavaScript puro (sem TypeScript)

## Rodar

```bash
npm run dev:all   # Vite (3003) + API (3005). Alias: npm start
npm run dev       # só Vite → http://localhost:3003
npm run dev:api   # só API  → http://127.0.0.1:3005
npm test          # Vitest (regras, API, migração, Roll20, i18n, renderização, interação)
npm run lint
npm run build
npm run coverage:content   # gera docs/COBERTURA_CONTEUDO.md (só lê src/)
```

- O Vite faz proxy de `/api` e `/photos` para a API.
- **Variáveis de ambiente:** `GRIMOIRE_DATA_DIR` (pasta de dados, padrão `data/`), `GRIMOIRE_API_PORT` e `GRIMOIRE_WEB_PORT`. Servem para rodar uma 2ª instância de teste sobre uma cópia dos dados.
- A API escuta **só em 127.0.0.1**, porque não tem autenticação. Além disso, o middleware `localOnly` (`server/app.js`) recusa com 403 (`forbidden_origin`) um `Host` que não seja `localhost`/`127.0.0.1`/`[::1]` (DNS rebinding) e escritas com `Origin` externo ou `Sec-Fetch-Site: cross-site` (CSRF). Requisições sem `Origin` (curl, testes) passam. Abra o app por um desses hostnames.
- No boot, a API aplica as migrações pendentes (com backup antes), atualiza os dados de referência se a versão mudou e faz um backup (pulado se o conteúdo é igual ao do último backup, conferido por hash em `backups/last-backup.json`). Não existe mais `npm run seed` nem `npm run migrate`.

## Estrutura

```
server/
  index.js            ← boot: abre o banco, backup no boot (se mudou) e a cada 30 min (se houve escrita), listen 127.0.0.1
  app.js              ← createApp({ db, dataDir, backupper }) — localOnly (Host/Origin), todas as rotas + tratamento de erro
  db.js               ← openDatabase(dataDir | null=memória): pragmas, migrate, seed
  migrate.js          ← executor de migrações (PRAGMA user_version)
  migrations/         ← 001_schema_v2.js (schema), 002_from_v1.js (converte dados v1), 003_ref_sources.js (coluna `fonte` nas ref_*)
  schemas.js          ← zod: characterFields, COLLECTIONS (whitelist de colunas por coleção)
  repo.js             ← acesso a dados (getSheet, getJournal, CRUD genérico, rest, slots, usos)
  defaults.js         ← ensureSkillRows, syncResources
  exchange.js         ← export/import formato Grimoire (JSON v2, com fotos embutidas)
  roll20/             ← map.js (nomes de atributo) + index.js (exportRoll20/importRoll20, formato VTTES)
  seed.js             ← popula ref_* a partir de src/db (SEED_VERSION = 6); DV/BBA/saves de ref_classes vêm de shared/constants/classes.js
  backup.js           ← db.backup + prune: 20 por tipo (boot, auto); pre-migration-vN e manual nunca são apagados
  photos.js           ← detectImageExt (magic bytes: jpg/png/webp/gif), parseImageDataUrl, save/delete
shared/
  constants/          ← abilities, sizes, classes (mecânica das classes: fonte única de DV/BBA/saves; suplementos com verified: false), skills (ids = Roll20), spellTables, equipment
  rules/              ← abilities, progression (BAB/saves), combat (CA, ataques), skills, spellcasting,
                        resources, encumbrance, hp, effects (talentos), sheet.js (computeSheet)
src/
  main.jsx, App.jsx   ← providers (Query, Lang, Toast) e rotas
  api/client.js       ← fetch + ApiError, downloadJson, resizeImage (webp ~640px)
  queries/characters.js ← hooks TanStack: useCharacter, useJournal, useRefData, useSheetActions (mutações otimistas)
  hooks/useSheet.js   ← { ch, sheet: computeSheet(ch), actions, refFeats }
  i18n/               ← index.jsx (LangProvider, useLang: t, unidades, rótulos) + translations.js (pt/en)
  ui/                 ← Button, IconButton, ConfirmButton, Modal, Toast, fields (Text/Number/Select/Checkbox), Tabs, layout, RichText
  features/
    characters/       ← CharacterListPage, NewCharacterPage (assistente)
    shell/            ← AppHeader, ExchangeModal (import/export/backup)
    sheet/            ← SheetPage (abas), Sidebar, HpTracker
    core/ skills/ feats/ spells/ inventory/ summons/ journal/   ← uma pasta por aba
  data/               ← builtinSpells.json (lista padrão por classe), spellNamesEn.json
  db/                 ← referenceData.js (raças, classes só com texto, criaturas) + featsData.json (fonte do seed) + publications.js (catálogo de livros, sourceFor)
  assets/icons/       ← equipmentIcons, escolaIcons, escolaColors
  styles/tokens.css   ← tokens (mesmos nomes do grimoire-design-system) · index.css ← Tailwind + tema
tests/                ← rules/, api/, roll20/, migration/ (com fixture v1Schema.js), i18n/, ui/ (render smoke SSR + interaction.test.jsx com `// @vitest-environment jsdom`)
data/                 ← FORA do git: grimoire.db, photos/, backups/ (pre-v2.db = snapshot antes da v2)
docs/                 ← PLANO_V2.md, CLAUDE_MASTER_INSTRUCTIONS.md, COBERTURA_CONTEUDO.md (gerado); livros/ (PDFs PHB/MM, fora do git)
scripts/              ← content-coverage.js (npm run coverage:content)
```

## Banco (SQLite, schema v2)

- **IDs** gerados no servidor (`AUTOINCREMENT`). As tabelas filhas de personagem têm `character_id … ON DELETE CASCADE`, índice e `position`.
  - Exceções: `resource_uses` (chave `resource_id, idx`) e `quest_npcs` (chave `quest_id, npc_id`) não têm `character_id` nem `position` e dependem da linha-mãe por cascade. `spell_slots` tem `character_id` e índice, mas não tem `position` (chave `class_row_id, level`).
- **`characters`:** identidade e unidades em **pés/libras**.
  - Atributos `<ab>_{base,enh,misc,temp,damage,drain}` (ab = str…cha).
  - PV `hp_max/hp_current/hp_temp/nonlethal`.
  - CA `ac_{armor,shield,natural,deflection,dodge,misc,temp}` + `ac_override`.
  - Saves `<fort|ref|will>_{magic,misc,temp}`.
  - Combate `init_misc, grapple_misc, melee_misc, ranged_misc, bab_override`, `sr`, `dr`.
  - Moedas `cp, sp, gp, pp`; `xp`; `photo` (arquivo em `data/photos`); `background`; `roll20_extra` (atributos Roll20 sem equivalente, para round-trip).
- **Tabelas filhas:**
  - `character_classes`: `class_id`, `level`, overrides `hd/bab_prog/<save>_prog`, `caster_ability`, `domains`, `advances_id/advance_levels` (classe de prestígio que avança outra).
  - `skills`: uma linha por perícia PHB, criada automaticamente; `ranks` REAL, `class_skill` (null = padrão da classe), `misc`, `custom_name`.
  - `attacks`, `items` (`location` = `backpack` ou slot de `EQUIPMENT_SLOTS`; `ac_type/ac_bonus/max_dex/acp/spell_failure`), `feats` (`ref_id` → `ref_talentos`/`ref_falhas`, `kind` feat|flaw|trait|feature).
  - `class_resources` (`key` = fórmula em `shared/rules/resources.js`, ou null = recurso personalizado com `total_override`) + `resource_uses` (idx, used, note).
  - `spells` (grimório/conhecidas por `class_row_id`), `spells_prepared` (uma linha por slot preparado, `used`, `is_domain`), `spell_slots` (por classe e nível: `bonus` manual e `used` para espontâneos).
  - `summons` (`data` = JSON do bloco de estatísticas).
  - Diário: `players`, `npcs`, `places`, `quests` + `quest_npcs`, `notes` (HTML, `session_date` ISO).
- **Referência** (seed automático): `ref_talentos`, `ref_falhas`, `ref_racas`, `ref_classes` (ids em inglês), `ref_criaturas`, `meta`.
  - Toda tabela `ref_*` tem `fonte` (JSON, migração 003), montada por `sourceFor` em `src/db/publications.js`: `{ livro, pagina, tipo, licenca, srd, verificado, conferido_em, nota }`.
  - `pagina` fica sempre `null` até alguém conferir no livro (nunca inventar).
  - `srd: true` no registro significa que ele consta no SRD 3.5 (conferido por nome ou estatística); não significa que os efeitos foram verificados.
  - `verificado: true` só quando os números foram conferidos numa fonte (hoje: as 32 criaturas de Convocar Monstro, no SRD).
  - Livro novo nos dados precisa entrar em `PUBLICATIONS` (há teste).
- **Coluna/tabela nova:** crie uma migração nova `server/migrations/NNN_nome.js` com `export function up(db, ctx)`. Atualize também `server/schemas.js` (whitelist), `exchange.js` se for exportável, e este arquivo.

## API (`server/app.js`)

| Rota | O que faz |
|---|---|
| `GET/POST /api/characters` | lista (resumo) / cria (com `classes: [...]`) |
| `GET/PATCH/DELETE /api/characters/:id` | ficha completa / campos do personagem / exclui (cascade + foto do personagem e dos NPCs) |
| `GET /api/characters/:id/journal` | diário (background, players, npcs, places, quests c/ `npc_ids`, notes) |
| `GET/POST /api/characters/:id/:collection` · `PATCH/DELETE …/:collection/:rowId` | CRUD genérico (lista / cria / altera / remove): classes, skills, attacks, items, feats, resources, spells, prepared, summons, players, npcs, places, quests, notes |
| `PUT .../prepared` | substitui a preparação de uma classe `{ class_row_id, slots }` |
| `PUT .../spell-slots/:classRowId/:level` | `{ bonus?, used? }` |
| `PUT .../resources/:id/uses/:idx` · `POST .../resources/:id/reset` | fichas de uso |
| `POST .../rest` | Novo Dia `{ heal }`: restaura magias/slots/recursos; cura natural = nível |
| `PUT/DELETE .../photo` · `PUT .../npcs/:id/photo` | upload binário; a extensão vem do conteúdo (jpg/png/webp/gif), não do Content-Type → `GET /photos/:arquivo` (só essas extensões, com `nosniff` e CSP `sandbox`) |
| `GET .../export` · `POST /api/import` | formato Grimoire (remapeia todos os ids; `photo_data` inválido dá 400) |
| `GET .../export/roll20` · `POST /api/import/roll20` | formato VTTES (Roll20) |
| `GET /api/ref/:table` · `POST /api/backup` | referência (JSON já parseado) / backup manual |

Erros sempre vêm como `{ error: { code, message, fields? } }`. Os corpos JSON do CRUD, do personagem, de `prepared`, `spell-slots`, `uses` e `rest` passam por zod com `.strict()`: chave desconhecida dá 400.

Exceções conhecidas (pendentes de reforço):
- `POST /api/import` filtra as colunas de cada linha pela whitelist (`pick`), descartando chaves desconhecidas sem dar 400. `uses`, `spell_slots` e `npc_ids` não passam por zod.
- `POST /api/import/roll20` não usa zod (só valida `attribs`).
- Foto (binário, validado pelos magic bytes), `reset` e `backup` não têm corpo.

## Front-end

- **Estado:** a ficha fica em `['character', id]` e o diário em `['journal', id]` (TanStack Query). Nada de contexto global de dados.
- **Escrever:** use as funções de `useSheetActions(id)`: `patchCharacter`, `create/update/remove(collection, …)`, `setSlot`, `setUse`, `resetResource`, `replacePrepared`, `rest`, `uploadPhoto`. Elas são otimistas, fazem rollback, mostram toast de erro e ressincronizam. **Nunca rejeitam:** resolvem com a resposta (ou `true` se não houver corpo) no sucesso e com `undefined` na falha. Feche modal, limpe formulário ou mostre "sucesso" só depois de conferir: `if (await actions.x(...))`.
- **Valores derivados** (CA, saves, perícias, slots…): use sempre `sheet` (de `computeSheet`). Nunca recalcule no componente.
- **Campos** (`src/ui/fields.jsx`) salvam no blur ou Enter e cancelam com Esc. Não use save por tecla. `null`/`''` contam como o mesmo vazio (sem PATCH à toa) e o campo mostra o valor normalizado (ex.: limitado por `max`). Inputs soltos (ex.: data) também salvam no blur, comparando com o valor atual.
- **Exclusões** usam `ConfirmButton` (dois cliques).
- **Modais** usam `src/ui/Modal`: Esc fecha e o foco fica preso. Clicar fora só fecha com `closeOnBackdrop`; não use isso em modal com edição não salva. Para o foco inicial use `data-autofocus`, não `autoFocus`.
- **i18n:** `const { t, signed, className, skillName, spellName, distance, weight } = useLang()`; `t('secao.chave', { n })`. Toda chave existe em pt **e** en (teste `tests/i18n`). Os dados guardam **ids estáveis** (`cleric`, `lg`, `medium`); só a UI traduz. As escolas de magia são exceção: o id é o nome em pt ('Conjuração'…).
- **Unidades:** os dados ficam em pés e libras. Em pt a UI mostra metros (×0,3) e kg (÷2).
- **Estilo:** use tokens de `src/styles/tokens.css` via `var(--…)` ou os utilitários do `@theme` em `index.css` (`bg-app`, `text-gold`, `border-wood`, `text-muted`, `bg-sunken`…). Classes de tema: `.panel`, `.section-title`, `.field`, `.label`, `.divider-gold`, `.prose-grimoire`. **Não use cor hex em componente.**

## Regras D&D 3.5 (`shared/rules`)

- **Atributos:** mod = ⌊(valor−10)/2⌋, com valor = base+enh+misc+temp−dano−dreno.
- **BAB e saves base:** soma por classe (good = n, avg = ⌊3n/4⌋, poor = ⌊n/2⌋; save good = 2+⌊n/2⌋, poor = ⌊n/3⌋). Ataques iterativos de −5.
- **CA:** componentes manuais + itens equipados; Des limitada pelo menor `max_dex`. Toque e surpresa calculados. `ac_override` substitui só o total.
  - **Empilhamento** (regra oficial): bônus do mesmo tipo não se somam, vale o maior; esquiva e "outros" (sem tipo, + temporário) somam; penalidades sempre se aplicam.
  - **Mapeamento dos campos** (interpretação do Grimoire): em armadura, escudo e deflexão, o campo manual e cada item são fontes do mesmo tipo (vale o maior). Em natural, o campo manual é a armadura natural base (racial) e soma com o maior item (melhorias como amuleto e casca de árvore não somam entre si).
  - `sheet.ac.ignored` lista o que não entrou; o DefensePanel mostra um aviso.
- **Perícias:** graduação máxima n+3 (de classe) ou (n+3)/2. Penalidade de armadura (Natação ×2), sinergias incondicionais da tabela 4-5 (as situacionais, como Usar Cordas → Escalar, ficam fora), tamanho em Esconder-se, efeitos de talentos. Pontos ×4 no 1º nível; humano +1 por nível.
- **Conjuração** por classe, usando o nível **da própria classe** (+ avanço de prestígio):
  - tabelas PHB (`null` = sem acesso, `0` = só bônus); Clérigo/Druida usam `full`, o Mago usa `wizard` (tabela 3-18, máx. 4 por nível). O slot extra do especialista ainda é bônus manual (`spell_slots.bonus`);
  - magias bônus por atributo;
  - precisa de atributo ≥ 10+nível para conjurar o nível;
  - slot de domínio do clérigo;
  - meio nível de conjurador para paladino e ranger;
  - CD = 10 + nível + mod;
  - feiticeiro e bardo são espontâneos, com tabela de conhecidas;
  - classes de suplemento sem tabela têm slots manuais (`spell_slots.bonus`).
- **Recursos** (`RESOURCES`):
  - fúria 1+⌊n/4⌋;
  - música de bardo = n;
  - expulsar mortos-vivos 3+Car (+ talentos);
  - cura pelas mãos é reserva de Car×n;
  - destruir o mal 1+⌊n/5⌋;
  - forma selvagem pela tabela;
  - ataque atordoante = n;
  - fórmulas de suplemento estão marcadas `verified: false`.
- **Carga:** tabela 9-1 × tamanho; moedas contam (50 = 1 lb).
- **Talentos:** efeitos em `featsData.json` são agregados sem empilhar repetidos (exceto `REPEATABLE_FEATS`). `bonus_attack`/`bonus_damage` só entram com alvo `melee` ou `ranged` (no total geral e em cada arma do tipo); outros alvos (`ranged_close`, `thrown`, `aoo`) viram nota. `bonus_grapple` soma no agarrar (Agarrar Aprimorado +4). Alvos situacionais (com parênteses) viram nota, assim como `bonus_resource` sem fórmula em `RESOURCES` (ex.: Sopro Dracônico). Teste garante que todo `bonus_skill` está mapeado em `SKILL_FROM_PT` ou é situacional.
- **Convocar Monstro N:** criaturas de `ref_criaturas` com `nivel_sm ≤ N`. PV = média dos DV + Con. Convocação Aprimorada: +4 For/Con.
  - Lista e níveis conferidos com a tabela de Summon Monster do SRD 3.5 (`tests/rules/content.test.js`), incluindo DV, CA, atributos e ataques. Elemental Pequeno = III, Médio = V, Grande = VI, Enorme = VII, Maior = VIII, Ancião = IX.
  - Criaturas fora da tabela (xorn, deva, glabrezu, treant) ficam com `nivel_sm: 0` (dados mantidos, fora da lista).
  - O SummonModal avisa quando os dados não foram conferidos.

## Roll20

- **Ficha de referência:** `Roll20/roll20-character-sheets`, pasta `D&D_3-5` (e `D&D_3-5-pt-br`, que usa os mesmos nomes de atributo). O mapeamento fica em `server/roll20/map.js`.
- **Formato** (VTTES), conferido com um export real (`tests/roll20/fixtures/vttes-alescarion.json`, ficha "D&D3.5 v2.8", sem dados pessoais): `{ schema_version: 3, type: 'character', character: { name, bio, avatar, …, attribs: [{ name, current, max, id }], abilities } }`. O export gera esse formato; o import aceita também o plano `{ name, attribs }`.
  - A `bio` vem codificada com `escape()`: o import decodifica (`decodeBio`) e o export codifica.
  - O arquivo pode ter atributos repetidos com o mesmo nome (vale o último).
- **Seções repetidas:** `repeating_<seção>_<id de 20 chars>_<campo>` (o id pode conter `_` e `-`).
- **Magias:** `repeating_spells<nível><aba>` com campos `spellname<nível><aba>`. A aba é **1 = divina, 2 = arcana** (`SPELL_TAB`), não a ordem da classe. No import, cada aba vai para a 1ª classe conjuradora daquela lista (`caster.list`). As abas 3–5 e o nível 10 ficam em `roll20_extra`. O export escreve também `<arcane|divine>spells<N>`, `…spelldc<N>` e `…casterlevel`.
- **Armas:** a ficha tem armas fixas (`weapon1…10<campo>`) e a seção `repeating_weapons`; o import lê as duas e o export usa a seção repetida. Foco e especialização viram `misc` e `damage_misc` (o relatório avisa). Sem dado de dano, `statdamage` com formato de dado (ex.: "1d8") é usado como dano.
- **Unidades:** com `lengthunit`/`weightunit` métricos, deslocamento, alcance e pesos estão na unidade mostrada. O import divide por `lengthscale`/`weightscale` (guardados em `roll20_extra`, sem marcar como lidos) e o export multiplica de volta.
- **Rótulos livres:** tendência em pt ou en ("Neutro Bom", "Leal e Bom", "True Neutral") e classe sem acento, em qualquer caixa ou com apelido (`CLASS_ALIASES`: "Mage" → wizard).
- **Talentos:** texto livre. Com linhas `-----`, cada bloco é um talento (1ª linha = nome, resto = `description`); sem elas, um por linha. Casa com `ref_talentos`/`ref_falhas` pelo nome pt ou en no começo da linha (o maior nome vale). O relatório lista os que não casaram. O export escreve no mesmo formato de blocos quando há descrição.
- **Bônus de CA "outros"** (`abilityacN`): a ficha não informa o tipo (atributo, magia temporária…). Ficam em `roll20_extra` e o relatório avisa para ajustar à mão.
- **Import sem perda silenciosa** (`importRoll20`): cada atributo termina em uma de quatro contas, devolvidas em `_import.counts` e mostradas no ExchangeModal:
  - **lido**: o import consultou (`cur()`), ou é um campo consumido de uma linha repetida importada (`consumeRow`);
  - **recalculado**: `isDerivedAttr` em `map.js` (saves base, slots/CD/nível de conjurador, DV, totais e modificadores de atributo, nível total, pontos de perícia e totais de peso/custo). O export reescreve atributos, modificadores e nível; o resto a ficha recalcula;
  - **vazio ou fórmula** da ficha;
  - **guardado** em `roll20_extra`, inclusive seções repetidas desconhecidas, campos desconhecidos de seções conhecidas e linhas sem nome. Volta com o nome original (e o id da linha) no export.
  - Ao ler um atributo novo no import, use `cur()`/`consumeRow`, senão ele também vai para `roll20_extra`.
- **Não exportado ainda:** overrides, recursos de classe, invocações, diário e foto. Dano e dreno de atributo saem somados em `-temp`.
- **Pendente:** o import foi validado com um export real; o caminho inverso (importar no Roll20 um arquivo gerado pelo Grimoire) **não foi testado**.

## Design system

`grimoire-design-system` (repo local `C:\projects\grimoire-design-system`, ver `DESIGN_SYSTEM_CONTEXT.md`) **ainda não é importado**. O pacote continua em `dependencies` do `package.json`, mas nenhum arquivo o importa: a remoção ou a adoção está pendente de decisão. Os componentes base vivem em `src/ui` usando os mesmos nomes de token, para migrar depois. O pacote tem problemas conhecidos (ver learnings).

## Convenções

- Sem TypeScript; simples, sem over-engineering.
- Código e comentários em português. Ids de dados e colunas novas em inglês.
- Regra de jogo nova vai para `shared/rules` com teste em `tests/rules` (caso do PHB citado).
- Mudança de API vem acompanhada de teste em `tests/api`.
