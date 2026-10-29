# Plano: Grimoire v2 — reescrita (arquitetura, dados, ficha Roll20 3.5)

## Context
App local, de uso próprio, para D&D 3.5. O usuário pediu uma **reescrita grande** focada em arquitetura e armazenamento, com visual medieval, **paridade de campos e cálculos com a ficha "D&D_3-5" do Roll20** e **import/export Roll20**. Uso só no desktop. Persistência decidida: **SQLite com saves granulares**.

Três revisões (inventário de funcionalidades, arquitetura, código/regras) mostraram que o app atual perde dados e tem regras erradas:
- **Saves estão falhando hoje.**
  - O seletor de talentos envia `feat_id`, mas a coluna não existe. O INSERT falha e todos os saves seguintes falham também.
  - `CharacterFormPage.jsx:101` usa `CAMPOS_ATRIBUTOS` (indefinido), então criar ou editar personagem nunca salva.
  - `mochila.icone/info` não existem no schema.
- **`POST /api/data` apaga e reinsere o banco inteiro a cada clique**, com a foto de 5 MB junto.
  - Cerca de 20 callbacks partem de um `db` obsoleto, então cliques rápidos sobrescrevem um ao outro.
  - Não há tratamento de erro nem rollback.
  - Os IDs são gerados no cliente com max+1.
- **Banco no git com WAL de 15 MB sem checkpoint e sem nenhum backup.**
  - O servidor escuta em todas as interfaces, sem auth, e monta SQL com nomes vindos do corpo da requisição.
  - O import não remapeia `magia_id`, `local_id` e `npc_ids`.
- **Dar F5 fora da IntroPage quebra a navegação**, e salvar `/editar` nesse estado pode sobrescrever o personagem com os valores padrão.
- **Regras D&D 3.5 erradas:**
  - multiclasse usa o nível total para os slots;
  - tabelas de paladino, ranger e bardo erradas;
  - sem slot de domínio;
  - feiticeiro e bardo tratados como quem prepara magias;
  - o efeito de Arcane Disciple está errado;
  - `RECURSOS_PADRAO` errado (fúria, expulsar = 3+Car, cura pelas mãos como reserva, forma selvagem...);
  - convocações nos níveis errados;
  - deslocamento em pés exibido como metros.
- **Faltam na ficha:** saves, BAB, agarrar, iniciativa, perícias, ataques, CA toque/surpresa, PV atual/máx/temp/não letal, XP, idiomas, carga e CD de magia.
- **UX:**
  - cerca de 415 estilos inline e mais de 600 cores hex fixas;
  - o design system não é usado;
  - modais sem Esc nem foco;
  - exclusões sem confirmação;
  - layout quebra em 1366×768;
  - notas renderizadas com `innerHTML`;
  - ESLint com 38 problemas.

Resultado esperado: uma base limpa e testada, na qual cada número da ficha é calculado por um motor de regras puro (com override para homebrew), os dados são salvos de forma granular e segura, e a ficha conversa com o Roll20.

---

## Fase 0: regras de documentação e segurança dos dados (primeiro de tudo)
1. Atualizar a regra no topo do `CLAUDE.md`: **"Toda alteração no projeto (arquitetura, pasta, script, endpoint, tabela, convenção) deve atualizar o CLAUDE.md na mesma tarefa; descobertas e falhas vão para learnings.md."** Salvar também como memória `feedback`.
2. Fazer o backup imediato: `PRAGMA wal_checkpoint(TRUNCATE)` e copiar o arquivo para `data/backups/pre-v2.db`.
3. Tirar `data/` do git (`git rm --cached data/grimoire.db*` + `.gitignore`). Os PDFs de `src/assets` (31 MB) vão para `docs/livros/`, também ignorados no git.

