# Learnings — Grimoire

Registro vivo de descobertas não óbvias e de coisas que não funcionaram de primeira.
Este arquivo é importado pelo `CLAUDE.md`, então é carregado em toda sessão.

**Como registrar:** adicione uma entrada no fim da seção certa (ou crie a seção), neste formato:

```
### AAAA-MM-DD — título curto
- **Contexto:** o que estava sendo feito
- **Problema/descoberta:** o que aconteceu ou o que não era óbvio
- **Regra/solução:** o que fazer daqui em diante
```

Seja breve. Se uma entrada ficar obsoleta, corrija ou remova.

---

## Dados e banco

### 2026-10-28 — Backup seguro do SQLite
- **Problema/descoberta:** o v1 versionava `data/grimoire.db*` no git, com um WAL de 15 MB sem checkpoint. Uma cópia feita pelo git podia ficar inconsistente.
- **Regra/solução:** `data/` está fora do git. Para copiar o banco com o servidor rodando, use `db.backup(dest)` do better-sqlite3 (o `server/backup.js` já faz isso), nunca `cp`. O snapshot anterior à reescrita está em `data/backups/pre-v2.db`.

### 2026-10-28 — Por que o v1 perdia dados
- **Problema/descoberta:**
  - `POST /api/data` apagava e reinseria o banco inteiro a cada clique, inclusive a foto de 5 MB.
  - O INSERT era montado com as chaves da 1ª linha. A UI mandava colunas inexistentes (`talentos.feat_id`, `mochila.icone/info`), o INSERT falhava e todos os saves seguintes falhavam também.
- **Regra/solução:** no v2, as colunas aceitas são as dos schemas zod (`server/schemas.js`, com `.strict()`), nunca as chaves do corpo da requisição. As escritas são granulares por linha.

### 2026-10-28 — Banco real tinha colunas fora do schema.js
- **Problema/descoberta:** o banco v1 tinha `quests.descricao/status/recompensa` e `anotacoes.notas`, que não estavam em `src/db/schema.js`. As datas das notas estavam em dd/mm/aaaa.
- **Regra/solução:** migrações de dados leem as colunas dinamicamente (`SELECT *`) e testam com uma fixture que reproduz o banco real (`tests/migration`).

### 2026-10-28 — Nomes de tabela v1 colidem com os do v2
- **Problema/descoberta:** `players`, `npcs` e `quests` existem nos dois schemas.
- **Regra/solução:** a migração 001 renomeia as tabelas v1 para `v1_*` antes de criar o schema novo; a 002 converte e apaga as `v1_*`.

### 2026-10-28 — `foreign_keys` não muda dentro de transação
- **Problema/descoberta:** `PRAGMA foreign_keys` é ignorado dentro de transação.
- **Regra/solução:** o `migrate.js` desliga as FKs antes das transações das migrações, religa depois e roda `PRAGMA foreign_key_check` no fim.

### 2026-10-28 — Dynamic Priest e bônus de slot manual
- **Problema/descoberta:** o v1 só conhecia Sab para Clérigo. Para compensar o talento *Dynamic Priest* (conjura com Car), o usuário somava os bônus de Car à mão em `bonus_slots_json`.
- **Regra/solução:** no v2, o atributo de conjuração é configurável por classe (`character_classes.caster_ability`). A migração detecta o talento e desconta o bônus manual para não contar em dobro. Fique atento a outras "gambiarras" do usuário que viraram regra.

### 2026-10-28 — Unidades
- **Problema/descoberta:** o v1 guardava o deslocamento em metros, com um default `'30'` que na prática era pés. O "kg" da mochila era livre.
- **Regra/solução:** o v2 guarda **pés e libras**, como as regras e o Roll20, e converte só na UI (pt: m = pés × 0,3; kg = lb ÷ 2). Na migração, valor ≤ 18 era tratado como metros.

### 2026-10-28 — Colunas com palavras reservadas
- **Problema/descoberta:** em `ref_criaturas`, as colunas `"for"` e `"int"` exigem aspas; a inteligência se chama `int_val`. No v2, os atributos do personagem são `str_*`, `int_*`… (`int_base` não é palavra reservada).
- **Regra/solução:** em SQL dinâmico, sempre coloque aspas nos nomes de coluna.

## Regras D&D 3.5

### 2026-10-28 — Atributo mínimo para conjurar
- **Contexto:** testes do motor de regras.
- **Problema/descoberta:** escrevi casos de teste errados (Feiticeiro com Car 10, Clérigo com Sab 10) esperando magias de 1º nível. A regra é atributo ≥ 10 + nível da magia, e o motor estava certo.
- **Regra/solução:** ao criar casos de teste de conjuração, use atributo ≥ 11 para o 1º nível. Confira a conta do caso (base + bônus + domínio) antes de culpar o código.

### 2026-10-28 — Tabelas e recursos do v1 estavam errados
- **Problema/descoberta:**
  - Paladino, Ranger e Bardo tinham slots errados; o Clérigo não tinha slot de domínio; a multiclasse usava o nível total.
  - Expulsar Mortos-Vivos era fixo em 3 (o certo é 3 + Car); a Cura pelas Mãos era 1 uso (o certo é reserva de Car × nível).
  - Os elementais médios estavam em Convocar Monstro V (o certo é IV).
  - Arcane Disciple dava +1 slot por nível, o que está errado.
