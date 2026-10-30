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

## Processo de trabalho

### 2026-10-28 — Instruções mestre adotadas: fase por fase
- **Contexto:** o usuário forneceu `docs/CLAUDE_MASTER_INSTRUCTIONS.md`. As regras duráveis foram condensadas em "Regras de trabalho" no `CLAUDE.md`.
- **Problema/descoberta:** na reescrita v2, implementei todas as fases (0–7) numa única tarefa depois de uma aprovação geral do plano, e subi servidores de teste por conta própria. Funcionou, mas deixou um diff enorme e difícil de revisar.
- **Regra/solução:** daqui em diante, auditoria somente leitura → aprovação explícita de **uma** fase → implementação só dela → relatório (arquivos, testes executados, pendências) → nova aprovação. Não suba a API contra `data/` sem aprovação.

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

### 2026-10-29 — O prune contava backups no total, não por tipo
- **Contexto:** auditoria (fase 1, proteção de dados).
- **Problema/descoberta:** o comentário de `backup.js` dizia "20 por tipo", mas o código guardava os 20 mais recentes **no total**. Como todo boot gerava um backup, cerca de 20 reinícios apagariam `grimoire-…-pre-migration-v0.db`, o estado anterior à migração do banco real.
- **Regra/solução:** o prune agrupa por rótulo. `pre-migration-vN` e `manual` nunca são apagados. O backup de boot é pulado quando o hash de `db.serialize()` é igual ao do último backup (`backups/last-backup.json`). Ao mexer em limpeza de arquivos, teste com arquivos reais na pasta (`tests/api/security.test.js`).

## Regras D&D 3.5

### 2026-10-28 — Atributo mínimo para conjurar
- **Contexto:** testes do motor de regras.
- **Problema/descoberta:** escrevi casos de teste errados (Feiticeiro com Car 10, Clérigo com Sab 10) esperando magias de 1º nível. A regra é atributo ≥ 10 + nível da magia, e o motor estava certo.
- **Regra/solução:** ao criar casos de teste de conjuração, use atributo ≥ 11 para o 1º nível. Confira a conta do caso (base + bônus + domínio) antes de culpar o código.

### 2026-10-28 — Tabelas e recursos do v1 estavam errados
- **Problema/descoberta:**
  - Paladino, Ranger e Bardo tinham slots errados; o Clérigo não tinha slot de domínio; a multiclasse usava o nível total.
  - Expulsar Mortos-Vivos era fixo em 3 (o certo é 3 + Car); a Cura pelas Mãos era 1 uso (o certo é reserva de Car × nível).
  - ~~Os elementais médios estavam em Convocar Monstro V (o certo é IV).~~ **Errado:** pelo SRD 3.5, o Elemental Médio é Convocar Monstro **V** (corrigido em 2026-10-29, ver abaixo).
  - Arcane Disciple dava +1 slot por nível, o que está errado.
- **Regra/solução:** as tabelas ficam em `shared/constants/spellTables.js` (`null` = sem acesso, `0` = só bônus), cobertas por testes com casos do PHB. O efeito de Arcane Disciple em `featsData.json` foi corrigido (agora é só nota). Ao editar `featsData.json` ou `referenceData.js`, **incremente `SEED_VERSION`** em `server/seed.js`, ou o banco existente continua com os dados antigos.

### 2026-10-29 — Mago não usa a tabela do Clérigo; dados duplicados divergem
- **Contexto:** fase 2 (correções de regras).
- **Problema/descoberta:**
  - Na v2 apontei o Mago para a tabela `full` (Clérigo/Druida). A tabela 3-18 do Mago tem no máximo 4 por nível. As duas só são iguais até o nível 3, por isso nenhum teste pegou.
  - DV/BBA/saves estavam em dois lugares (`referenceData.js` e `shared/constants/classes.js`) e divergiam em 7 classes. Só o segundo era usado pelo motor.
  - Quatro sinergias situacionais estavam somando sempre. Talentos do PHB tinham perícias erradas (Mãos Hábeis, Dedos Ágeis) ou com nomes antigos sem mapeamento ("Identificar", "Sentido de Rua"), e o bônus sumia em silêncio.