## Fase 1: nova estrutura
```
server/   index.js (escuta só em 127.0.0.1:3005), db.js, migrate.js, migrations/NNN_*.sql,
          routes/*.js, repos/*.js, roll20/{import,export,map}.js, backup.js
shared/   rules/ (puro: abilities, hp, ac, saves, bab, grapple, initiative, skills,
          spellcasting, resources, encumbrance, effects), schemas/ (zod), constants/ (ids estáveis)
src/      api/ (cliente fetch), queries/ (TanStack Query), features/<seção>/, ui/ (componentes base),
          pages/, i18n/ (labels pt/en, só aqui)
data/     grimoire.db, photos/<uuid>.webp, backups/        (gitignored)
tests/    rules/, api/, roll20/ (Vitest + supertest)
```
Dependências:
- **Novas:** `@tanstack/react-query`, `zod`, `vitest`, `supertest`, `@tiptap/react` + `starter-kit`, `dompurify`.
- **Mudam de lugar:** `concurrently` e `tailwindcss` vão para devDependencies.
- **Removida:** `xlsx`, depois que o script de migração legado for apagado.

## Fase 2: banco (SQLite v2)
- **Migrações:** `PRAGMA user_version` + arquivos `.sql` ordenados, cada um em transação no boot, com backup automático antes de qualquer migração pendente. Sem `ALTER` em try/catch.
- **Integridade:** IDs `INTEGER PRIMARY KEY AUTOINCREMENT` gerados no servidor, `FOREIGN KEY ... ON DELETE CASCADE` e índice em todo `character_id`.
- **Guardar só valores base e componentes.** Totais são calculados em `shared/rules`, com coluna `*_override` onde houver homebrew.

Tabelas (alinhadas aos conceitos da ficha Roll20):

| Tabela | Conteúdo principal (≈ atributo Roll20) |
|---|---|
| `characters` | nome, race_id, alignment, size, deity, gender, age, height, weight, languages, speed_ft, photo_path, xp, cp/sp/gp/pp, hp_max, hp_current, hp_temp, nonlethal, init_misc, ac_override... |
| `character_classes` | class_id, level, hd_rolls, caster_attr, domain_ids (substitui o JSON `multiclasses`) |
| `abilities` | key (str…cha), base, enhance, misc, temp, damage, drain (`str-base/-temp/-misc`) |
| `ac_components` | armor, shield, natural, deflection, dodge, misc, temp (toque/surpresa calculados) |
| `saves` | key, magic, misc, temp (`fortitudemagicmod/miscmod/tempmod`) |
| `combat` | bab_override, grapple_misc, sr, dr |
| `skills` | skill_id, ranks, class_skill, misc, custom_name (`<skill>ranks/classskill/miscmod`, `repeating_skills`) |
| `attacks` | name, type, ability, enhance, misc, dice, crit_range, crit_mult, range, damage_type, ammo (`repeating_weapons`) |
| `items` | location (`backpack` ou slot), icon, name, qty, weight, notes, ac_bonus, max_dex, acp, spell_failure (`repeating_equipment` + slots; une equipamentos e mochila) |
| `feats` | ref_id NULL, name, description |
| `class_resources` / `resource_uses` | recurso + usos (idx, used, note); substitui `usos_json` |
| `spells_known` / `spell_slot_bonus` / `spells_prepared` | magia por classe e nível; bônus manual; preparada com FK `spell_id` + `used` (sem cópia de campos) |
| `summons` | ref_creature_id ou campos custom, hp_current, hp_max, spell_level |
| `notes`, `npcs`, `places`, `quests`, `quest_npcs`, `players`, `backgrounds` | diário (`quest_npcs` substitui a string `npc_ids`) |
| `ref_*` | ids TEXT estáveis; os nomes traduzidos ficam só no i18n; nova `ref_skills` |

**Migração `001_v2`:** uma etapa em Node dentro de uma única transação. Ela mantém os IDs existentes e converte:
- `multiclasses` → `character_classes`, com nomes PT mapeados para ids;
- `for…car` → `abilities.base`;
- `pv` → `hp_max`/`hp_current`, e `ca` → `ac_override`, para nada mudar silenciosamente;
- `usos_json` → `resource_uses`, `npc_ids` → `quest_npcs`, `criatura_invocada_json` → `summons`;
- equipamentos + mochila → `items`;
- `foto_base64` → `data/photos/*.webp`.

