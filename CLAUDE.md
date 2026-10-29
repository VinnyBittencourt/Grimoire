# Grimoire — Contexto do Projeto

App local, de uso próprio, de ficha de personagem **D&D 3.5**. Visual medieval, com campos e cálculos alinhados à ficha **"D&D_3-5" do Roll20** (e import/export nesse formato). Uso no desktop.

## Aprendizados (leitura obrigatória)

@learnings.md

**Regras de documentação (obrigatórias em toda tarefa):**

1. **CLAUDE.md sempre atualizado:** toda alteração no projeto (arquitetura, pasta, arquivo importante, script, dependência, endpoint, tabela/coluna, regra de jogo, convenção) deve atualizar este CLAUDE.md **na mesma tarefa**, antes de encerrá-la. Ele precisa sempre descrever o estado atual do código.
2. **learnings.md:** sempre que descobrir algo não óbvio, ou quando algo não funcionar de primeira (erro, abordagem errada, comando que falhou, suposição incorreta), adicione uma entrada em `learnings.md` no formato descrito no próprio arquivo.

Histórico da reescrita v2 e decisões: `docs/PLANO_V2.md`.

## Stack

- **Front:** React 19 + Vite 8 + Tailwind CSS 4, React Router 7, **TanStack Query 5** (estado do servidor), TipTap 3 (notas), DOMPurify
- **API:** Express 5 + **better-sqlite3** (`data/grimoire.db`), validação com **zod 4**
- **Regras:** motor puro em `shared/rules/`, usado no front e nos testes
- **Testes:** Vitest + supertest
- JavaScript puro (sem TypeScript)

## Rodar

```bash
npm run dev:all   # Vite (3003) + API (3005). Alias: npm start
npm run dev       # só Vite → http://localhost:3003
npm run dev:api   # só API  → http://127.0.0.1:3005
npm test          # Vitest (regras, API, migração, Roll20, i18n, renderização)
npm run lint
npm run build
```

- O Vite faz proxy de `/api` e `/photos` para a API.
- **Variáveis de ambiente:** `GRIMOIRE_DATA_DIR` (pasta de dados, padrão `data/`), `GRIMOIRE_API_PORT` e `GRIMOIRE_WEB_PORT`. Servem para rodar uma 2ª instância de teste sobre uma cópia dos dados.
- A API escuta **só em 127.0.0.1**, porque não tem autenticação.
- No boot, a API aplica as migrações pendentes (com backup antes), atualiza os dados de referência se a versão mudou e faz um backup. Não existe mais `npm run seed` nem `npm run migrate`.

## Estrutura

```
server/
  index.js            ← boot: abre o banco, backup no boot e a cada 30 min (se houve escrita), listen 127.0.0.1
  app.js              ← createApp({ db, dataDir, backupper }) — todas as rotas + tratamento de erro
  db.js               ← openDatabase(dataDir | null=memória): pragmas, migrate, seed
  migrate.js          ← executor de migrações (PRAGMA user_version)
  migrations/         ← 001_schema_v2.js (schema), 002_from_v1.js (converte dados v1)
  schemas.js          ← zod: characterFields, COLLECTIONS (whitelist de colunas por coleção)
  repo.js             ← acesso a dados (getSheet, getJournal, CRUD genérico, rest, slots, usos)
  defaults.js         ← ensureSkillRows, syncResources
  exchange.js         ← export/import formato Grimoire (JSON v2, com fotos embutidas)
  roll20/             ← map.js (nomes de atributo) + index.js (exportRoll20/importRoll20, formato VTTES)
  seed.js             ← popula ref_* a partir de src/db (SEED_VERSION)
  backup.js, photos.js
shared/
  constants/          ← abilities, sizes, classes (mecânica das classes), skills (ids = Roll20), spellTables, equipment
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
  db/                 ← referenceData.js (raças, classes, criaturas) + featsData.json (fonte do seed)
  assets/icons/       ← equipmentIcons, escolaIcons, escolaColors
  styles/tokens.css   ← tokens (mesmos nomes do grimoire-design-system) · index.css ← Tailwind + tema
tests/                ← rules/, api/, roll20/, migration/ (com fixture v1Schema.js), i18n/, ui/ (render smoke)
data/                 ← FORA do git: grimoire.db, photos/, backups/ (pre-v2.db = snapshot antes da v2)
docs/                 ← PLANO_V2.md; livros/ (PDFs PHB/MM, fora do git)
```