- **Regra/solução:**
  - Cada classe conjuradora tem a sua tabela, testada em níveis além do 3.
  - Mecânica de classe só em `shared/constants/classes.js`; o seed copia para `ref_classes`.
  - Há um teste que falha se algum `bonus_skill` não estiver mapeado nem for situacional.
  - Classes de suplemento ficam com `verified: false` até alguém conferir no livro.

### 2026-10-29 — Empilhamento de CA e efeitos de ataque ignorados
- **Contexto:** fase 5. O usuário escolheu aplicar a regra (opção A), não só avisar.
- **Problema/descoberta:**
  - A CA somava todos os bônus do mesmo tipo.
  - Efeitos de talento em ataque (ex.: falha Shaky, −2 à distância) entravam no "à distância" geral, mas não no total de cada arma.
  - Alvos situacionais (`ranged_close`, `aoo`, `thrown`) ficavam guardados em `effects.attack` sem uso nem aviso.
  - Agarrar Aprimorado (+4, SRD) estava só como nota.
  - Armadura natural é uma pegadinha: amuleto e casca de árvore dão bônus de **melhoria** na armadura natural, que soma com a natural racial mas não entre si.
- **Regra/solução:**
  - `stackBonuses` (modos `max`, `base+max`, `sum`) em `shared/rules/combat.js`.
  - O mapeamento campo → fonte está documentado como interpretação no CLAUDE.md.
  - Antes de mudar uma regra que altera números, calcule o impacto no banco real **em modo somente leitura** (`new Database(path, { readonly: true })`). Neste caso, as duas fichas reais não mudaram.
  - No Windows, `python - <<'EOF'` com template literals JS (`${...}` e aspas) quebrou no Bash: escreva o script num arquivo no scratchpad e rode-o.

### 2026-10-29 — Criaturas de Convocar Monstro conferidas com o SRD
- **Contexto:** fase 6 (rastreabilidade).
- **Problema/descoberta:**
  - 15 das 36 criaturas convocáveis estavam no nível errado, e 4 nem estão na tabela do SRD (xorn, deva astral, glabrezu, treant).
  - Muitas estatísticas tinham sido inventadas (Cão Celestial 4d8; o certo é 1d8+2).
  - Eu mesmo tinha "corrigido" o Elemental Médio de V para IV na v2 confiando na memória, e o SRD diz V.
- **Regra/solução:**
  - Números de monstro só a partir do bloco de estatística da fonte. O modelo celestial/abissal (SRD) só garante Int ≥ 3; não muda DV, CA nem ataques.
  - A tabela do SRD está no teste `tests/rules/content.test.js`.
  - Não confie em memória para regra: confira e registre a fonte.

### 2026-10-29 — Conferência com o SRD: onde baixar e armadilhas da comparação por nome
- **Contexto:** fase 6.
- **Problema/descoberta:**
  - `d20srd.org` responde com um desafio do Cloudflare para `curl`. Não contorne: é controle de acesso.
  - O repositório `olimot/srd-v3.5` (conversão em HTML dos RTFs originais do SRD, listado nas instruções mestre) é baixável por `raw.githubusercontent.com` e tem tabelas regulares (`<th>Hit Dice:</th><td>…`); o jsdom extrai os blocos.
  - Comparar pelo nome em inglês derivado do id dá **falsos negativos** (16 talentos do PHB, como `armor_light`, não casaram) e **falsos positivos** (talentos de suplemento com o mesmo nome de talento épico ou de monstro do SRD, como "Fast Healing").