No fim roda `PRAGMA foreign_key_check`, compara a contagem de linhas e faz `VACUUM`.

## Fase 3: API REST granular (`server/routes`)
- `GET /api/characters` · `GET /api/characters/:id` (ficha completa) · `POST` · `PATCH /:id` · `DELETE /:id` (cascade)
- `PUT /api/characters/:id/abilities/:key`, `.../saves/:key`, `.../ac`
- `POST|PATCH|DELETE /api/characters/:id/{classes,skills,attacks,items,feats,resources,spells,notes,npcs,places,quests,players}/:rowId`
- Ações atômicas: `POST .../spells/prepared/:id/cast`, `POST .../rest` (novo dia: restaura usos de magias e recursos, cura PV opcional), `POST .../summons`, `PATCH .../hp` (dano/cura)
- Fotos: `PUT .../photo` (o cliente redimensiona para cerca de 600px webp via canvas) · `GET /photos/:file`
- Troca de dados: `GET .../export` e `POST /api/import` (JSON Grimoire v2 versionado, com remapeamento completo de IDs) · `GET .../export/roll20` · `POST /api/import/roll20`
- `GET /api/ref/:table` · `POST /api/backup`
- Todas as escritas são validadas com zod (whitelist de colunas, nunca chaves vindas do corpo da requisição) e respondem com a linha atualizada. Erros seguem o formato `{error:{code,message,fields}}`. Limite de corpo de 2 MB.
- **Backups:** no boot e a cada 30 min se houver escrita (`db.backup()` → `data/backups/grimoire-YYYYMMDD-HHmm.db`, mantendo os últimos 20); checkpoint do WAL no shutdown.

## Fase 4: motor de regras (`shared/rules`, puro e testado)
- **Atributos:** mod = ⌊(total−10)/2⌋, com total = base+enhance+misc+temp−damage.
- **BAB e saves base:** somados por classe a partir da progressão da classe (`ref_classes.bab`/`saves`: good/avg/poor e good/poor). Iteração de BAB: +X/+X−5...
- **CA:** total, toque e surpresa a partir dos componentes + Des (limitada pelo `max_dex` dos itens equipados) + tamanho. **Agarrar** = BAB + For + tamanho especial. **Iniciativa** = Des + misc + talentos.
- **Perícias:** graduações (máximo nível+3, ou (nível+3)/2 se não for de classe), atributo-chave, penalidade de armadura, sinergias básicas.
- **Conjuração por classe**, usando o nível da própria classe e não o total:
  - tabelas PHB corrigidas, com `null` = sem acesso e `0` = só bônus;
  - bônus por atributo, e atributo ≥ 10+nível da magia para conjurar;
  - slot de domínio do clérigo;
  - conhecidas × por dia para feiticeiro e bardo;
  - nível de conjurador = metade para paladino e ranger;
  - CD = 10 + nível + mod.
- **Recursos de classe:** fórmulas corrigidas e revisadas contra o PHB (fúria `1+⌊n/4⌋`, expulsar `3+Car`, cura pelas mãos como reserva `Car×nível`, forma selvagem, música de bardo = nível...).
- **Carga:** leve/média/pesada pela For e pelo tamanho; o peso das moedas também conta.
- **Efeitos de talentos:** agregados com regra de empilhamento e flag "pode repetir". Remover o efeito errado de Arcane Disciple em `featsData.json`.
- **Convocações:** listas do PHB por nível de Convocar Monstro, puxadas de `ref_criaturas`.
- **Testes Vitest:** casos de referência do PHB (ex.: Clérigo 5 com Sab 16, Paladino 4/8/14, Bardo 16, Bárbaro 4, Clérigo 3/Guerreiro 2).