## Banco (SQLite, schema v2)

- **IDs** gerados no servidor (`AUTOINCREMENT`). Todas as tabelas filhas têm `character_id … ON DELETE CASCADE`, índice e `position`.
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
  - `attacks`, `items` (`location` = `backpack` ou slot de `EQUIPMENT_SLOTS`; `ac_type/ac_bonus/max_dex/acp/spell_failure`), `feats` (`ref_id` → `ref_talentos`/`ref_falhas`, `kind` feat|flaw).
  - `class_resources` (`key` = fórmula em `shared/rules/resources.js`, ou null = recurso personalizado com `total_override`) + `resource_uses` (idx, used, note).
  - `spells` (grimório/conhecidas por `class_row_id`), `spells_prepared` (uma linha por slot preparado, `used`, `is_domain`), `spell_slots` (por classe e nível: `bonus` manual e `used` para espontâneos).
  - `summons` (`data` = JSON do bloco de estatísticas).
  - Diário: `players`, `npcs`, `places`, `quests` + `quest_npcs`, `notes` (HTML, `session_date` ISO).
- **Referência** (seed automático): `ref_talentos`, `ref_falhas`, `ref_racas`, `ref_classes` (ids em inglês), `ref_criaturas`, `meta`.
- **Coluna/tabela nova:** crie uma migração nova `server/migrations/NNN_nome.js` com `export function up(db, ctx)`. Atualize também `server/schemas.js` (whitelist), `exchange.js` se for exportável, e este arquivo.

## API (`server/app.js`)