- **Regra/solução:**
  - Só marque `srd: true` para livros cujo conteúdo o SRD contém (PHB, DMG, MM, Expanded Psionics), e confira os nomes que não casaram.
  - Conteúdo baixado vai para uma pasta própria no scratchpad e é lido como dado; os scripts ficam fora dela.
  - Antes de migrar o banco real, ensaie numa cópia via `db.backup` e compare as contagens das tabelas do usuário (`scratchpad/rehearse003.mjs` foi o modelo).

## Infra e ferramentas

### 2026-10-29 — `.gitignore` com `data/` também ignora `src/data/`
- **Contexto:** fase 2, ao editar `src/data/builtinSpells.json`.
- **Problema/descoberta:** o padrão `data/` sem barra inicial casa com qualquer pasta `data`. Por isso `src/data/builtinSpells.json` e `src/data/spellNamesEn.json` **nunca foram versionados**: as edições não aparecem no `git status`.
- **Regra/solução:** corrigido para `/data/`, só a pasta da raiz (aprovado pelo usuário em 2026-10-29). Em `.gitignore`, ancore com `/` os padrões que valem só para a raiz. Para conferir, use `git check-ignore -v <arquivo>`.

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

### 2026-10-29 — O que o export real da VTTES mostrou (Alescarion, ficha "D&D3.5 v2.8")
- **Contexto:** o usuário forneceu `tests/roll20/Alescarion Sighart.json`. Fiz uma análise somente leitura (import em `openDatabase(null)`) e conferi com o `charsheet_3-5.html`.
- **Problema/descoberta:**
  - O formato é `{ schema_version: 3, type: 'character', character: { …, attribs, abilities } }`, e cada atributo tem `id`. O import já aceitava o formato aninhado.
  - A `bio` vem codificada com `escape()` (`%3Cp%3E…`, `%E3` = ã); `unescape` decodifica.
  - Nas seções `repeating_spells<nível><n>`, o `<n>` é a **aba** da ficha (1 = divina, 2 = arcana, `divinespells*`/`arcanespells*`), não o 1º ou 2º conjurador. Existe também o nível 10 (`spells102`), que o usuário usa para itens com cargas.
  - A ficha tem armas **fixas** (`weapon1…10name/type/range…`) além de `repeating_weapons`, e o usuário usa as fixas.
  - Com unidades métricas (`lengthunit=m.`, `lengthscale=0.3`, `weightunit=kg`, `weightscale=0.5`), deslocamento, alcance e pesos ficam no valor que o usuário digitou (9 = 9 m).
  - Rótulos livres: classe "Mage" e tendência "Neutro Bom". Os talentos são texto livre com descrições e linhas `-----`.
  - Há atributos com o mesmo nome repetidos (10 no arquivo), além de muitos valores calculados pela ficha (`str-mod`, `level`, `totalequipmentweight`, `*-show`).
- **Regra/solução:**
  - Não presuma o formato pela documentação da ficha: confira contra a fixture `tests/roll20/fixtures/vttes-alescarion.json` (cópia sem bio, imagens nem nome do jogador; o original do usuário fica em `tests/roll20/`). Corrigido em 2026-10-29 (ver seção Roll20 do CLAUDE.md).
  - Ids de linha repetida podem conter `_`: nunca separe o nome do atributo com `split('_')`, use o tamanho fixo de 20 caracteres.
  - Ficou sem teste: importar no Roll20 um arquivo gerado pelo Grimoire.

### 2026-10-29 — Roll20: lista de "mapeados" por regex perdia dados
- **Contexto:** fase 4 (Roll20 sem perdas).
- **Problema/descoberta:**
  - `isMappedAttr` decidia por regex largas (`/(ranks|classskill|miscmod)$/`, `/^(acitem|shield)/`). Assim, atributos que o import **não lia** (ex.: `acitemtype`, `speaklanguageranks`) eram considerados mapeados e sumiam.
  - Todas as seções repetidas desconhecidas e os campos extras das conhecidas (descrição e alcance de magia) eram descartados.
  - `hitpoints` era lido com `attrs.get`, fora do rastreamento.
  - O ESLint trata qualquer função `useXxx` como hook do React, até no servidor.