- **Regra/solução:** as tabelas ficam em `shared/constants/spellTables.js` (`null` = sem acesso, `0` = só bônus), cobertas por testes com casos do PHB. O efeito de Arcane Disciple em `featsData.json` foi corrigido (agora é só nota). Ao editar `featsData.json` ou `referenceData.js`, **incremente `SEED_VERSION`** em `server/seed.js`, ou o banco existente continua com os dados antigos.

## Infra e ferramentas

### 2026-10-28 — Vite no Windows escuta em `::1`
- **Problema/descoberta:** `curl http://127.0.0.1:3013` falhava com o Vite rodando, porque `localhost` resolve para IPv6 (`[::1]`).
- **Regra/solução:** teste o front em `http://localhost:<porta>`. A API escuta explicitamente em `127.0.0.1`.

### 2026-10-28 — Testes no Windows: feche o banco antes de apagar
- **Problema/descoberta:** `rmSync` da pasta temporária deu `EBUSY` porque a conexão SQLite ainda estava aberta.
- **Regra/solução:** nos testes, chame `db.close()` antes de remover a pasta.

### 2026-10-28 — Instância de teste sem tocar nos dados reais
- **Regra/solução:** `GRIMOIRE_DATA_DIR=<cópia> GRIMOIRE_API_PORT=3015 node server/index.js` e `GRIMOIRE_API_PORT=3015 GRIMOIRE_WEB_PORT=3013 npx vite --strictPort`. Use uma cópia de `data/backups/pre-v2.db` (ou de um backup recente) como `grimoire.db`.

### 2026-10-28 — ESLint precisa de globais do Node por pasta
- **Problema/descoberta:** `process`/`Buffer` apareciam como indefinidos em `server/` e `tests/`. Componente recebido por prop (`Detail`) era acusado como não usado.
- **Regra/solução:** o `eslint.config.js` tem um bloco com `globals.node` para server/shared/tests/configs e `argsIgnorePattern: '^[A-Z_]'`. Arquivos `.jsx` só exportam componentes (fast refresh): funções e constantes vão para `.js` à parte (ex.: `summonRules.js`, `escolaColors.js`).

### 2026-10-28 — Pesquisa da ficha Roll20
- **Problema/descoberta:** os caminhos `DnD_35` e `D%26D_3.5` dão 404, e o `gh` CLI não está instalado.
- **Regra/solução:** as pastas são `D&D_3-5` e `D&D_3-5-pt-br`. Baixe com `curl https://raw.githubusercontent.com/Roll20/roll20-character-sheets/master/D%26D_3-5/charsheet_3-5.html` e extraia os atributos com `grep -o 'name="attr_[^"]*"'`. O select `attr_size` usa o modificador como valor (Médio = 0, Pequeno = 1).

### 2026-10-28 — Formato VTTES não validado com arquivo real
- **Problema/descoberta:** o formato de import/export (`schema_version`, `attribs[]`) foi escrito com base na estrutura conhecida da extensão, sem um arquivo real exportado pelo usuário.
- **Regra/solução:** quando o usuário fornecer um export real, salvar em `tests/roll20/fixtures/` e criar um teste de import → export com ele. Ajustar `server/roll20/` conforme as divergências.

## Front-end

### 2026-10-28 — TipTap v3
- **Problema/descoberta:** o StarterKit v3 já inclui Underline e Link (instalar de novo duplica a extensão). `Color` vem de `@tiptap/extension-text-style`. `useEditor` não re-renderiza por transação por padrão, então a barra de ferramentas congela.
- **Regra/solução:** use só `starter-kit` + `extension-text-style` e passe `shouldRerenderOnTransaction: true`.

### 2026-10-28 — Modal com onClose inline
- **Problema/descoberta:** um `useEffect([open, onClose])` no Modal refaz o foco a cada render quando o pai passa uma função inline, e o cursor pula para o primeiro campo enquanto se digita.
- **Regra/solução:** guarde callbacks em ref (`onCloseRef`) e faça o efeito depender só de `open`.

### 2026-10-28 — `e.currentTarget` depois de `await`
- **Problema/descoberta:** num handler `onSubmit` async, `e.currentTarget` vira `null` depois do `await`.
- **Regra/solução:** capture `const form = e.currentTarget` antes de qualquer `await`.

### 2026-10-28 — `@theme` do Tailwind 4 com o mesmo nome do token
- **Problema/descoberta:** `@theme inline { --color-bg: var(--color-bg) }` cria uma variável que referencia a si mesma (inválida).
- **Regra/solução:** os utilitários do `@theme` usam nomes diferentes dos tokens (`--color-app`, `--color-panel`, `--color-gold-hi`…).

### 2026-10-28 — DOMPurify precisa de DOM
- **Problema/descoberta:** no teste de renderização (Node), `DOMPurify.sanitize` não existe.
- **Regra/solução:** o `RichText` usa o helper `clean()`, que só sanitiza se a função existir. No navegador, sempre sanitiza.

### 2026-10-28 — grimoire-design-system: problemas do pacote
- **Problema/descoberta:**
  - O `package.json` do DS exporta `./style.css` → `dist/style.css`, mas o build gera `dist/grimoire-design-system.css`, então não dá para importar o CSS.
  - O Modal do DS fecha ao clicar fora, não prende o foco e não tem `aria-modal`.
  - O Button não repassa props (`aria-label`, `title`).
- **Regra/solução:** o Grimoire usa `src/ui` com os mesmos nomes de token. Para adotar o DS, corrigir isso no repo do DS primeiro (export do CSS, `...props` nos componentes, modal acessível) e então migrar os componentes genéricos.