| Rota | O que faz |
|---|---|
| `GET/POST /api/characters` | lista (resumo) / cria (com `classes: [...]`) |
| `GET/PATCH/DELETE /api/characters/:id` | ficha completa / campos do personagem / exclui (cascade + foto) |
| `GET /api/characters/:id/journal` | diário (background, players, npcs, places, quests c/ `npc_ids`, notes) |
| `POST/PATCH/DELETE /api/characters/:id/:collection/:rowId` | CRUD genérico: classes, skills, attacks, items, feats, resources, spells, prepared, summons, players, npcs, places, quests, notes |
| `PUT .../prepared` | substitui a preparação de uma classe `{ class_row_id, slots }` |
| `PUT .../spell-slots/:classRowId/:level` | `{ bonus?, used? }` |
| `PUT .../resources/:id/uses/:idx` · `POST .../resources/:id/reset` | fichas de uso |
| `POST .../rest` | Novo Dia `{ heal }`: restaura magias/slots/recursos; cura natural = nível |
| `PUT/DELETE .../photo` · `PUT .../npcs/:id/photo` | upload binário (image/*) → `GET /photos/:arquivo` |
| `GET .../export` · `POST /api/import` | formato Grimoire (remapeia todos os ids) |
| `GET .../export/roll20` · `POST /api/import/roll20` | formato VTTES (Roll20) |
| `GET /api/ref/:table` · `POST /api/backup` | referência (JSON já parseado) / backup manual |

Erros sempre vêm como `{ error: { code, message, fields? } }`. Toda escrita passa por zod com `.strict()`: chave desconhecida dá 400.

## Front-end

- **Estado:** a ficha fica em `['character', id]` e o diário em `['journal', id]` (TanStack Query). Nada de contexto global de dados.
- **Escrever:** use as funções de `useSheetActions(id)`: `patchCharacter`, `create/update/remove(collection, …)`, `setSlot`, `setUse`, `resetResource`, `replacePrepared`, `rest`, `uploadPhoto`. Elas são otimistas, fazem rollback, mostram toast de erro e ressincronizam.
- **Valores derivados** (CA, saves, perícias, slots…): use sempre `sheet` (de `computeSheet`). Nunca recalcule no componente.
- **Campos** (`src/ui/fields.jsx`) salvam no blur ou Enter e cancelam com Esc. Não use save por tecla.
- **Exclusões** usam `ConfirmButton` (dois cliques).
- **Modais** usam `src/ui/Modal`: Esc fecha e o foco fica preso. Clicar fora só fecha com `closeOnBackdrop`; não use isso em modal com edição não salva.
- **i18n:** `const { t, signed, className, skillName, spellName, distance, weight } = useLang()`; `t('secao.chave', { n })`. Toda chave existe em pt **e** en (teste `tests/i18n`). Os dados guardam **ids estáveis** (`cleric`, `lg`, `medium`); só a UI traduz. As escolas de magia são exceção: o id é o nome em pt ('Conjuração'…).
- **Unidades:** os dados ficam em pés e libras. Em pt a UI mostra metros (×0,3) e kg (÷2).
- **Estilo:** use tokens de `src/styles/tokens.css` via `var(--…)` ou os utilitários do `@theme` em `index.css` (`bg-app`, `text-gold`, `border-wood`, `text-muted`, `bg-sunken`…). Classes de tema: `.panel`, `.section-title`, `.field`, `.label`, `.divider-gold`, `.prose-grimoire`. **Não use cor hex em componente.**

## Regras D&D 3.5 (`shared/rules`)

- **Atributos:** mod = ⌊(valor−10)/2⌋, com valor = base+enh+misc+temp−dano−dreno.
- **BAB e saves base:** soma por classe (good = n, avg = ⌊3n/4⌋, poor = ⌊n/2⌋; save good = 2+⌊n/2⌋, poor = ⌊n/3⌋). Ataques iterativos de −5.
- **CA:** componentes manuais + itens equipados; Des limitada pelo menor `max_dex`. Toque e surpresa calculados. `ac_override` substitui só o total.
- **Perícias:** graduação máxima n+3 (de classe) ou (n+3)/2. Penalidade de armadura (Natação ×2), sinergias incondicionais, tamanho em Esconder-se, efeitos de talentos. Pontos ×4 no 1º nível; humano +1 por nível.
- **Conjuração** por classe, usando o nível **da própria classe** (+ avanço de prestígio):
  - tabelas PHB (`null` = sem acesso, `0` = só bônus);
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
- **Talentos:** efeitos em `featsData.json` são agregados sem empilhar repetidos (exceto `REPEATABLE_FEATS`). Alvos situacionais viram nota.
- **Convocar Monstro N:** criaturas de `ref_criaturas` com `nivel_sm ≤ N`. PV = média dos DV + Con. Convocação Aprimorada: +4 For/Con.

## Roll20

- **Ficha de referência:** `Roll20/roll20-character-sheets`, pasta `D&D_3-5` (e `D&D_3-5-pt-br`, que usa os mesmos nomes de atributo). O mapeamento fica em `server/roll20/map.js`.
- **Formato** (VTTES): `{ schema_version, name, bio, attribs: [{ name, current, max }] }`.
- **Seções repetidas:** `repeating_<seção>_<id de 20 chars>_<campo>`.
- **Magias:** `repeating_spells<nível><1|2>` com campos `spellname<nível><1|2>`.
- **Pendente:** validar o import/export com um export real do VTTES (ver learnings).

## Design system

`grimoire-design-system` (repo local `C:\projects\grimoire-design-system`, ver `DESIGN_SYSTEM_CONTEXT.md`) **ainda não é importado**. Os componentes base vivem em `src/ui` usando os mesmos nomes de token, para migrar depois. O pacote tem problemas conhecidos (ver learnings).

## Convenções

- Sem TypeScript; simples, sem over-engineering.
- Código e comentários em português. Ids de dados e colunas novas em inglês.
- Regra de jogo nova vai para `shared/rules` com teste em `tests/rules` (caso do PHB citado).
- Mudança de API vem acompanhada de teste em `tests/api`.