## Fase 5: front-end
- **Estado:** TanStack Query (uma query `['character', id]` + uma mutation por parte, com atualização otimista e rollback em `onError`, e indicador global via `useIsMutating`). Isso **remove o AppContext**; o `LangContext` fica. Ao dar F5 em qualquer rota a ficha carrega sozinha, com telas de loading e de erro. Campos de texto salvam no blur ou com debounce de 500 ms.
- **UI base (`src/ui`):**
  - componentes Panel, Tabs, StatBox, Field, NumberField, Modal (Esc + focus trap + aria), ConfirmDialog e Toast com "Desfazer";
  - tokens CSS do `grimoire-design-system` (cor, fonte, espaço), sem cores hex nos componentes;
  - usar os componentes do DS onde já existirem (Button, Card, Input, Modal, Panel) e criar novos no DS quando forem genéricos.
- **Layout desktop:**
  - **barra lateral fixa:** retrato, nome, classes, PV (barra + dano/cura), CA/toque/surpresa, iniciativa, saves, BAB/agarrar e botão "Novo Dia";
  - **abas espelhando a ficha Roll20:**
    - **Principal:** atributos base/temp/mod, CA detalhada, saves detalhados, ataques;
    - **Perícias;**
    - **Talentos & Habilidades:** talentos, recursos de classe, traços raciais;
    - **Magias:** por classe, preparação, conhecidas, slots, CDs, e conjurar com 1 clique;
    - **Inventário:** slots equipados com bônus, mochila, moedas, carga;
    - **Invocações;**
    - **Diário:** background, jogadores, NPCs, locais, quests, notas.
  - Rolagem por painel; funciona de 1366×768 a 1920×1080.
- **Notas:** TipTap (substitui `execCommand`) com Ctrl+B/I/U/S e conteúdo sanitizado com DOMPurify. A data da sessão é preservada e a ordenação é da mais recente para a mais antiga.
- **Formulário de personagem:** wizard curto (identidade → classes → atributos → revisão) usando `ref_racas`/`ref_classes`. PV e CA sugeridos pelo motor de regras, com override. Os recursos de classe são sincronizados no servidor.
- **i18n:** labels só em `src/i18n`; os dados guardam ids estáveis (ex.: `classe: 'cleric'`, `quest.tipo: 'main'`). Remover os mapas `*_EN` espalhados em `dnd35Tables.js`.
- **Comportamentos que precisam ser mantidos:**
  - pt/en com fallback;
  - fichas de uso por recurso, com nota e bônus de talento;
  - bônus manual de slots;
  - magias customizadas;
  - "Convocar Monstro" abre o seletor;
  - HP da criatura invocada;
  - busca de talentos por pt/en + categoria + livro, e talentos customizados;
  - moedas editáveis inline;
  - NPCs com foto;
  - quests ligadas a locais e NPCs;
  - exclusão em cascata;
  - confirmação em 2 cliques do Novo Dia, que agora restaura os usos em vez de apagar as magias.

## Fase 6: interoperabilidade com o Roll20 (`server/roll20`)
- **`map.js`:** tabela de mapeamento declarativa campo Grimoire ↔ atributo Roll20, baseada em `D&D_3-5/charsheet_3-5.html` (705 dos 817 atributos da versão pt-br são os mesmos).
  - Atributos simples: `str-base`, `str-temp`, `hitpoints`/`hitpoints_max`, `nonlethaldamage`, `fortitudebase`/`fortitudemagicmod`/`fortitudemiscmod`, `bab`, `grapplemiscmod`, `initmiscmod`, `<skill>ranks`/`<skill>classskill`/`<skill>miscmod`, `acnaturalarmor`, `armorclassdeflectionmod`, `character_name`, `race`, `class1`…`class10`/`level1…`, `alignment`, `deity`, `languages`...
  - Seções repetidas: `repeating_weapons_<rowid>_weaponname/weaponenh/weapondicenumber/weapondicetype/weaponcritmin/weaponcritmult/weaponrange`, `repeating_equipment_<rowid>_equipmentname/quantity/weight/notes`, `repeating_skills_<rowid>_otherskill*`, `repeating_spells<nível><classe>_<rowid>_spellname<nível><classe>/spellschool…/spellprep…/spellused…`.