- **Regra/solução:**
  - Rastreie o que foi **realmente lido** (`cur()` marca o nome; `consumeRow` marca os campos de linha repetida) e guarde todo o resto que não for recalculado, vazio ou fórmula.
  - O teste confere que lido + recalculado + vazio + guardado = total.
  - Não comece helpers com `use` fora de componentes.

### 2026-10-29 — Bind em 127.0.0.1 não basta: Origin/Host e fotos
- **Contexto:** auditoria de segurança (fase 1).
- **Problema/descoberta:**
  - Qualquer site aberto no navegador podia mandar POSTs "simples" para a API (rest, reset, backup). Repetir `/api/backup` girava a rotação de backups.
  - A extensão da foto saía do data URL (`data:image/html;…` virava `.html`, servido em `/photos` na mesma origem).
  - O proxy do Vite (sem `changeOrigin`) mantém `Host: localhost:3003` e `Origin: http://localhost:3003`.
- **Regra/solução:**
  - O middleware `localOnly` exige `Host` local e, nas escritas, `Origin` local quando presente.
  - A extensão das fotos vem dos magic bytes (`detectImageExt`).
  - `/photos` só serve jpg/png/webp/gif, com `nosniff` e CSP `sandbox`.
  - Nos testes, use um PNG real: o antigo de 8 bytes não passa na detecção.

## Front-end

### 2026-10-28 — TipTap v3
- **Problema/descoberta:** o StarterKit v3 já inclui Underline e Link (instalar de novo duplica a extensão). `Color` vem de `@tiptap/extension-text-style`. `useEditor` não re-renderiza por transação por padrão, então a barra de ferramentas congela.
- **Regra/solução:** use só `starter-kit` + `extension-text-style` e passe `shouldRerenderOnTransaction: true`.

### 2026-10-28 — Modal com onClose inline
- **Problema/descoberta:** um `useEffect([open, onClose])` no Modal refaz o foco a cada render quando o pai passa uma função inline, e o cursor pula para o primeiro campo enquanto se digita.
- **Regra/solução:** guarde callbacks em ref (`onCloseRef`) e faça o efeito depender só de `open`.

### 2026-10-29 — Falhas de save que sumiam no front
- **Contexto:** fase 3 (confiabilidade do front).
- **Problema/descoberta:**
  - `run()` em `useSheetActions` resolvia `undefined` tanto na falha quanto no sucesso sem corpo (204). Por isso o PrepareModal fechava e **perdia a preparação** quando o save falhava, o Novo Dia mostrava "sucesso" depois de falhar e o form de magia era limpo mesmo com erro.
  - `fields.jsx` comparava `null !== ''`: todo blur num campo opcional vazio mandava um PATCH.
  - O React **não renderiza** o atributo `autofocus` (chama `focus()` no commit, antes dos efeitos do pai). O `querySelector('[autofocus]')` do Modal nunca casava, e o foco a devolver ao fechar seria o do filho.
  - O `getHTML()` do TipTap normaliza o HTML: comparar com o valor bruto fazia um simples foco e blur regravar notas antigas. Ao trocar de nota com o autosave pendente, a edição ia para a nota errada (o timer lia o editor já com o conteúdo novo).
  - Os testes SSR (`renderToString`) não rodam efeitos nem eventos, então nada disso era coberto.
- **Regra/solução:**
  - O contrato do `run()` é resolver dados ou `true` no sucesso e `undefined` na falha; quem chama confere o retorno.
  - Normalize vazio antes de comparar.
  - Nos modais, use `data-autofocus`.
  - O RichText só salva se houve `onUpdate` (flag `dirty`), guarda o `onSave` do documento editado e faz flush antes de trocar de `docKey`.
  - Para testar interação, use `// @vitest-environment jsdom` + Testing Library (`tests/ui/interaction.test.jsx`). Para provar que o teste pega o bug, rode-o contra o código antigo (`git show HEAD:arquivo`).

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
