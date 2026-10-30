# Auditoria UX/UI: Talentos, Recursos, Magias, Inventário, Invocações, Diário, Arquivos (Exchange), Toast/Modal

Trabalho só de leitura. Nada foi editado, instalado ou executado: nem API, nem Vite, nem testes. Toda evidência é `arquivo:linha` (caminhos relativos a `C:\projects\Grimoire\`).
Legenda: **[FATO]** = confirmado no código · **[HIP]** = hipótese ou comportamento provável que precisa ser conferido no navegador · **[REC]** = recomendação.

## Resumo executivo (o que mais pesa na mesa)

1. **Conjurar magia preparada** não tem pista visual nem mostra que dá para desfazer. O "botão" é o nome inteiro da magia, sem rótulo (`src/features/spells/CasterBlock.jsx:85-87`). Desfazer existe (clicar de novo), mas ninguém descobre. O toast já aceita `undo` (`src/ui/Toast.jsx:7,45-48`), mas **nenhum lugar do app usa** [FATO: grep `undo` só acha o Toast].
2. **Linhas criadas com nome falso, gravado no idioma da interface.** O nome sai do rótulo do botão via `.replace('+ ', '')` em 4 lugares: `src/features/inventory/InventoryTab.jsx:22`, `src/features/feats/ResourcesPanel.jsx:21`, `src/features/journal/ListDetail.jsx:16` e o título do modal em `src/features/spells/SpellbookPanel.jsx:67`. Com a interface em en, o banco recebe "Item"/"Resource"/"NPC" em inglês. O recurso novo nem abre a edição (diferente do item, `InventoryTab.jsx:23`).
3. **Diário com bugs de fluxo:**
   - a sessão nova aparece **no fim** da lista, que deveria estar em ordem de data decrescente. O servidor ordena (`server/repo.js:60`), mas o `create` otimista faz append (`src/queries/characters.js:130`) e o `NotesPanel` não ordena;
   - se `/journal` falhar, a tela fica em "Carregando..." para sempre (`src/features/journal/JournalTab.jsx:17`);
   - a sub-aba volta para "Sessões" toda vez que se troca de aba principal, porque é estado local e o componente desmonta (`JournalTab.jsx:16` + `src/features/sheet/SheetPage.jsx:68`).
4. **ExchangeModal:**
   - o botão do header diz "Exportar" (`SheetPage.jsx:32`, `sheet.export`), mas o modal importa, exporta e faz backup;
   - o relatório é uma `<ul>` solta (`src/features/shell/ExchangeModal.jsx:56-60`);
   - as linhas do relatório vêm do servidor **em português fixo**, sem i18n (`server/roll20/index.js:317,396,429,499`);
   - o modal tem `closeOnBackdrop` mesmo mostrando o relatório (`ExchangeModal.jsx:51`): um clique fora perde o relatório e não navega para o personagem importado.
5. **Rascunho do PrepareModal se perde em silêncio.** Esc ou × fecham sem perguntar (`src/ui/Modal.jsx:31` + `src/features/spells/PrepareModal.jsx:45`). O comentário do próprio arquivo admite: "fechar sem salvar descarta" (`PrepareModal.jsx:9`).
6. **Recursos:**
   - anotar um uso só funciona por clique direito ou duplo clique (`ResourcesPanel.jsx:67-68`);
   - [HIP forte] o duplo clique dispara também dois `onClick`, ou seja, dois `setUse` que se anulam: duas requisições e um piscar visual;
   - "Restaurar" (↺) apaga as anotações de uso sem confirmar (otimista `uses: []` em `characters.js:189`). Novo Dia também apaga (`server/repo.js:237`), e a interface não avisa.
7. **Texto miúdo:** cerca de 45 ocorrências de `text-[9px|10px|11px]` nos arquivos do escopo (contagem por grep). O pior é `CasterBlock.jsx` (10), justamente a tela mais usada em combate.

---

## A. Mapa dos fluxos de mesa

| Fluxo | Passos hoje (cliques) | Fricções | Evidência |
|---|---|---|---|
| **Começar sessão** | Diário → Sessões → "+ Sessão" (3) → digitar título → clicar no editor | A nota nova cai no fim da lista. O campo de título se chama "Nome". O foco não vai para o título. A sub-aba não é lembrada. | `NotesPanel.jsx:21-24,51`; `characters.js:130`; `JournalTab.jsx:16` |
| **Conjurar (preparada)** | Magias → clicar no nome (1) | Sem rótulo de ação; só opacidade 35% + riscado. Desfazer = clicar de novo (invisível). O título nativo mostra a *descrição*, não a ação. | `CasterBlock.jsx:82-89` |
| **Conjurar (espontâneo)** | Clicar num losango do nível (1) | Bom. Mas não liga a uma magia conhecida e o "restantes" é texto de 11px. | `CasterBlock.jsx:67-74,60` |
| **Preparar magias** | "Preparar Magias" → nível → "+" por magia → Salvar | Esc descarta. Não dá para ver quantas vezes uma magia já foi preparada. O estado vazio mostra um `Badge` que **parece botão e não é**. | `PrepareModal.jsx:27-31,45`; `CasterBlock.jsx:106` |
| **Convocar via magia** | Card da magia → "Convocar" (10px) → modal → criatura → Convocar | O modal deixa trocar para SM IX mesmo vindo de SM I. Cria **1** criatura, embora o badge diga 1d3 / 1d4+1. Fecha depois de convocar, e a 2ª criatura teria de vir da aba Invocações, que não marca a magia. | `SummonModal.jsx:51-56,67,30-36`; `SpellsTab.jsx:26-27` |
| **Gastar recurso (fichas)** | Talentos & Habilidades → clicar na ficha (1) | Ok. Anotação escondida. "x/y usados" em 11px (o útil seria "restantes"). | `ResourcesPanel.jsx:44-46,65-68` |
| **Gastar recurso (reserva, ex. Cura pelas Mãos)** | Clicar em "Gasto" → somar de cabeça → digitar → blur | Conta mental. Não há "Gastar N". | `ResourcesPanel.jsx:56-57` |
| **Tomar dano (invocação)** | Botão − (de 1 em 1) ou digitar o PV final | Para 12 de dano: 12 cliques ou conta mental. O padrão "valor + Dano/Curar" já existe no `HpTracker`, mas não é reutilizado. | `SummonsTab.jsx:38-46`; `src/features/sheet/HpTracker.jsx:17-29,54-60` |
| **Rodadas de invocação** | Digitar o total; "−1 rodadas" por card | Sem "próxima rodada" para todas. Não há estado "expirou". O placeholder sugere o NC, mas não preenche. Com multiclasse usa o maior NC entre as classes. | `SummonsTab.jsx:16,54-58` |
| **Saquear item** | "+ Item" → linha "Item" aberta → apagar "Item" → digitar → qtd → peso (≥6 interações) | Nome falso. O formulário mostra 12 campos, inclusive CA e falha arcana, para uma corda. | `InventoryTab.jsx:21-24`; `ItemRow.jsx:26-42` |
| **Saquear moedas** | Clicar em PO → somar de cabeça → digitar | Sem "+ receber / − gastar". | `InventoryTab.jsx:61-67` |
| **Equipar / guardar** | Abrir a linha → select "Equipar em..." (16 opções) | Sem ação rápida; a chave `inventory.unequip` existe e não é usada. No slot, o editor abre embaixo da grade, longe do clique. | `ItemRow.jsx:28`; `InventoryTab.jsx:54-58` |
| **Anotar NPC** | Diário → NPCs → "+ NPC" (cria "NPC") → renomear | Nome falso. NPC sem link para as missões dele. A missão lista NPCs, mas o Local só lista missões como texto. | `ListDetail.jsx:15-18`; `details.jsx:59-67,86-100` |
| **Novo Dia** (barra lateral) | ☀ → Confirmar | Do meu escopo: zera magias, slots e recursos **e apaga as anotações de uso**. **Não** dispensa invocações. O texto do modal não diz nada disso. | `server/repo.js:232-247`; `src/features/sheet/Sidebar.jsx:73-82` |
| **Subir de nível** | (aba Principal) → recursos e slots se atualizam via refetch | Nada destaca "+1 slot de nível 2" ou "novo recurso". [HIP] o jogador não percebe o que mudou. | `characters.js:132,144` |
| **Roll20 (importar)** | Botão "Exportar" (!) → Importar do Roll20 → arquivo → relatório → "Confirmar" | Rótulo errado. Relatório solto em pt fixo. Clique fora perde o relatório. O botão "Confirmar" não diz "Abrir ficha". | `SheetPage.jsx:32`; `ExchangeModal.jsx:51-64` |
| **Roll20 (exportar)** | "Exportar para Roll20" | Não diz o que fica de fora (recursos, invocações, diário, foto, overrides; CLAUDE.md, seção Roll20) nem que a volta ao Roll20 **não foi testada**. Sem toast de sucesso. | `ExchangeModal.jsx:70-71`; `src/api/client.js:44-55` |

---

## B. Tela por tela

### B1. Aba Talentos & Habilidades: lista de talentos e falhas (`src/features/feats/FeatsTab.jsx`)

**Problemas**
- [FATO] "Editar" e "✕" são textos `text-xs` sem forma de botão (`:51-54`). A descrição de referência aparece sempre inteira (`:47`): com 10 talentos, a lista vira um muro de texto.
- [FATO] Estado vazio genérico: falhas usam `common.empty` "Nada aqui ainda" (`:69`). Pré-requisitos em 10px (`:49`) e livro em 10px (`:33`).
- [FATO] Para o talento personalizado, o nome só é editável depois de abrir "Editar" (`:43`).

**Proposta**
```
┌ Talentos (7) ──────────────────────────── [Buscar…] [+ Talento] ┐
│ ▸ Magia Penetrante  · Spell Penetration · PHB                     │
│   [+2 NC vs RM]                                        [✎] [🗑]   │
│   Pré-requisitos: —                                               │
│   Descrição em 2 linhas… [mais]                                   │
├───────────────────────────────────────────────────────────────────┤
│ ▸ Esquiva (personalizado)                              [✎] [🗑]   │
└───────────────────────────────────────────────────────────────────┘
┌ Falhas ─────────────────────────────────────────── [+ Falha] ┐
│   Sem falhas. Opcional: adicione se a sua mesa usa falhas.    │
└───────────────────────────────────────────────────────────────┘
```
- Descrição limitada a 2 linhas com "mais/menos" (CSS line-clamp, estado local).
- `IconButton` com SVG para editar/excluir. Excluir continua `ConfirmButton`.
- Busca local só aparece com mais de 8 talentos.
- Microcopy:
  - `feats.none`: "Nenhum talento ainda" / "No feats yet";
  - hint: "Busque na referência ou crie um personalizado." / "Search the reference or create a custom one.";
  - `feats.flawsEmpty`: "Sem falhas. Opcional: adicione se a sua mesa usa falhas." / "No flaws. Optional — add them if your table uses flaws."
- **Arquivos:** `FeatsTab.jsx`, `src/i18n/translations.js`.
- **Riscos:** `tests/ui/render.test.jsx` (aba feats) só confere "Bonar". Baixo.
- **Prioridade:** P2 (estado vazio P1 junto com os demais).

### B2. FeatPicker (`src/features/feats/FeatPicker.jsx`)

**Problemas**
- [FATO] "Criar talento personalizado" usa o texto da busca como nome, de forma invisível (`:44-48`); com a busca vazia, cria "Personalizado".
- [FATO] Sem contagem de resultados e sem estado "nada encontrado" (a `<ul>` fica vazia, `:74-84`). Sem carregando nem erro de `useRefData` (`:17,23`).
- [FATO] O detalhe vazio usa `journal.selectItem` "Selecione um item à esquerda" (`:99`), uma chave emprestada do diário.
- [FATO] Hover com cor crua `hover:bg-[rgba(255,255,255,0.03)]` (`:78`), repetida em ListDetail, NotesPanel e SummonModal.

**Proposta**
```
┌ Escolher talento ───────────────────────────────────────────── × ┐
│ [Buscar por nome, pré-requisito…      ] [Todos os livros ▾]       │
│ (Todas) (Geral) (Metamágico) (Criação de item) …     143 talentos │
├──────────────────────────┬────────────────────────────────────────┤
│ Esquiva            ✓ tem  │ Esquiva · Dodge · PHB                  │
│ Magia Penetrante          │ Pré-requisitos: Des 13                 │
│ …                         │ texto…                                 │
│                           │ [+1 CA esquiva]                        │
│ Nada encontrado para "xy" │                    [Adicionar talento] │
│ [Criar "xy" como          │                                        │
│  personalizado]           │                                        │
└──────────────────────────┴────────────────────────────────────────┘
```
- Botão dinâmico: `feats.createNamed` "Criar “{name}”" / "Create “{name}”". Sem busca: "Criar talento personalizado".
- Estados:
  - carregando: `Loading` no lugar da lista;
  - erro: `EmptyState` com "Não foi possível carregar a referência" e [Tentar novamente] (`refetch`);
  - vazio da busca: como no wireframe.
- Detalhe vazio: "Escolha um talento para ver os detalhes" (chave nova `feats.pickHint`).
- **Arquivos:** `FeatPicker.jsx`, `translations.js`.
- **Riscos:** nenhum teste toca o FeatPicker diretamente.
- **Prioridade:** P1.

### B3. ResourcesPanel (`src/features/feats/ResourcesPanel.jsx`)

**Problemas**
- [FATO] Anotação só por `onContextMenu` ou `onDoubleClick` (`:67-68`). A única pista é o `title` com a nota já existente.
- [HIP forte] O duplo clique gera dois `onClick` → dois `setUse` opostos (`:66`).
- [FATO] "+ Recurso" cria `name: 'Recurso'` (vindo do rótulo), `icon: '✨'`, `total_override: 1` e **não abre a edição** (`:21`). O usuário precisa achar o ⚙.
- [FATO] Na reserva (pool), só dá para digitar o total gasto (`:56-57`).
- [FATO] O contador mostra "x/y usados" (`resources.uses`); o útil em mesa é "restantes".
- [FATO] ↺ sem confirmação; restaurar zera `uses` e com isso as anotações (`characters.js:189`).
- [FATO] ⚠ de fórmula não conferida só com `title` (`:42`), em 10px.
- [FATO] Barra da reserva com `bg-[var(--color-success)]` (token, ok). Lista de notas em 11px (`:85`).
- [FATO] Ícones: emoji vindo de dado (`shared/rules/resources.js:11-34`, coluna `icon`) misturado com ↺ e ⚙.

**Proposta**
```
┌ Recursos de Classe ───────────────────────────────── [+ Recurso] ┐
│ [ícone] Fúria · Bárbaro 4                  1 de 2 restantes  ↺ ⋯  │
│   (●)(○)   Clique: gastar/devolver · Anotar uso ✎                 │
│   #1 contra o ogro ✎                                              │
├───────────────────────────────────────────────────────────────────┤
│ [ícone] Cura pelas Mãos · Paladino 4             8 de 12 PV  ↺ ⋯  │
│   ████████░░░░   [  3 ] [Gastar] [Recuperar]                      │
├───────────────────────────────────────────────────────────────────┤
│ [ícone] Inspiração ⚠ fórmula de suplemento não conferida — ajuste │
│   o total se precisar                                             │
└───────────────────────────────────────────────────────────────────┘
Criar recurso (inline, abre ao clicar "+ Recurso"):
│ Nome [Usos da varinha____] Tipo (•) Usos ( ) Reserva Total [3] [Criar] [Cancelar] │
```
- **Fichas** viram o componente `TokenTrack` (seção C). Clique gasta ou devolve; `aria-label` "Uso 1 de 2: disponível/gasto".
- **Anotação:** remover `onDoubleClick`. Manter o clique direito como atalho e adicionar o link visível "Anotar uso ✎", que abre a nota do **último uso gasto**; sem uso gasto, fica desabilitado com o title "Gaste um uso para anotar". Cada nota listada ganha ✎ para editar. Fonte das notas em 12px.
- **Reserva:** `QuickAmount` com ações Gastar e Recuperar, que calcula `pool_used ± n` limitado a [0, total]. O campo "Gasto" vai para o painel ⋯.
- **Restaurar:** `ConfirmButton` com `confirmLabel` "Restaurar? Apaga as anotações", só quando há nota; sem nota, restaura direto.
- **Criar:** formulário inline e só depois `create`. Em seguida `setEditing(row.id)` se for preciso. Sem ícone padrão: o render usa o ícone SVG genérico (ver C4).
- **Avisos:** o ⚠ vira `Notice tone="warn" size="inline"` com o texto visível.
- **Microcopy nova:**
  - `resources.left` "{n} de {total} restantes" / "{n} of {total} left";
  - `resources.noteAction` "Anotar uso" / "Note this use";
  - `resources.spend` "Gastar" / "Spend";
  - `resources.recover` "Recuperar" / "Recover";
  - `resources.resetConfirm` "Restaurar? Apaga as anotações" / "Reset? Clears notes";
  - estado vazio: "Nenhum recurso de classe. Os recursos das suas classes aparecem aqui sozinhos conforme o nível; crie um para usos por dia de itens ou talentos." / "No class resources. Your classes' resources show up here automatically by level; create one for daily uses of items or feats." ([FATO] a criação automática vem de `syncResources`, `server/defaults.js`, segundo o CLAUDE.md.)
- **Arquivos:** `ResourcesPanel.jsx`, novos `src/ui/TokenTrack.jsx` e `src/ui/QuickAmount.jsx`, `translations.js`.
- **Riscos:**
  - `setUse` e `resetResource` mantêm o contrato e resolvem `undefined` na falha: o inline de criação só fecha com `if (await actions.create(...))`;
  - a reserva continua salvando via `update('resources', id, { pool_used })`;
  - não mexer na fórmula: o total vem de `sheet.resources` (`:17`).
- **Prioridade:** P0 (criação com nome falso, duplo clique, affordance da nota); reserva P1.

### B4. CasterBlock: slots e preparadas (`src/features/spells/CasterBlock.jsx`)

**Problemas**
- [FATO] O card da preparada inteiro é o botão, sem rótulo de ação. O `title` mostra a descrição (`:83`); o usado fica com opacidade .35 e riscado (`:82,87`).
- [FATO] Domínio em 9px (`:88`), "Convocar" em 10px (`:91`).
- [FATO] O estado "Nenhuma magia preparada" coloca um `<Badge>` com o texto "Preparar Magias" que **não é clicável** (`:106`).
- [FATO] Cabeçalho apertado: NC, atributo e mod em 11px + 2 botões (`:32-38`). "Bônus manual de slots" fica sempre visível como botão `subtle`, mas o uso é raro.
- [FATO] Classe sem tabela (`cast.manual`): só um aviso de 11px dizendo para usar o bônus (`:41`), sem botão.
- [FATO] Cor crua `rgba(160,122,217,0.35)` nos losangos (`:72`).

**Proposta**
```
┌ Clérigo 3 ─────────── NC 3 · SAB 16 (+3) ───── [Preparar magias] ⋯ ┐
│ NÍVEL 1   CD 14   ◆◆◇  2 de 3 restantes                              │
│ ┌──────────────────────────────┐ ┌──────────────────────────────┐   │
│ │[esc] Curar Ferimentos Leves  │ │[esc] Convocar Monstro I      │   │
│ │      [Conjurar]              │ │  DOMÍNIO [Conjurar][Convocar…]│  │
│ └──────────────────────────────┘ └──────────────────────────────┘   │
│ ┌ usada ───────────────────────┐                                     │
│ │[esc] ~~Bênção~~  Conjurada ↶ │  ← "↶ Desfazer" visível no card    │
│ └──────────────────────────────┘                                     │
│ NÍVEL 2   Atributo baixo demais (15 necessário)          (apagado)   │
└──────────────────────────────────────────────────────────────────────┘
Vazio:  Nenhuma magia preparada hoje. [Preparar magias]
Manual: ⚠ Classe sem tabela automática. [Definir slots]  (abre o modo de bônus)
```
- **Card:**
  - nome à esquerda;
  - botão explícito "Conjurar" (Button sm ghost) ou, no estado usado, a etiqueta "Conjurada" + `IconButton` "↶ Desfazer conjuração" (`spells.castAgain` já existe);
  - o card inteiro continua clicável como atalho;
  - `aria-pressed` fica.
- Usada: opacidade .55 (hoje .35 deixa ilegível) + riscado + etiqueta. Assim o estado não depende só de opacidade.
- Descrição: mantida no `title`, só que no nome, não no card.
- "Convocar…" vira botão sm com rótulo, ao lado de Conjurar.
- **Sem toast por conjuração:** é ação de alta frequência e o ↶ no card já é o desfazer.
- **Cabeçalho:** NC e atributo como `KeyValue`. "Bônus manual de slots" vai para um menu ⋯ ou um `Button subtle` com ícone de engrenagem. Com `cast.manual`, o bônus abre por padrão.
- **Linha de nível:** `TokenTrack variant="diamond"` também para as preparadas, como resumo visual de restantes (só leitura). Nos espontâneos, os losangos continuam interativos.
- Fonte mínima de 12px (`text-xs`) para CD, por dia e restantes; o número em `font-display`.
- **Arquivos:** `CasterBlock.jsx`, `TokenTrack`, `translations.js` (chaves `spells.castDone` "Conjurada" / "Cast", `spells.prepareNow` "Preparar magias", `spells.setSlots` "Definir slots" / "Set slots").
- **Riscos:**
  - `tests/ui/render.test.jsx:77-81` exige os textos "Convocar Monstro I", "Domínio" e "Feiticeiro 1" no HTML: manter `spellName`, `t('spells.domain')` e o título da seção;
  - o motor não muda (`cast.*` vem de `computeSheet`);
  - `actions.update('prepared', id, { used })` continua igual.
- **Prioridade:** P0 (affordance de conjurar e Badge falso); cabeçalho P2.

### B5. PrepareModal (`src/features/spells/PrepareModal.jsx`)

**Problemas**
- [FATO] Esc e × descartam o rascunho sem perguntar (`:9,45` + `Modal.jsx:31`).
- [FATO] A lista do grimório não mostra quantas cópias já estão preparadas. Sem busca.
- [FATO] O vazio do nível usa "Nada aqui ainda" (`:79`).
- [FATO] A coluna de preparadas inteira é um botão "remover" com ✕ em `text-dim` (`:88-94`). Isso é aceitável dentro de um rascunho, mas não há rótulo.
- [FATO] `+${dUsed}/1` tem o "1" fixo (`:60`).

**Proposta**
```
┌ Preparar — Clérigo ──────────────────────────────────────────────── × ┐
│ NÍVEIS        │ GRIMÓRIO (nível 1)   [Buscar…]  │ PREPARADAS  2/3 +1/1 │
│ Nível 0  4/4 ✓│ [esc] Bênção        ×1 [+][+Dom]│ [esc] Bênção     [−] │
│▶Nível 1 2/3   │ [esc] Curar Fer. L. ×0 [+][+Dom]│ [esc] Escudo da Fé[−]│
│ Nível 2  0/2  │                                 │ [esc] Conv. Mon. I   │
│               │ Nenhuma magia de nível 1 no     │       DOMÍNIO    [−] │
│               │ grimório. [+ Magia]             │ 1 slot livre         │
├───────────────┴─────────────────────────────────┴──────────────────────┤
│ Clique em + para preparar; − para tirar.  [Cancelar] [Salvar preparação]│
└─────────────────────────────────────────────────────────────────────────┘
Ao fechar com alterações: barra no rodapé
│ ⚠ Descartar as alterações da preparação?  [Continuar editando] [Descartar] │
```
- `Modal` ganha `confirmClose` (seção C). O `PrepareModal` passa `confirmClose={dirty}` (draft ≠ inicial, comparando por `spell_id, level, is_domain`).
- Contador "×n" por magia do grimório (conta no `draft`, sem regra nova).
- Slots livres mostrados como linhas tracejadas "slot livre", para ver o que falta preencher.
- O capacity do domínio usa `cast.domain[L]` no texto, no lugar do "1" fixo.
- Botão "Salvar preparação". Com `saving`: "Salvando…" e disabled (hoje só fica disabled).
- **Arquivos:** `PrepareModal.jsx`, `src/ui/Modal.jsx`, `translations.js`.
- **Riscos:**
  - `tests/ui/interaction.test.jsx:69-104` testa Esc fechando e o backdrop: com `confirmClose` falso por padrão, nada muda;
  - escrever um teste novo para `confirmClose`;
  - `replacePrepared` continua igual e o modal só fecha com `if (ok)` (`:35-37`, já certo).
- **Prioridade:** P0 (perda do rascunho); contador e slot livre P1.

### B6. SpellbookPanel e o modal "+ Magia" (`src/features/spells/SpellbookPanel.jsx`)

**Problemas**
- [FATO] As abas de nível mostram só o número "0", "1"… (`:36`).
- [FATO] Editar exige clicar no nome, que parece texto (`:48`).
- [FATO] Excluir a magia apaga em cascata as preparações (refetch em `characters.js:156`), sem aviso.
- [FATO] O título do modal monta o texto com `.replace('+ ', '')` (`:67`). O modal tem formulário com `closeOnBackdrop` (`:67`), contra a convenção para edição não salva.
- [FATO] A lista padrão adiciona com um clique, sem toast; o ✓ aparece em 10px (`:93-97`).

**Proposta**
```
┌ Grimório ─────────────────────────────────────────────── [+ Magia] ┐
│ (Nv 0 ·5) (Nv 1 ·4) (Nv 2 ·1)          Conhecidas: 4 / 4           │
│ [esc] Bênção        Encantamento                         ✎   🗑    │
│ [esc] Escudo da Fé  Abjuração      preparada ×1          ✎   🗑    │
└────────────────────────────────────────────────────────────────────┘
Modal "Adicionar magia — Nível 1":
│ Personalizada: [Nome______] [Escola ▾] [Adicionar]                  │
│ Lista padrão  [Filtrar…]                                            │
│ [esc] Bênção ✓ no grimório   [esc] Comando  [+]                     │
```
- ✎ explícito para editar. 🗑 continua `ConfirmButton`; se a magia estiver preparada, o `confirmLabel` vira "Excluir? Sai da preparação" / "Delete? Removes it from prepared".
- Abas "Nv 1 · 4". Indicador "preparada ×n".
- Modal sem `closeOnBackdrop` (tem input). Título vindo de chave própria `spells.addTitle` "Adicionar magia — {level}".
- Lista padrão: "✓ no grimório" usa a chave `spells.inGrimoire`, que já existe e não é usada.
- **Arquivos:** `SpellbookPanel.jsx`, `translations.js`.
- **Riscos:** baixo; o render test não confere o grimório.
- **Prioridade:** P1.

### B7. InventoryTab (`src/features/inventory/InventoryTab.jsx`)

**Problemas**
- [FATO] `addItem` grava o nome "Item" (vindo do rótulo) e o ícone 🎒 (`:22`).
- [FATO] "+ Vazio" do slot cria o item direto no slot (`:46`) e o editor abre embaixo da grade (`:54-58`).
- [FATO] Bônus de CA mostrado como `+{it.ac_bonus}` (`:42`): um negativo sai "+-1". Usar `signed`.
- [FATO] Rótulo do slot com `!text-[9px]` (`:37`) e marcadores de carga em 10px (`:81`). Moedas sem receber/gastar (`:61-67`).
- [FATO] A barra de carga é `aria-hidden` e o estado só aparece pela cor + texto (`:72`). Ok, mas tem 12px.
- [HIP] Dá para colocar dois itens no mesmo slot sem aviso. O motor resolve a CA, mas a interface não sinaliza; não mexer na regra.

**Proposta**
```
┌ Equipado ─────────────────────────┐ ┌ Mochila · 18,5 kg ────────── [Buscar] ┐
│ [Cabeça]   [Pescoço]  [Capa]      │ │ [+ Nome do item________] [1] [Adicionar]│
│  vazio +    Amuleto    vazio +    │ │ ▸ [ic] Corda de seda   ×1  4,5 kg  ⋯ 🗑 │
│ [Armadura] ...                    │ │ ▸ [ic] Ração (dia)     ×5  2,5 kg  ⋯ 🗑 │
│  Peitoral +5                      │ │                                         │
│  ┌ Editando: Peitoral ──────────┐ │ │ Mochila vazia. Digite o nome do que    │
│  │ (painel do item)  [Guardar na│ │ │ o grupo achou e tecle Enter.           │
│  │  mochila]                    │ │ └─────────────────────────────────────────┘
│  └──────────────────────────────┘ │
├ Moedas ───────────────────────────┤
│ PC 0   PP 12   PO 340   PL 2      │
│ [ 35 ] [PO ▾] [+ Receber] [− Gastar] │
├ Carga: Leve ── 18,5 de 45 kg ─────┤
│ ███████░░░░░░░░│░░░░░│            │
└───────────────────────────────────┘
```
- **Adição rápida** (`QuickAdd`): nome + qtd. Enter cria `{ name, qty, location: 'backpack' }` sem ícone e sem abrir. ⋯ abre os detalhes.
- No slot vazio, "+" abre uma linha `QuickAdd` *no próprio slot* e cria já com a `location`. O editor do slot aparece colado no slot selecionado (destaque `border-gold`).
- **Moedas:** `QuickAmount` com select de moeda; soma ou subtrai `ch[c]`, limitado a ≥ 0. **Sem conversão automática** entre moedas.
- **Guardar:** botão "Guardar na mochila" no editor do item equipado (`inventory.unequip`, chave já existente).
- Estados:
  - vazio da mochila: "Mochila vazia. Digite o nome do que o grupo achou e tecle Enter." / "Backpack is empty. Type what the party found and press Enter.";
  - busca sem resultado: "Nada na mochila com “{q}”".
- **Arquivos:** `InventoryTab.jsx`, `ItemRow.jsx`, `src/ui/QuickAdd.jsx`, `src/ui/QuickAmount.jsx`, `translations.js`.
- **Riscos:**
  - os valores de carga continuam vindo de `sheet.load`;
  - unidades: `QuickAdd` com peso precisa usar `fromDisplayWeight`, já que a interface pt mostra kg;
  - `create` resolve `undefined` na falha → só limpar o input se vier truthy.
- **Prioridade:** P0 (nome falso, "+-1"); moedas e QuickAdd P1.

### B8. ItemRow (`src/features/inventory/ItemRow.jsx`)

**Problemas**
- [FATO] O rótulo do select de ícone é o emoji "🙂" (`:29`): sem i18n e sem sentido para leitor de tela.
- [FATO] Os 12 campos aparecem sempre, inclusive CA, Des máx., penalidade e falha arcana (`:26-42`).
- [FATO] Fallback do ícone 🎒 (`:16`). Nota truncada em 10px (`:19`). Fechar com ▴ (`:41`).

**Proposta**
```
▾ [ic] Peitoral                                   ×1   13,5 kg   🗑
  Nome [Peitoral_________]  Local [Armadura ▾]  Ícone [▾]
  Qtd [1]  Peso (kg) [13,5]  Custo (po) [200]
  ▾ Proteção (CA)        ← aberto se ac_type, ac_bonus ou slot armor/offhand
     Tipo [Armadura ▾] Bônus [+5] Des máx. [3] Penalidade [4] Falha arcana % [25]
  ▸ Adicionar bônus de CA ← recolhido nos demais itens
  Notas [______________________________________]
```
- Rótulo do ícone via `t('inventory.icon')` "Ícone" / "Icon".
- Grupo "Proteção" recolhido para itens comuns.
- **Arquivos:** `ItemRow.jsx`, `translations.js`.
- **Riscos:** nenhum no contrato; os campos e o `update` continuam iguais.
- **Prioridade:** P1.

### B9. SummonsTab (`src/features/summons/SummonsTab.jsx`)

**Problemas**
- [FATO] Dano e cura de 1 em 1 (`:38-46`).
- [FATO] "SM {r}" fixo, fora do i18n (`:34`); a chave `summons.smLevel` existe e não é usada.
- [FATO] "⚔" emoji (`:50`). Habilidades em 10px (`:52`).
- [FATO] Rodadas: o placeholder é o maior NC entre todas as classes (`:16,55`). Sem "próxima rodada" global e sem estado "expirou".
- [FATO] Novo Dia não remove invocações (`server/repo.js:232-247`). Sem "Dispensar todas".

**Proposta**
```
┌ Invocações ativas (3) ────── [Próxima rodada −1] [Dispensar todas] [Convocar criatura] ┐
│ ┌ Cão Celestial  · CM I · +4 ┐ ┌ Águia Celestial · CM I  EXPIROU ┐                       │
│ │ PV ████████░░ 4 / 6         │ │ PV ██████████ 5 / 5               │                     │
│ │ [ 3 ] [Dano] [Curar]        │ │ Rodadas: 0   [Dispensar]          │                     │
│ │ CA 15 · Mordida +3 (1d6+1)  │ └───────────────────────────────────┘                     │
│ │ Rodadas [5] [−1]   Curar tudo · Dispensar │                                             │
│ └─────────────────────────────┘                                                           │
│ Vazio: Nenhuma criatura em campo. Convoque pela magia preparada na aba Magias ou aqui.    │
│        [Convocar criatura]                                                                │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```
- `QuickAmount` (Dano/Curar) no lugar de ±1, mantendo `NumberField` para o PV atual. Os limites de −10 e máx. continuam os do código atual (`:39,43,46`).
- "Próxima rodada": para cada invocação com `rounds_left > 0`, `update(..., { rounds_left: n-1 })`.
- Card com `rounds_left === 0`: borda `warn`, etiqueta "Expirou" e o botão Dispensar em destaque. **Não remove sozinho.**
- "Dispensar todas": `ConfirmButton` → remove em sequência. Toast "3 criaturas dispensadas" + undo, recriando com os mesmos campos (lossless: `name, ref_creature_id, data, hp_*, spell_level, rounds_left`).
- Badge de nível pela chave i18n: `summons.smShort` "CM {r}" / "SM {r}". **[A decidir]** "CM" para Convocar Monstro em pt; hoje está "SM" nos dois idiomas.
- **Arquivos:** `SummonsTab.jsx`, `QuickAmount`, `translations.js`.
- **Riscos:**
  - `tests/ui/render.test.jsx` (aba summons) só confere "Bonar";
  - o undo recria com id novo, sem dependentes (summons não tem filhos), então é seguro.
- **Prioridade:** P1 (dano rápido, próxima rodada); dispensar todas P2.

### B10. SummonModal (`src/features/summons/SummonModal.jsx`)

**Problemas**
- [FATO] As abas SM I–IX ficam sempre livres, mesmo quando o modal vem de uma magia de nível N (`:51-56`).
- [FATO] Cria uma criatura por vez e fecha (`:35-36`), embora o badge anuncie 1d3 ou 1d4+1 (`:67`).
- [FATO] Formulário personalizado só aparece se **nenhuma** criatura estiver selecionada, e não há como desmarcar (`:73,98-106`).
- [FATO] `closeOnBackdrop` com formulário editável (`:48`).
- [FATO] Sem carregando nem erro de `useRefData('ref_criaturas')` (`:17,26`).
- [FATO] Aviso de verificação em 10px (`:77`). "SM {r}" fixo (`:54`). Cor crua no hover (`:65`).

**Proposta**
```
┌ Convocar Monstro III — magia preparada ──────────────────────────── × ┐
│ (CM I)(CM II)(CM III)  CM IV…(desabilitadas)   [x] Convocação Aprimorada│
├──────────────────────────────┬──────────────────────────────────────────┤
│ [Buscar…]                    │ Cão Celestial                            │
│ Cão Celestial   1 · III      │ Médio · Bom · SRD                        │
│ Lobo Celestial  1d3 · II     │ ⚠ Dados não conferidos com a fonte       │
│ ...                          │ PV 13 (2d8+4) · CA 15                    │
│ ─────────────                │ FOR 17 DES 15 CON 17 …                   │
│ + Criatura personalizada     │ Ataque …                                 │
│                              │ Quantidade [−] 1 [+]  (lista III: 1)     │
│                              │ [Convocar 1 criatura]                    │
└──────────────────────────────┴──────────────────────────────────────────┘
```
- Prop nova `maxLevel`. Quando vem de magia (`SpellsTab.jsx:26`), as abas acima de `level` ficam desabilitadas com o title "A magia é Convocar Monstro {n}". Vindo da aba Invocações, tudo livre como hoje.
- Título com origem: "Convocar Monstro III — magia preparada".
- **Quantidade:**
  - `Stepper` 1..10; a dica reaproveita o texto do badge (1 / 1d3 / 1d4+1, que já está no código, `:67`);
  - **não rolar dados automaticamente**;
  - cria N linhas em sequência; `onSummoned` (marcar a preparada) roda uma vez só, se ao menos uma criação deu certo;
  - toast "{n} criaturas convocadas".
- "+ Criatura personalizada" vira item fixo no topo e no fim da lista (seleção especial `custom`), com o formulário no painel direito e `data-autofocus` no nome.
- Sem `closeOnBackdrop`.
- Estados:
  - carregando: `Loading`;
  - erro: `EmptyState` + [Tentar novamente];
  - lista vazia (filtro): "Nenhuma criatura nesta lista".
- [REC, depende de regra] Preencher `rounds_left` ao convocar a partir do NC **da classe que conjurou** (`cast.casterLevel`, disponível em SpellsTab). Precisa de uma função em `shared/rules`, com teste citando a duração de Summon Monster no SRD 3.5. **Conferir a fonte antes de implementar**: aqui é só hipótese, não inventar.
- **Arquivos:** `SummonModal.jsx`, `SpellsTab.jsx`, `SummonsTab.jsx`, `Stepper` (C), `translations.js`.
- **Riscos:**
  - o render test procura "Convocar" na aba de magias (atalho), então manter `t('spells.summon')`;
  - criação em loop: cada `create` é otimista e independente; numa falha parcial, informar "2 de 3 convocadas".
- **Prioridade:** P1 (nível travado, personalizado acessível); quantidade P1; rodadas automáticas P2, bloqueada por fonte.

### B11. JournalTab (`src/features/journal/JournalTab.jsx`)

**Problemas**
- [FATO] Fica em `Loading` quando `journal.data` é indefinido, inclusive em caso de erro (`:17`).
- [FATO] Sub-aba não persiste (`:16`).

**Proposta**
- Estado de erro: `EmptyState` "Não foi possível carregar o diário" + [Tentar novamente] (`journal.refetch()`).
- Sub-aba em `?sub=` via `useSearchParams` (sem mudar a rota de `SheetPage`), com fallback para `notes`.
- **Arquivos:** `JournalTab.jsx`, `translations.js` (`errors.loadJournal`).
- **Riscos:** o render test da aba journal não usa query string; o padrão continua 'notes'.
- **Prioridade:** P0 (erro) / P2 (persistência).

### B12. NotesPanel + RichText (`src/features/journal/NotesPanel.jsx`, `src/ui/RichText.jsx`)

**Problemas**
- [FATO] Nota nova vai para o fim (ver o resumo). Mudar a data também não reordena.
- [FATO] O campo de título usa o rótulo `common.name` "Nome" (`:51`). Sem foco no título depois de criar.
- [FATO] Data e prévia em 10px (`:38,40`).
- [FATO] Busca sem resultado mostra "Nada aqui ainda" (`:44`).
- [FATO] O `remove` não é aguardado e a seleção muda antes do resultado (`:64`). Se falhar, a nota volta, mas a seleção fica em outra.
- [FATO] RichText:
  - paleta em hex no componente (`RichText.jsx:8`), contra a convenção;
  - `aria-label` "Cor #e74c3c" (`:103`);
  - glifos ❝ ⌫ ― (`:99-107`);
  - só a dica "Ctrl+S salva" (`:109`), sem estado salvo/salvando/erro. A chave `common.saved` existe e não é usada. `onSave` ignora o resultado da promessa (`:38`).

**Proposta**
```
┌ Sessões ────────────── [+ Sessão de hoje] ┐ ┌──────────────────────────────────────────────┐
│ [Buscar nas sessões…]                     │ │ Título [Sessão 12 — A cripta____] Data [29/10]│
│ 29/10/2026                                │ │                                   [Excluir]   │
│ Sessão 12 — A cripta                      │ │ B I U S │ H2 H3 • 1. ❝ ― │ ●●●●● │ ⌫         │
│ prévia…                                   │ │                       ✓ Salvo · Ctrl+S salva  │
│ 22/10/2026                                │ │ (editor)                                      │
│ ...                                       │ │                                               │
│ Nada encontrado para "ogro" [Limpar]      │ │                                               │
└───────────────────────────────────────────┘ └──────────────────────────────────────────────┘
Vazio total: "Nenhuma sessão registrada. Comece a nota de hoje." [+ Sessão de hoje]
```
- **Ordem:** ordenar no componente para exibição por `session_date DESC, id DESC`, igual ao servidor (`server/repo.js:60`). É ordenação de exibição, não valor de regra.
- **Título:** rótulo `journal.title` "Título" / "Title". Depois do `add`, focar o input de título com ref (fora de modal; `data-autofocus` não serve aqui).
- **Indicador de salvamento:**
  - RichText aceita `onSave` que retorna promessa; truthy = salvo;
  - estados: "Não salvo" (dirty), "Salvando…", "✓ Salvo", "⚠ Não foi possível salvar — Ctrl+S tenta de novo" (`undefined`);
  - `NotesPanel` passa `html => actions.update(...)` (já retorna a promessa); a História passa `patchCharacter`.
- **Paleta:**
  - mover para `src/styles/noteColors.js` (ou tokens), documentada como "valores **persistidos** no HTML das notas, não são tema";
  - **não trocar os hex gravados**: notas antigas dependem deles;
  - rótulos i18n `editor.colors.{parchment,gold,red,orange,green,blue,purple,stone}`.
- Glifos da barra viram ícones SVG (C4).
- Excluir: `if (await actions.remove(...))` antes de mudar a seleção. Opcional: toast com undo (recria `title, content, session_date`, sem perda).
- **Arquivos:** `NotesPanel.jsx`, `src/ui/RichText.jsx`, novo `src/styles/noteColors.js`, `JournalTab.jsx` (História), `translations.js`.
- **Riscos:**
  - `tests/ui/interaction.test.jsx:107-119`: "foco e blur sem editar não regravam a nota". O indicador não pode disparar `onSave` sem edição; manter `dirty` como hoje;
  - DOMPurify e `setContent` sem mudança.
- **Prioridade:** P0 (ordem); P1 (indicador de salvamento, título, busca vazia); P2 (paleta e ícones).

### B13. ListDetail + details (grupo, NPCs, locais, missões)

**Problemas**
- [FATO] Cria com nome falso (`ListDetail.jsx:16`). Busca vazia mostra "Nada aqui ainda" (`:37`).
- [FATO] `onDelete` não é aguardado (`:43`).
- [FATO] NPC: placeholder 👤 (`details.jsx:39`) e não dá para remover a foto (a API só tem `PUT .../npcs/:id/photo`, conforme o CLAUDE.md).
- [FATO] Local lista as missões como texto não clicável (`details.jsx:64-67`). NPC não mostra as missões dele.
- [FATO] Chips de NPC na missão em 11px (`:94`). A busca não cobre ocupação (`ListDetail.jsx:13`).

**Proposta**
```
┌ NPCs ───────────────────────── ┐ ┌──────────────────────────────────────────┐
│ [Buscar ou criar NPC…        ] │ │ [foto]  Nome [Kush______]                │
│ [+ Criar "Bartolomeu"]         │ │         Ocupação [Sacerdote] Gênero [▾]   │
│ Kush · Sacerdote               │ │ Missões: [Ressuscitar Kush →]             │
│ ...                            │ │ Notas [.................................] │
└────────────────────────────────┘ │                              [Excluir]   │
                                   └──────────────────────────────────────────┘
```
- Mesmo padrão do FeatPicker: o texto da busca vira o nome em "+ Criar “{q}”". Com a busca vazia, cria com `name: ''` e foca o campo Nome do detalhe (prop `autoFocusName`).
- Ligações cruzadas: chips clicáveis "Missões" no NPC e no Local → trocam a sub-aba (`?sub=quests`) e selecionam a missão. Precisa do estado de seleção na URL (`?sel=`), ou de um `onNavigate` vindo do JournalTab.
- Foto do NPC: ícone SVG de silhueta. Remover foto fica **fora** (exige rota nova na API; registrar como pendência).
- Estados vazios por coleção:
  - Grupo: "Ninguém no grupo ainda" / "No party members yet";
  - NPCs: "Nenhum NPC ainda. Anote quem o grupo encontrou." / "No NPCs yet. Note who the party met.";
  - Locais: "Nenhum local ainda" / "No places yet";
  - Missões: "Nenhuma missão ainda" / "No quests yet".
- **Arquivos:** `ListDetail.jsx`, `details.jsx`, `JournalTab.jsx`, `translations.js`.
- **Riscos:** `create` com `name: ''` é aceito (zod `z.string().max(200)`, coluna `NOT NULL DEFAULT ''`); a lista já mostra "Sem título" (`ListDetail.jsx:32`).
- **Prioridade:** P0 (nome falso); P2 (ligações cruzadas).

### B14. ExchangeModal (`src/features/shell/ExchangeModal.jsx`)

**Problemas**
- [FATO] Rótulos:
  - no header da ficha, o botão diz "Exportar" (`SheetPage.jsx:32`);
  - na lista de personagens, diz "Importar" (`src/features/characters/CharacterListPage.jsx:23`);
  - o título é "Importar / Exportar".
- [FATO] O relatório junta tudo numa lista (`:56-60`):
  - as contagens viram uma frase longa (`exchange.importCounts`);
  - as linhas `report` estão em pt fixo (vindas do servidor);
  - `unknownKept` fica separado.
- [FATO] Todas as linhas `report` pedem revisão:
  - classe virou classe livre (`server/roll20/index.js:317`);
  - bônus de CA não aplicado (`:396`);
  - foco ou especialização de arma viraram bônus manual (`:429`);
  - talentos sem correspondência (`:499`).
- [FATO] `closeOnBackdrop` com o relatório (`:51`). Botão "Confirmar" (`:62`) quando deveria ser "Abrir ficha".
- [FATO] Sem estado de progresso no import, só `disabled` (`:77,81`). Export sem toast de sucesso (`:70-71`).
- [FATO] Não informa que o import cria um personagem **novo** (o importador cria; a ficha aberta não muda).
- [FATO] O export Roll20 não avisa o que fica de fora nem que a volta não foi testada (CLAUDE.md, seção Roll20).

**Proposta**
```
Header da ficha:  [⇅ Arquivos]      (pt "Arquivos" / en "Files")
┌ Arquivos ────────────────────────────────────────────────────── × ┐
│ EXPORTAR ESTA FICHA                                                 │
│ ┌ Grimoire (.json) ───────────┐ ┌ Roll20 (VTTES) ─────────────────┐ │
│ │ Cópia completa: fotos e     │ │ Ficha D&D 3.5. Não vão: recursos│ │
│ │ diário.                     │ │ de classe, invocações, diário,  │ │
│ │ [Baixar]                    │ │ foto e valores manuais.         │ │
│ └─────────────────────────────┘ │ ⚠ Abrir no Roll20 ainda não foi │ │
│                                 │   testado.            [Baixar]  │ │
│                                 └─────────────────────────────────┘ │
│ IMPORTAR  (cria um personagem novo; esta ficha não muda)            │
│ [Arquivo do Grimoire…]  [Arquivo do Roll20 (VTTES)…]                │
│ SEGURANÇA                                                           │
│ [Fazer backup agora]  Backup completo do banco em data/backups.     │
└─────────────────────────────────────────────────────────────────────┘
Durante o import:  ⏳ Importando "arquivo.json"…  (botões desabilitados)
Relatório (Roll20):
┌ Importado: Alescarion ──────────────────────────────────────────── × ┐
│ ✓ IMPORTADO        412 atributos lidos · 96 recalculados pelo Grimoire │
│ ⚠ REVISE À MÃO (3)                                                     │
│   • bônus de CA "Mage Armor" (+4) não aplicado…        → aba Principal │
│   • talentos sem correspondência: …                    → Talentos      │
│ 🗄 GUARDADO         8 campos sem equivalente — voltam no export Roll20  │
│   ▸ 37 vazios ou fórmulas da ficha (ignorados)                         │
│                                   [Fechar] [Abrir ficha importada]     │
└────────────────────────────────────────────────────────────────────────┘
```
- **Fase front, sem mudar a API:** os três grupos saem de `counts` (read/derived = Importado, `report[]` = Revise, preserved/extraCount = Guardado, empty = detalhe recolhido). O grupo do meio só aparece se `report.length`.
- **[REC, fase com API, aditiva]** Adicionar `_import.issues: [{ code, params }]` **ao lado** de `report` (strings mantidas), com os códigos `class_custom`, `ac_untyped`, `weapon_focus`, `feats_unmatched`. Com eles, o front traduz para en e cria links "→ aba". `tests/roll20` confere `report` por regex de nomes (`tests/roll20/*.test.js:109,211-212`), então o caminho aditivo não quebra nada.
- Sem `closeOnBackdrop` quando há relatório. Botão primário "Abrir ficha importada" (`data-autofocus`).
- Export: toast "Arquivo baixado" depois de `downloadJson` resolver.
- **Microcopy:**
  - `sheet.files` "Arquivos" / "Files";
  - `exchange.title` "Arquivos" / "Files";
  - `exchange.importNew` "Cria um personagem novo; esta ficha não muda." / "Creates a new character; this sheet is untouched.";
  - `exchange.roll20Missing` "Não vão: recursos de classe, invocações, diário, foto e valores manuais." / "Not included: class resources, summons, journal, photo and manual overrides.";
  - `exchange.roll20Untested` "Abrir no Roll20 um arquivo do Grimoire ainda não foi testado." / "Opening a Grimoire file in Roll20 hasn't been tested yet.";
  - `exchange.groupImported` "Importado" / "Imported";
  - `exchange.groupReview` "Revise à mão" / "Review by hand";
  - `exchange.groupKept` "Guardado" / "Kept";
  - `exchange.openSheet` "Abrir ficha importada" / "Open imported sheet";
  - `exchange.importing` "Importando…" / "Importing…";
  - `exchange.downloaded` "Arquivo baixado" / "File downloaded".
- O texto do Roll20 tem que ser conferido contra a lista "Não exportado ainda" do CLAUDE.md, que hoje cita: overrides, recursos de classe, invocações, diário e foto. Dano e dreno saem somados em `-temp`.
- **Arquivos:** `ExchangeModal.jsx`, `SheetPage.jsx:32` (rótulo; o botão do header pertence ao outro designer, alinhar com ele), `CharacterListPage.jsx:23` (deixar "Importar" na lista, onde só há import), `translations.js`. Fase API: `server/roll20/index.js` + `tests/roll20`.
- **Riscos:** `useImport` sem mudança; nenhum teste de UI cobre o modal.
- **Prioridade:** P0 (rótulo, clique fora, agrupamento); P2 (i18n do relatório via API).

### B15. Toast e Modal como fluxo (`src/ui/Toast.jsx`, `src/ui/Modal.jsx`)

**Problemas**
- [FATO] Toast:
  - `role="status"` e `aria-live="polite"` para tudo, inclusive erro (`Toast.jsx:41`);
  - erro persiste; sucesso some em 3 s; com undo, 6 s (`:19`); o timer não pausa no hover;
  - no máximo 4 visíveis (`:18`);
  - `undo` nunca é usado.
- [FATO] Modal:
  - Esc e × sempre fecham (`Modal.jsx:31,67`), sem guarda de rascunho;
  - `closeOnBackdrop` está em modais com input: SummonModal (`:48`), modal de magia (`SpellbookPanel.jsx:67`) e ExchangeModal com relatório.

**Proposta**
- Toast:
  - erros num contêiner `role="alert"` separado (ou `aria-live="assertive"`);
  - pausar o timer com hover ou foco no toast;
  - com undo, mostrar uma barra de tempo restante.
- Política de undo (padrão, sem substituir o `ConfirmButton` exigido):
  - **usar** onde recriar não perde nada: dispensar invocação(ões), excluir item, talento, sessão, local, jogador;
  - **não usar** em magia com preparações, NPC com foto (o arquivo é apagado), classe e recurso com usos;
  - **não usar** em toggles frequentes (conjurar, gastar ficha): o próprio controle é o desfazer, com rótulo visível.
- Modal: prop `confirmClose` (bool). Quando true, Esc, × e o backdrop (se habilitado) mostram no rodapé uma barra "Descartar alterações? [Continuar editando] [Descartar]" em vez de fechar. O foco vai para "Continuar editando".
- **Arquivos:** `Toast.jsx`, `Modal.jsx`, `tests/ui/interaction.test.jsx` (novos casos).
- **Riscos:** os testes de Modal (`interaction.test.jsx:69-104`) continuam válidos com o padrão `false`.
- **Prioridade:** P1 (`confirmClose` puxa o P0 do PrepareModal).

---

## C. Componentes novos (a consolidar com o designer do design system)

| Nome | Props | Comportamento | Onde usa |
|---|---|---|---|
| **TokenTrack** | `total`, `isUsed(idx)`, `onToggle?(idx)`, `hasNote?(idx)`, `variant: 'round'\|'diamond'`, `label`, `readOnly` | Grupo `role="group"`. Cada ficha é um botão com `aria-pressed` e `aria-label` "{label}: uso {i} de {total}, disponível/gasto". Gasto = preenchimento apagado **+** ícone de risco (não só opacidade). Mostra um ponto quando há nota. Sem `onDoubleClick`. | Recursos, slots espontâneos, resumo das preparadas |
| **QuickAmount** | `actions: [{ id, label, tone }]`, `onApply(id, n)`, `placeholder`, `ariaLabel`, `extra?` (ex.: select de moeda) | Input numérico + botões; Enter aplica a 1ª ação; limpa depois. Extraído do padrão do `HpTracker.jsx:17-29,54-60` (barra lateral do outro designer: alinhar para o HpTracker também usar). | PV da invocação, reserva de recurso, moedas |
| **QuickAdd** | `placeholder`, `onSubmit(values) → Promise`, `fields?` (ex.: qtd), `submitLabel` | Form inline. Só limpa se `await onSubmit` vier truthy (contrato de `useSheetActions`). Esc limpa. | Mochila, slot vazio, recurso, coleções do diário |
| **Notice** | `tone: info\|warn\|danger\|success`, `title?`, `children`, `action?`, `size: inline\|block` | Junta os avisos espalhados em 10–11px: ⚠ de fórmula, "não conferido" de criatura, tabela manual, Roll20 não testado. Mínimo de 12px; ícone SVG + texto (nunca só cor). | Recursos, CasterBlock, SummonModal, ExchangeModal |
| **Stepper** | `value`, `min`, `max`, `onChange`, `label` | − valor +; teclado ↑/↓. | Quantidade de convocação, rodadas |
| **Icon / GameIcon** | `name`, `size`, `title?` | SVG em `currentColor`, `aria-hidden` sem title. Conjunto mínimo: editar, excluir, restaurar, mais, desfazer, sol, mochila, silhueta, ataque, aviso, check, upload/download, citação, separador, limpar. | Tudo no escopo |
| **ItemIcon / ResourceIcon** | `value` (string gravada), `size` | Mapeia os emoji **gravados** (`ITEM_ICONS` em `shared/constants/equipment.js:19`, `RESOURCES.*.icon`) para SVG, com fallback para o próprio emoji. **Não migrar dados.** | ItemRow, InventoryTab, ResourcesPanel |
| **SaveStatus** | `state: idle\|dirty\|saving\|saved\|error` | Texto pequeno (12px) com ícone; `aria-live="polite"`. | RichText |
| **EmptyState** (já existe, `src/ui/layout.jsx:45-53`) | + `icon?` | Já tem `title/hint/action`: falta *usar* hint e action. Pedir só a prop `icon`. | Todas as abas |
| **Modal** (existe) | + `confirmClose` | Ver B15. | PrepareModal, SummonModal (personalizado), modal de magia |

Pedido transversal para o outro designer: um piso de 12px (`text-xs`) para tudo que é informação, deixando 10–11px só para metadado decorativo. E um utilitário de hover de linha baseado em token (troca `hover:bg-[rgba(255,255,255,0.03)]` em 4 arquivos).

---

## D. Fatiamento em fases

Toda fase termina com `npm test`, `npm run lint`, `npm run build` e revisão do diff, além de atualizar o CLAUDE.md (seção Front-end/UI) e o `learnings.md` quando houver surpresa. Toda chave i18n nova entra em pt **e** en (`tests/i18n`).

**F1 — Correções de fluxo confirmadas (P0, sem componente novo)**
- **Escopo:**
  - tirar os nomes falsos: criar com nome digitado ou vazio + foco em `InventoryTab`, `ResourcesPanel` (abrir a edição depois de criar) e `ListDetail`; acabar com os `.replace('+ ', '')`;
  - ordenar o `NotesPanel`;
  - estado de erro no `JournalTab`;
  - `ExchangeModal` sem `closeOnBackdrop` no relatório + "Abrir ficha importada";
  - Badge falso → `Button` no `CasterBlock:106`;
  - tirar `onDoubleClick` do `ResourcesPanel`;
  - `signed` em `InventoryTab:42`;
  - rótulo 🙂 → `t('inventory.icon')`;
  - `await` antes de trocar a seleção ao excluir (NotesPanel e ListDetail).
- **Arquivos:** os citados + `translations.js`.
- **Pronto quando:** criar item, recurso ou NPC nunca grava texto de rótulo; a nota nova aparece no topo; com o diário falhando aparece "Tentar novamente".
- **Testes:** em `tests/ui/interaction.test.jsx`, casos jsdom para (a) ordem do NotesPanel depois do create otimista e (b) JournalTab em erro.

**F2 — Conjurar e gastar (P0/P1)**
- **Escopo:** `TokenTrack`, `QuickAmount`, `Notice`; cards de preparada com Conjurar/Conjurada/↶; affordance de anotar uso; Gastar/Recuperar na reserva; Restaurar com confirmação quando há nota; `Modal.confirmClose` + `PrepareModal` com guarda e contador ×n.
- **Arquivos:** `CasterBlock.jsx`, `ResourcesPanel.jsx`, `PrepareModal.jsx`, `src/ui/Modal.jsx`, novos em `src/ui/`.
- **Pronto quando:** conjurar e desfazer são visíveis sem tooltip; Esc no PrepareModal sujo pede confirmação; o render test continua contendo "Convocar Monstro I", "Domínio" e "Feiticeiro 1".
- **Testes:** Modal `confirmClose` (Esc não fecha, Descartar fecha); TokenTrack (`aria-pressed`, um toggle por clique).

**F3 — Arquivos / Roll20, só no front (P0)**
- **Escopo:** rótulo do header (coordenar com o outro designer), layout em seções, relatório em 3 grupos com as contagens existentes, estado "Importando…", toast de download, avisos do export Roll20.
- **Arquivos:** `ExchangeModal.jsx`, `SheetPage.jsx:32`, `translations.js`.
- **Pronto quando:** dá para ver o que foi importado, o que revisar e o que ficou guardado, sem frase longa; a soma das contagens bate com `counts.total`.
- **Testes:** render jsdom do relatório com um `_import` falso (counts + 2 linhas) conferindo os 3 títulos.

**F4 — Inventário e saque (P1)**
- **Escopo:** `QuickAdd` na mochila e no slot; `QuickAmount` de moedas; ItemRow com o grupo "Proteção"; "Guardar na mochila"; busca local; estados vazios.
- **Arquivos:** `InventoryTab.jsx`, `ItemRow.jsx`, `src/ui/QuickAdd.jsx`.
- **Pronto quando:** saquear "Corda, 2, 5 kg" leva ≤ 1 formulário; os valores de carga continuam vindo de `sheet.load`; peso em kg convertido com `fromDisplayWeight`.

**F5 — Invocações (P1)**
- **Escopo:** dano/cura com `QuickAmount`; "Próxima rodada"; estado "Expirou"; "Dispensar todas" + undo; SummonModal com `maxLevel`, quantidade (`Stepper`), personalizado sempre acessível, sem `closeOnBackdrop`, loading/erro; i18n de "SM".
- **Arquivos:** `SummonsTab.jsx`, `SummonModal.jsx`, `SpellsTab.jsx`.
- **Pronto quando:** convocar 3 criaturas a partir de uma preparada marca a magia uma vez só e cria 3 cards.
- **Fora da fase:** rodadas automáticas, que dependem de conferir a fonte e criar a regra em `shared/rules`.

**F6 — Diário (P1/P2)**
- **Escopo:** `SaveStatus` no RichText (onSave com promessa); título "Título"; foco ao criar; busca "nada encontrado"; `?sub=` persistente; ligações cruzadas NPC/Local ↔ Missão; paleta movida para `src/styles/noteColors.js` com rótulos i18n (sem alterar os hex gravados).
- **Arquivos:** `RichText.jsx`, `NotesPanel.jsx`, `ListDetail.jsx`, `details.jsx`, `JournalTab.jsx`.
- **Pronto quando:** o teste "foco e blur sem editar não regravam" continua passando; um teste novo mostra "Salvo" depois de `onSave` resolver truthy e "Não foi possível salvar" com `undefined`.

**F7 — Ícones e tipografia (P2, depende do design system)**
- **Escopo:** `Icon`, `ItemIcon`, `ResourceIcon`; trocar ↺ ⚙ ⚠ ✓ ✕ ⚔ 👤 🎒 ❝ ⌫ ― nos arquivos do escopo; piso de 12px; hover de linha por token.
- **Pronto quando:** grep de `text-\[9px\]|text-\[10px\]` no escopo só acha metadado decorativo; nenhum `rgba(`/hex em componente do escopo.

**F8 — Opcional, com API (P2, exige aprovação separada)**
- `_import.issues` aditivo em `server/roll20/index.js` + testes em `tests/roll20`, para o relatório em en com links por aba.
- Remover foto de NPC (rota DELETE + teste em `tests/api`).
- Regra de duração de convocação em `shared/rules` com fonte citada.

---

## Fatos e hipóteses (resumo)

**Hipóteses a conferir no navegador:**
- duplo clique na ficha de recurso disparando dois toggles;
- jogador não percebendo o que mudou ao subir de nível;
- itens duplicados no mesmo slot sem sinalização causarem confusão.

**Lacunas conhecidas, que dependem de outra frente:**
- o rótulo do botão do header (`SheetPage`) e o `HpTracker` são da área do outro designer;
- as linhas do relatório Roll20 em pt fixo só se resolvem com mudança aditiva na API.

**Regras de D&D:** nenhuma foi criada. A duração de convocação ficou marcada como "conferir a fonte antes".

### Arquivos mais críticos para implementar
- `C:\projects\Grimoire\src\features\spells\CasterBlock.jsx`
- `C:\projects\Grimoire\src\features\feats\ResourcesPanel.jsx`
- `C:\projects\Grimoire\src\features\shell\ExchangeModal.jsx`
- `C:\projects\Grimoire\src\ui\Modal.jsx` (e `C:\projects\Grimoire\src\ui\Toast.jsx`)
- `C:\projects\Grimoire\src\features\journal\NotesPanel.jsx` (com `C:\projects\Grimoire\src\ui\RichText.jsx`)

Apoio: `C:\projects\Grimoire\src\features\inventory\InventoryTab.jsx`, `C:\projects\Grimoire\src\features\summons\SummonModal.jsx`, `C:\projects\Grimoire\src\features\summons\SummonsTab.jsx`, `C:\projects\Grimoire\src\i18n\translations.js`, `C:\projects\Grimoire\src\queries\characters.js` (contrato, sem mudança), `C:\projects\Grimoire\tests\ui\render.test.jsx`, `C:\projects\Grimoire\tests\ui\interaction.test.jsx`, `C:\projects\Grimoire\server\roll20\index.js` (só na F8).