- **Export:** JSON de personagem no formato usado pelas ferramentas de import/export do Roll20 (VTTES: `{schema_version, name, bio, attribs:[{name,current,max}], abilities:[]}`), com row ids de 20 caracteres no estilo Roll20. Também gerar uma visão "copiar para o Roll20" com a lista campo → valor.
- **Import:** o mesmo formato. Atributos desconhecidos ficam guardados em `characters.roll20_extra` (JSON) para o round-trip não perder dados.
- **Validar com um export real:** o usuário exporta um personagem do Roll20 (VTTES) para `tests/roll20/fixtures/`. Teste de round-trip: import → export → atributos equivalentes.

## Fase 7: limpeza e documentação
- Apagar `AppContext.jsx`, `excelService.js`, `scripts/migrate-excel-to-sqlite.js`, `src/db/schema.js`, as listas duplicadas em `dnd35Tables.js` e a dependência `xlsx`.
- `npm run lint` sem erros; `npm test` verde.
- Reescrever o `CLAUDE.md` (estrutura, schema, API, regras, convenções) e registrar no `learnings.md` tudo o que deu errado durante a reescrita.

---

## Arquivos críticos
- **Reescritos ou substituídos:** `server.js` → `server/`; `src/db/schema.js` → `server/migrations/`; `src/context/AppContext.jsx` → `src/queries/`; `src/services/dnd35Tables.js` → `shared/rules/` + `shared/constants/`; todos os `src/components/**` → `src/features/**` + `src/ui/`.
- **Reaproveitados:**
  - `getBonusMagias` (correto) e o formato de `SPELL_SLOTS` (corrigido);
  - `formatarEfeito` (`dnd35Feats.js`);
  - os dados de `featsData.json`/`referenceData.js` e `scripts/seed-reference.js` (agora apontando para `server/db.js`);
  - `LangContext.jsx` + `translations.js`;
  - os ícones em `src/assets/icons/`;
  - o tema medieval de `src/index.css` (convertido em tokens).

## Verificação
1. `npm test`: regras (casos do PHB), API (supertest em SQLite em memória: CRUD, cascade, validação, import com remapeamento de IDs), round-trip Roll20 com a fixture real.
2. Migração: rodar sobre uma cópia de `pre-v2.db`. Conferir a contagem de linhas por tabela, `foreign_key_check` vazio, a foto em `data/photos/` e o Bonar Telanophe com os mesmos atributos, PV, CA, magias, talentos, recursos e notas.
3. Manual (`npm run dev:all`, 1366×768 e 1920×1080):
   - criar personagem multiclasse;
   - F5 em `/personagem/:id`;
   - preparar e conjurar magias, depois Novo Dia;
   - usar recurso com nota;
   - convocar criatura e aplicar dano;
   - adicionar talento do seletor e conferir o bônus aplicado;
   - mochila/carga;
   - nota com formatação;
   - exportar para o Roll20 e importar de volta.
4. `npm run lint` sem erros; conferir que nenhum `POST` passa de alguns KB nas DevTools.
5. Conferir que `data/backups/` recebe arquivos e que `git status` não mostra mais o banco.

---

## Status (2026-10-28)

Fases 0–7 implementadas. Pendências:
- Validar import/export Roll20 com um arquivo real exportado pelo VTTES (`tests/roll20/fixtures/`).
- Corrigir o pacote grimoire-design-system (export do CSS, props, modal acessível) e então migrar `src/ui` para ele.
- Conferir no livro as fórmulas de recursos de suplementos (`verified: false`).
- Rodar a v2 sobre o banco real: parar os servidores v1 e iniciar `npm run dev:all` (a migração roda sozinha, com backup).
