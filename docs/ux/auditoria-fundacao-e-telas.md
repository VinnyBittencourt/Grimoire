# Auditoria UX/UI do Grimoire: fundação visual e telas principais (somente leitura)

**Escopo:** tokens, `src/ui/*`, AppHeader, lista de personagens, assistente de criação, ficha (SheetPage, Sidebar, HpTracker), aba Núcleo (`core/*`) e aba Perícias.

**Método:** só leitura de código. Não editei nada e não subi nem a API nem o Vite. Os contrastes foram calculados com `node -e`, usando os hex reais de `tokens.css` e a fórmula WCAG. Nenhum teste do projeto foi executado.

**Legenda:** **[F]** = fato confirmado no código · **[H]** = hipótese ou inferência · **[R]** = recomendação.

---

## Resumo: 7 achados mais importantes

1. **[F] O alcance da arma tem unidade inconsistente, com risco de dado errado.**
   - Em pt, a lista mostra o alcance em metros: `AttacksPanel.jsx:40` usa `distance(a.range_ft)`.
   - A edição pede pés (`(ft)` fixo em `AttacksPanel.jsx:61`) e grava o número cru em `range_ft`.
   - O IdentityPanel faz certo: `toDisplayDistance`/`fromDisplayDistance` em `IdentityPanel.jsx:29`.
   - **P0.**
2. **[F] A decomposição da CA não fecha a conta.**
   - A linha de parcelas em `DefensePanel.jsx:26` e `:30` omite `misc` (que no motor inclui `ac_temp`, ver `combat.js:58`).
   - Com Outros ou Temp diferente de 0, a soma visível não dá o total.
   - **P0.**
3. **[F] O Toast já aceita `undo`, mas ninguém usa.** O suporte está em `Toast.jsx:7` e `:45-48`. Quase não há grep de chamada com `{ undo }`. Dá para ter "desfazer dano/cura" sem mexer na API.
4. **[F] A ação `removePhoto` existe (`queries/characters.js:216`) e a chave i18n `sheet.removePhoto` também, mas nenhuma tela usa.** O mesmo vale para `list.updated`: a chave existe, `updated_at` vem da API (`repo.js:65`) e a lista não mostra.
5. **[F] `--color-text-dim` (#6b5a3a) dá 2,5–3,0:1 nos fundos reais.** É usado 65 vezes em JSX, quase sempre em texto informativo de 9–11px (cabeçalhos de tabela, dicas). Falha WCAG 1.4.3.
6. **[F] O foco do campo de PV atual é quase invisível.**
   - `HpTracker.jsx:39` força `!border-transparent`, e o `!important` vence `.field:focus { border-color }` (`index.css:183`).
   - `.field:focus` (0,2,0) também sobrescreve o anel global `:focus-visible` (`index.css:127`) com um brilho de 12% de alfa.
   - **[H]** Conclusão por especificidade CSS; não foi verificado no navegador.
7. **[F] O `computeSheet` só dá parcelas para CA, saves e perícias.**
   - Iniciativa, agarrar, corpo a corpo/distância, cada ataque e BBA por classe saem como número único (`combat.js:100-129`, `sheet.js:62-69`).
   - Os talentos são agregados sem guardar a fonte (`effects.js:42-99`).
   - Para "explicar a origem" sem recalcular no componente, falta uma camada `breakdown` em `shared/rules`.

---

## A. Fundação / Design System

### A1. Diagnóstico da fundação

| Tema | Evidência |
|---|---|
| Tipografia arbitrária | **[F]** 82 usos de `text-[9/10/11px]` no `src`; 38 no meu escopo (layout 4, Tabs 2, RichText 1, AppHeader 2, Lista 2, Assistente 6, HpTracker 5, Sidebar 4, Abilities 1, Attacks 1, Classes 2, Defense 6, Skills 2). `index.css:158` (`.section-title` 12px) e `:192` (`.label` 10px) usam px fixo. O piso real é 9px (`layout.jsx:29`, `SkillsTab.jsx:71`, `DefensePanel.jsx:81`). |
| `rgba` solto em componente | **[F]** `Button.jsx:3,5`, `ConfirmButton.jsx:34`, `HpTracker.jsx:57,59`, `Sidebar.jsx:31`, `FeatPicker:78`, `ListDetail:31`, `NotesPanel:37`, `SummonModal:65`, `CasterBlock:72`, `index.css:151` (`.panel::before`). |
| Hex em ícones | **[F]** `equipmentIcons.jsx` e `escolaIcons.jsx` têm dezenas de `#c9a84c` e `rgba(...)` inline. Isso fere a regra "sem hex em componente". |
| Ícones misturados | **[F]** Emoji: ⚔️ (`Sidebar:30`, `CharacterListPage:52`, `AttacksPanel:35`), 🏹 (`AttacksPanel:35`), 🎒 (`ItemRow:16`), ✨ (`ResourcesPanel:38`), ☀ (`Sidebar:71`). Glifos: ↺ (`DefensePanel:48`, `CombatPanel:23`, `ResourcesPanel:47`), ⚙ (`ResourcesPanel:48`), ✦ (`SkillsTab:41`), ● (`SkillsTab:71`), ▴▾ (`ClassesPanel:36`, `AttacksPanel:65`), ✕ (6 arquivos), ★ (classes de prestígio), × (Modal, Toast). Ao lado disso convivem os SVG `EquipSlotIcon`/`EscolaIcon`. |
| Estados | **[F]** Editável e só leitura não se distinguem: o derivado é texto e o editável é `.field`, mas no PV o editável parece texto (`HpTracker:39,43`). Não existe estilo de campo calculado/override, nem mensagem de erro de campo (só `aria-invalid` mudando a borda, `index.css:186`). O `disabled` é só opacidade. |
| Componente duplicado no lugar errado | **[F]** `IconButton` vive em `Button.jsx:21` (o CLAUDE.md o lista como se fosse separado). Usa `title` como única dica. |
| Informação só em `title` | **[F]** 28 `title=` em core/sheet/skills, por exemplo PV sugerido (`HpTracker:42`), máximo de graduação (`SkillsTab:86`), nome completo do atributo (`AbilitiesPanel:29`), "Calculado" da CA (`Sidebar:48`). `title` não aparece no teclado e demora no mouse. |

### A2. Escala tipográfica (tokens novos ou renomeados)

Em `tokens.css`, mantendo os nomes do DS e acrescentando:

```css
--font-size-2xs: 0.6875rem;  /* 11px — PISO. Só rótulos UPPERCASE com tracking e unidades */
/* xs 12 · sm 14 · base 16 · lg 18 · xl 20 · 2xl 24 (já existem) */
--font-size-3xl: 1.875rem;   /* 30px — número "herói": PV atual, CA na barra */
--line-height-tight: 1.15;
--line-height-snug: 1.3;
--line-height-normal: 1.5;
--tracking-label: 0.08em;
--tracking-caps: 0.14em;
```

No `@theme inline` de `index.css`: `--text-2xs: var(--font-size-2xs); --text-2xs--line-height: 1rem; --text-3xl: var(--font-size-3xl);`. Isso gera os utilitários `text-2xs` e `text-3xl`.

**Papéis.** Use o papel, não o tamanho; criar como classes em `index.css`:

| Papel (classe) | Tamanho | Fonte, cor | Uso |
|---|---|---|---|
| `.label` (existe; 10px passa a 2xs) | 2xs | Cinzel, uppercase, `tracking-label`, gold | rótulo de campo |
| `.col-head` (nova) | 2xs | Inter, uppercase, `tracking-label`, **muted** (não dim) | `th` das tabelas |
| `.caption` (nova) | xs | Inter, muted | dica, metadado, "Sugerido: 24" |
| corpo | sm | Inter, body/parchment | texto, inputs |
| `.num-part` (nova) | sm | Inter, `tabular-nums`, body | parcela (Base +3, Des +2) |
| `.num-total` (nova) | lg | Cinzel bold, parchment ou cor do tom | total em tabela |
| `StatBox` valor | xl | Cinzel bold | caixas |
| `.num-hero` (nova) | 3xl | Cinzel bold | PV atual, CA na barra |
| `.section-title` | xs (12px via token) | Cinzel 600, caps | título de seção |
| título de página | 2xl | Cinzel | Lista, Assistente |

**Regra de migração:**
- `text-[9px]` e `text-[10px]` passam a `text-2xs`.
- `text-[11px]` passa a `text-xs` quando é dica/corpo, ou a `text-2xs` quando é rótulo uppercase.
- Critério de pronto: `grep -E "text-\[[0-9]+px\]" src` retorna 0.

### A3. Espaçamento, raio, borda, sombra

- **Espaço [F]:** `--space-1..8` já coincidem com a escala de 4px do Tailwind.
- **Densidade [R]:**
  - padding de seção 16 (`--space-4`);
  - gap entre seções 16;
  - gap entre linhas de lista 6–8;
  - gap de grade de campos 8 (compacta) ou 12 (formulário).
  - Documentar no topo de `layout.jsx`.
- **Raio [F]:** `.field` usa `2px` fixo (`index.css:179`) e `.panel::before` também (`:152`). **[R]** Novo `--radius-xs: 2px`. Botões e caixas continuam em `--radius-sm`.
- **Tokens de cor novos [R]**, para substituir o `rgba` solto:
  - `--color-danger-faint: rgba(192,57,43,.14)`: Button danger hover, ConfirmButton armado, botão Dano.
  - `--color-success-faint: rgba(39,174,96,.12)`: botão Curar.
  - `--color-hover-faint: rgba(255,255,255,.03)`: 4 listas.
  - `--color-scrim: rgba(0,0,0,.6)`: legenda sobre a foto.
  - `--color-gold-hairline: rgba(201,168,76,.2)`: `.panel::before`.
  - `--color-magic-glow: rgba(160,122,217,.35)`: CasterBlock.
  - `--shadow-button: 0 2px 8px rgba(0,0,0,.4)`.
  - Utilitários `@theme`: `bg-bad-faint`, `bg-good-faint`, `bg-hover`, `bg-scrim`.
- **Tokens de acessibilidade [R]** (justificativa na seção C):
  - `--color-danger-text: #e8604f` (4,97:1 no pior fundo);
  - `--color-hp-text: #e06666` (5,01:1);
  - `--color-field-border: #8a6a35` (3,35:1, contraste não textual ≥3:1);
  - `--color-text-disabled` = valor atual do dim, só para desabilitado/decorativo.
  - O utilitário `text-dim` deixa de existir para texto informativo; usar `text-muted`.
- **Ícones em SVG [R]:** trocar `stroke="#c9a84c"` por `style={{ stroke: 'var(--color-gold-primary)' }}` ou `stroke="currentColor"` com `className="text-gold"`.
  - **[H]** `var()` dentro de atributo de apresentação SVG (`stroke="var(--x)"`) não é garantido pela especificação. Use `style` ou `currentColor`.

### A4. Estados (especificação)

| Estado | Visual |
|---|---|
| Hover em interativo | `bg-hover` + texto parchment ou gold |
| Foco | Anel global `--focus-ring`, em **todos** os controles. `.field:focus` passa a `border-color: gold; box-shadow: var(--focus-ring)`. Remover `!border-transparent` de campos e trocar por variante. |
| Disabled | opacity .45 + `cursor-not-allowed` + `aria-disabled`. Texto não informativo pode usar `--color-text-disabled`. |
| Erro de campo | borda `--color-danger-text` + `FieldError` (texto xs, ícone ⚠, `aria-describedby`). Hoje só existe a borda. |
| Editável | `.field` com `--color-field-border` |
| Calculado (só leitura) | texto sem caixa, `num-part`/`num-total`. Se tiver composição, sublinhado pontilhado e cursor de ajuda (é botão). |
| Override manual ativo | Badge "Manual" (tom warn) + "Calculado: N" em `.caption` + botão "Voltar ao calculado". Hoje é ↺ sem texto (`DefensePanel:48`, `CombatPanel:23`). |
| Valor ajustado | gold-hi + chip da parcela. Hoje só gold-hi (`AbilitiesPanel:33`): cor como único sinal. |
| Excedido/inválido (regras) | `Callout`/`Badge` warn com texto. Hoje: `text-bad` em pontos (`SkillsTab:30`) e borda vermelha em graduação. |

### A5. Sistema de ícones único

**[R]** Criar `src/ui/Icon.jsx` com:
- SVG inline, `viewBox 0 0 24 24`, `stroke="currentColor"`, `strokeWidth 1.75`, sem preenchimento colorido;
- tamanhos 14/16/20;
- `aria-hidden` por padrão; com `label`, vira `role="img"`.

Conjunto mínimo, desenhado no traço medieval já usado no EquipSlotIcon:

`sword` (⚔), `bow` (🏹), `backpack` (🎒), `sparkle` (✨), `sun` (☀ Novo Dia), `reset` (↺), `settings` (⚙), `pencil` (editar), `close` (✕/×), `chevron-up`/`chevron-down` (▴▾), `plus`, `trash`, `star` (perícia de classe ✦ e prestígio ★), `lock` (só treinada ●), `camera` (foto), `undo`, `warning`, `info`, `check` (✓), `dots` (menu), `shield`, `heart`.

`EquipSlotIcon` e `EscolaIcon` continuam como **ilustrações** (decorativas, 30px), só com as cores tokenizadas.

**Proibido:** emoji em UI. Critério de pronto: grep pelos glifos listados retorna 0 em `src/features` e `src/ui`.

### A6. Componentes novos ou alterados

**Alterados:**

1. **`StatBox`** (`layout.jsx:26`)
   - Props: `size: 'sm'|'md'|'lg'`, `breakdown?: Part[]`, `onClick?`.
   - Com `breakdown` ou `onClick`, vira `<button aria-haspopup="dialog" aria-expanded>` e abre `Popover` + `Breakdown`.
   - Rótulo em 2xs, nunca 9px.
2. **`Section`**
   - Props: `as='h2'|'h3'`, `editing?`, `onToggleEdit?`.
   - Com `onToggleEdit`, o cabeçalho mostra o botão `[✎ Editar]` / `[✓ Concluir]` (`aria-pressed`).
3. **`IconButton`** (mover para `src/ui/IconButton.jsx`, mantendo o reexport em `Button.jsx` para não quebrar imports)
   - Usa `Tooltip` no lugar de `title`.
   - Props: `size: 'sm'(24)|'md'(28)|'lg'(32)`, `tone: 'default'|'danger'`.
4. **`ConfirmButton`**
   - Variante `icon` (Icon trash, alvo mínimo 24×24).
   - Rótulo armado curto ("Confirmar?") e com largura reservada (`min-w`) para não empurrar o layout.
   - Prop `holdMs` (padrão 3000).
   - **[F]** Hoje o rótulo armado da lista é "Excluir {name} e todos os dados dele?" num botão de 11px (`CharacterListPage:63`).
   - Para exclusões irreversíveis, criar `ConfirmDialog`.
5. **`Toast`**
   - `role="alert"` para erros (hoje tudo é `status`/polite, `Toast.jsx:41`).
   - Pausar o timer com hover ou foco.
   - Nova API `toast.undoable(message, undoFn, { actionLabel })`, que dura 8 s.
   - Botões de 24px no mínimo.
6. **Campos (`fields.jsx`)**
   - Props novas: `hint`, `error` (renderiza `FieldError` e liga `aria-describedby`), `variant: 'box'|'inline'` (inline = sem caixa até hover/foco, mas com sublinhado pontilhado visível e ícone ✎ no foco; substitui os `!border-transparent`), `suffix` (unidade "m"/"ft"/"%" vinda do i18n).
   - `NumberField`: prop `stepper` (botões −/+ de 24px, `aria-label` traduzido).
   - **Contrato blur/Enter/Esc intocado.**
7. **`Checkbox`**: alvo de 24px (padding no label), mesmo sem texto visível. Prop `srLabel` obrigatória quando não houver label.
8. **`Tabs`**: gerar `id` por aba e `aria-controls`. O `tabpanel` (`SheetPage:66`) passa a ter `aria-labelledby`. Badge em 2xs, cor muted.
9. **`Badge`**: tom `warn`, mínimo 2xs, ícone opcional.

**Novos:**

10. **`Popover`**
    - Props: `trigger` (elemento), `open`, `onOpenChange`, `placement='bottom-start'|'right-start'`, `label`.
    - Não modal, `role="dialog"`, Esc e clique fora fecham, o foco volta ao gatilho.
    - Posição por `absolute` relativo a um wrapper `relative`, com fallback simples para cima perto da borda. Sem biblioteca nova.
11. **`Breakdown`**
    - Props: `title`, `total`, `parts: [{ key, label, value, note?, kind?: 'base'|'ability'|'item'|'feat'|'manual'|'penalty' }]`, `ignored?`, `override?: { value, computed }`.
    - Mostra uma equação vertical: cada linha é rótulo + valor assinado; linhas com valor 0 ficam ocultas por padrão; total em destaque; ignorados num Callout.
    - **Não calcula nada:** só exibe `sheet.breakdown`.
12. **`Tooltip`**: hover (atraso de 400 ms) e foco; `role="tooltip"` + `aria-describedby`; texto 12px; não interativo.
13. **`Menu`**: botão (`aria-haspopup="menu"`) + `role="menu"`/`menuitem`; ↑↓, Home/End, Esc, foco de volta. Uso: header ⋯, ações de linha.
14. **`InlineCreate`**
    - Props: `label` ("+ Ataque"), `placeholder`, `onCreate: async name => row|undefined`.
    - O clique troca por input com foco.
    - Enter ou blur com texto: cria; só limpa e fecha se o retorno for truthy (contrato de `actions`).
    - Esc, ou blur vazio: cancela.
    - Nunca cria linha com nome placeholder.
15. **`SegmentedControl`**: `role="radiogroup"`, setas, `options [{value,label,icon?}]`. Uso: idioma pt/en (hoje `aria-pressed`, `AppHeader:20-27`), corpo a corpo/distância, filtro de perícias, modo Mesa/Edição.
16. **`Callout`**: `tone info|warn|danger`, `icon`, `title?`, `children`, `action?`. Substitui `DefensePanel:33-37`, `:49`, o estouro de pontos e os avisos do assistente.
17. **`ConfirmDialog`**: `Modal` com título, texto de consequência e botão danger com foco inicial em **Cancelar** (`data-autofocus`). Opção `requireText` (digitar o nome) para excluir personagem.
18. **`EmptyState`**: `icon` e `action` já padronizados (a cor do hint passa de `text-dim` a `text-muted`).

---

## B. Telas e painéis

### B1. AppHeader (`shell/AppHeader.jsx`) e o papel do ExchangeModal no header

**Problemas:**
- **[F]** O indicador só tem "Salvando…" em 11px com `opacity-0` no repouso (`:16-18`). Não há estado "Salvo" nem "Erro de salvamento". Erros só aparecem em toast.
- **[F]** O seletor de idioma tem texto de 10px e `py-1` (`:23`): o alvo dá cerca de 22–23px **[H]** de altura, abaixo dos 24px.
- **[F]** Na ficha, o botão diz "Exportar" (`SheetPage:32`), mas o modal tem exportar, importar e backup (`ExchangeModal:65-89`). O rótulo não corresponde ao conteúdo.
- **[F]** A ficha não tem `h1`. O nome do personagem é `<span>` no header (`SheetPage:34`) e `h2` na Sidebar (`Sidebar:38`).

**Proposta:**
```
┌ [logo] ← Personagens │ Bonar ───────────────── ✓ Salvo  [⋯ Arquivo ▾]  [PT|EN] ┐
                                                  └ Exportar (Grimoire) / Exportar (Roll20) / Importar… / Fazer backup agora
```
- Estado de salvamento em 3 fases:
  - "Salvando…" (gold, spinner);
  - "Salvo" (muted, por 2 s e depois some);
  - "Não salvo — tentar de novo" (`danger-text`), ouvindo `useIsMutating` + `mutationCache` em erro. **[H]** Requer ler o cache de mutações do TanStack; viável sem mudar a arquitetura.
- Menu "Arquivo" (pt) / "File" (en). A ficha abre `ExchangeModal` com a seção certa, ou chama `downloadJson` direto.
- Idioma vira `SegmentedControl` de 28px.
- Nome do personagem como `h1` visível só no header, com a Sidebar mantendo um `h2`.

**Arquivos:** `AppHeader.jsx`, `SheetPage.jsx`, `CharacterListPage.jsx` (botão Importar), `ExchangeModal.jsx` (prop `section?`), `ui/Menu.jsx`, `translations.js`.

**Riscos:**
- `render.test.jsx` só procura "Bonar" e ">18<": baixo risco.
- O indicador de erro depende do contrato "nunca rejeita" (`queries/characters.js:113`). Não alterar.

**Prioridade:** P1 (salvo/erro), P2 (menu).

### B2. Lista de personagens (`CharacterListPage.jsx`)

**Problemas:**
- **[F]** Excluir é um botão de 11px, `text-dim` (2,5:1), com rótulo armado longo e 3 s para confirmar (`:62-70`), numa ação **irreversível** (cascade + fotos, CLAUDE.md). Não há desfazer.
- **[F]** Não mostra raça nem última atualização, embora `updated_at`, `race_id` e `race_name` venham da API (`repo.js:65`) e `list.updated` exista em i18n.
- **[F]** O placeholder sem foto é o emoji ⚔️ (`:52`).
- **[F]** O nível é calculado no componente com `reduce` (`:45`). É soma simples, mas o motor tem `characterLevel` **[R]**: usar `characterLevel(c.classes)` de `shared/rules/progression.js`.

**Proposta:**
```
SEUS PERSONAGENS                                   [+ Novo personagem]  [Importar]
Grimório de heróis…
┌──────────┐ ┌──────────┐ ┌──────────┐
│  [foto]  │ │  [brasão]│ │  ...     │
│ Bonar    │ │ ...      │
│ Clérigo 3 / Feiticeiro 1
│ Anão · Nível 4
│ Atualizado há 2 dias          [⋯]│ ← Menu: Abrir · Exportar · Excluir…
└──────────┘
```
- "Excluir…" abre `ConfirmDialog`:
  - pt: título "Excluir Bonar?"; texto "Isso apaga a ficha, as magias, o inventário, o diário e as fotos. Não dá para desfazer pelo app."; campo "Digite o nome para confirmar"; botões [Cancelar] [Excluir para sempre].
  - en: "Delete Bonar?" / "This removes the sheet, spells, inventory, journal and photos. It can't be undone in the app." / "Type the name to confirm" / [Cancel] [Delete forever].
- **[H]** Os backups automáticos (`server/backup.js`) talvez permitam recuperar, mas não há UI para isso. Não prometer na microcopy.
- Placeholder sem foto: Icon `shield` grande em `text-gold-lo`, ou as iniciais em Cinzel.

**Arquivos:** `CharacterListPage.jsx`, `ui/ConfirmDialog.jsx`, `ui/Menu.jsx`, `translations.js` (`list.deleteTitle`, `list.deleteBody`, `list.typeName`, `list.deleteForever`, `list.updated` já existe).

**Riscos:** o teste de lista procura "Bonar". O formato de data relativo precisa de `Intl.RelativeTimeFormat` pt/en, sem dependência nova.

**Prioridade:** P0 (confirmação forte), P1 (metadados).

### B3. Assistente de criação (`NewCharacterPage.jsx`)

**Problemas:**
- **[F]** Inputs de número controlados limitam a cada tecla: `Number(e.target.value) || 1` (`:136`, `:154`, `:178`). Apagar o campo vira "1" na hora, e digitar "18" depois de apagar dá "18" só por acaso. A experiência é confusa.
- **[F]** O CSS esconde as setas nativas, e o comentário diz "usamos os nossos" (`index.css:134`), mas não existe stepper no código (grep sem resultado).
- **[F]** "Digite os valores finais (já com ajustes raciais)" (`translations:37`): o usuário faz a conta de cabeça. O dado `race.atributos` está disponível (`:69-71`).
- **[F]** O indicador de etapas não é clicável (`:77-82`). O erro aparece só no rodapé central, em `text-bad` de 12px (`:186`), com 3,4:1 de contraste. "Próximo" fica desabilitado sem explicação no campo.
- **[F]** `autoFocus` no nome (`:87`). Fora de modal é aceitável, mas destoa da convenção.
- **[F]** A revisão mostra só totais (`:168-175`). O PV sugerido vem como dica de 11px `text-dim`.

**Proposta** (mesma estrutura de 4 passos; só a camada visual muda):
```
 ① Identidade ── ② Classes ── ③ Atributos ── ④ Revisão      (passos já visitados clicáveis)
┌ ATRIBUTOS ─────────────────────────────────────────────────┐
│ Digite os valores finais. Ajuste racial do Anão: CON +2, CAR −2  (Callout info)
│  FOR        DES        CON        INT        SAB        CAR
│ [−] 14 [+] [−] 12 [+] [−] 16 [+] ...                        │
│     +2         +1         +3                                │
└────────────────────────────────────────────────────────────┘
```
- `NumberField stepper` com rascunho local e limite **só no blur/Enter** (o mesmo `useCommitField`), em vez de limitar a cada tecla.
- Erro junto do campo: `FieldError` "Dê um nome ao personagem" abaixo do Nome, e "Próximo" habilitado que, ao clicar, foca o primeiro erro. É mais descobrível do que um botão desabilitado.
- A aplicação automática do ajuste racial seria regra nova (decidir se `*_base` guarda com ou sem raça). **[H]** Não proponho fazer na UI. Se desejado, ir para `shared/rules` com teste e decisão registrada (P2, fora do meu escopo de decisão).

**Arquivos:** `NewCharacterPage.jsx`, `ui/fields.jsx` (stepper), `ui/Callout.jsx`, `translations.js`.

**Riscos:**
- `render.test` procura "Humano".
- O body do POST não pode mudar (`:54-62`); manter `form.scores` numérico no envio.

**Prioridade:** P1.

### B4. SheetPage e Sidebar (`sheet/SheetPage.jsx`, `Sidebar.jsx`)

**Problemas:**
- **[F] Duplicação confirmada.**
  - A Sidebar mostra CA, toque, surpresa (`:47-51`), Fort/Ref/Von (`:52-54`), Init/BBA/Agarrar (`:56-60`) e C.a.C./Distância (`:61-64`).
  - O DefensePanel repete CA/toque/surpresa (`DefensePanel:19-21`) e o total dos saves (`:75`).
  - O CombatPanel repete Init/BBA/Agarrar/C.a.C./Dist. (`CombatPanel:12-16`).
  - Na aba Núcleo, o mesmo número aparece 2 vezes na tela.
- **[F] Inconsistência:** a Sidebar mostra corpo a corpo como valor único (`signed(sheet.attack.melee)`, `:62`), e o CombatPanel mostra a sequência iterativa (`meleeIterative`, `CombatPanel:15`). Para BBA, a Sidebar mostra a iterativa como `sub` (`:58`).
- **[F]** A foto só indica que é clicável no hover (`:31`, `opacity-0 group-hover:opacity-100`). Não há como remover a foto (ação `removePhoto` órfã).
- **[F]** As armas reais (tabela `attacks`) não estão na Sidebar. Na mesa, o que se consulta é "Maça +5, 1d8+2" **[H]** (inferência de uso, não medida).
- **[F]** "Novo Dia" tem emoji ☀ (`:71`). O modal usa `closeOnBackdrop` (ok, não tem edição) e não diz o que vai acontecer em números.
- **[F]** RM, RD e deslocamento ficam em linha de 11px (`:65-69`).

**Proposta** (a Sidebar é o "modo mesa": só totais, nada editável fora do PV):
```
┌──────────── SIDEBAR 300px ─────────────┐
│ ┌──────── foto 4:5 ────────┐ [📷]      │ ← IconButton camera SEMPRE visível (canto),
│ └──────────────────────────┘           │   abre Menu: Trocar foto / Remover foto
│ BONAR                                  │
│ Clérigo 3 / Feiticeiro 1               │
│ Nível 4 · Neutro e Bom                 │
├─ PV ─────────────────────── Morrendo ──┤ (ver B5)
├─ DEFESA ───────────────────────────────┤
│  CA 18 ⓘ    Toque 13    Surpresa 15    │ ← StatBox com breakdown (Popover)
│  Fort +5    Ref +4      Von +7         │
├─ COMBATE ──────────────────────────────┤
│  Inic. +3   BBA +3      Agarrar +4     │
│  C.a.C. +4  Dist. +7    (iterativos no Popover e em sub quando houver >1)
├─ ARMAS ────────────────────────────────┤
│  [sword] Maça       +4     1d8+1  20/×2 │ ← top N ataques (todos, com scroll se >4)
│  [bow]   Besta      +7     1d8   19–20/×2 · 24 m
├────────────────────────────────────────┤
│  Desl. 6 m · RM 12 · RD 5/mágica       │
│  [ sun  Novo Dia ]                     │
└────────────────────────────────────────┘
```
- **Regra de consistência:** em todo lugar, corpo a corpo e distância mostram `…Iterative.join('/')`, ou o primeiro valor com a sequência em `sub`. Escolher **um** formato.
- **Novo Dia:** o modal lista o que vai acontecer.
  - pt: "Restaura magias preparadas, espaços de magia e usos de recursos." e, com cura, "Cura natural: +4 PV (nível 4) e −4 de dano não letal."
  - Esses números já existem: `sheet.level` e a regra em `repo.js:239-243`. **[R]** A UI não deve recalcular a cura no componente; só exibir `sheet.level` como texto informativo, ou expor `restPreview` em `shared/rules`.

**Arquivos:** `Sidebar.jsx`, `SheetPage.jsx`, `ui/layout.jsx` (StatBox), `ui/Popover.jsx`, `ui/Breakdown.jsx`, `ui/Icon.jsx`, `translations.js`.

**Riscos:**
- **[F]** `render.test.jsx:83-86` espera `>18<` na página: manter a CA total como texto puro dentro de um elemento.
- Popover em SSR: só renderizar o conteúdo com `open`.

**Prioridade:** P0 (consistência dos iterativos), P1 (armas, foto, Novo Dia descritivo).

### B5. HpTracker (`sheet/HpTracker.jsx`)

**Problemas:**
- **[F]** O PV atual e o máximo são inputs disfarçados de texto (`:38-43`), com foco quase invisível (ver resumo, item 6).
- **[F]** "NL" fixo e só com `title` (`:58`).
- **[F]** Os rótulos "Temp."/"Não letal" já estão no i18n, mas em 10–11px.
- **[F]** Não há desfazer. Dano consome PV temporários primeiro (`:21-22`, comentário PHB p. 146).
- **[F]** O PV sugerido aparece só no `title` do máximo (`:42`).
- **[F]** A barra usa só a cor como sinal (`:45-47`, `aria-hidden`). O número está ao lado, então é aceitável, mas sem limiar textual.
- **[F]** O estado "ok" fica vazio. Os outros estados vêm em 10px `danger-light`.

**Proposta:**
```
┌ PV ───────────────────────────── [MORRENDO] (Badge danger, texto) ┐
│        18 / 24          +5 temp · 2 não letal                      │
│        ‾‾ ← num-hero com sublinhado pontilhado + ✎ ao focar         │
│ ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░  (role=meter aria-valuenow=18 max=24)             │
│ [  5  ] [ − Dano ] [ + Curar ] [⋯]  → Menu: Dano não letal / Editar PV temp. / Editar máximo (sugerido 24)
└────────────────────────────────────────────────────────────────────┘
```
- **Toast com desfazer** depois de cada aplicação:
  - pt: "−5 PV (2 dos temporários)" + [Desfazer]; en: "−5 HP (2 from temporary)" + [Undo].
  - O desfazer reaplica `patchCharacter` com os valores **anteriores** dos mesmos campos.
  - Se os campos mudaram de novo nesse meio tempo, o desfazer é recusado com o toast "Não dá para desfazer: o PV mudou depois." / "Can't undo: HP changed since."
- PV atual e máximo: `NumberField variant="inline"`, ou o clique abre um editor.
- Atalhos **[R]**: Enter = Dano (já é o submit, `:54`). Proposta: Shift+Enter = Curar, com dica visível em `.caption`.
- "NL" vira "Não letal" / "Nonlethal" dentro do Menu, com texto completo.

**Arquivos:** `HpTracker.jsx`, `ui/Toast.jsx`, `ui/fields.jsx`, `ui/Menu.jsx`, `translations.js` (`vitals.damageDone`, `vitals.healDone`, `vitals.undoStale`, `vitals.nonlethalDamage`).

**Riscos:**
- O desfazer depende de `actions.patchCharacter` resolver truthy; mostrar o toast só no sucesso.
- A lógica de dano/cura está no componente hoje (`:17-29`). **[R]** Mover para `shared/rules/hp.js` (`applyDamage`/`applyHealing`) com testes, já que é regra (PHB p. 146). Não muda o comportamento.

**Prioridade:** P0 (foco visível, desfazer), P1 (o resto).

### B6. Aba Núcleo: estrutura e "modo mesa × modo edição" (`core/CoreTab.jsx`)

**Problema [F]:**
- Sempre editável: 36 inputs só em Atributos (6×6, `AbilitiesPanel:38-44`), mais 13 em CA/Saves, 5 em Combate e todos de Identidade.
- A grade `xl:grid-cols-2` (`CoreTab:10`) só vira 2 colunas a partir de 1280px. Com a Sidebar de 300px, **[H]** em telas de 1280–1580px a área útil fica estreita.

**Proposta [R]:** edição por seção, não global.
- Cada Section de regra (Atributos, Defesa, Combate) abre em **modo leitura**, com [✎ Editar] no cabeçalho, e o estado fica em `useState` local.
- O modo global "Mesa/Edição" no header fica como P2, só se a edição por seção não bastar. **[H]** Num app de uso pessoal, a edição por seção resolve com menos estado.
- O que muda **durante o jogo** fica sempre acessível: PV (Sidebar), recursos e magias (outras abas). Dano e temporário de atributo também, pelo atalho "Ajuste rápido" no Popover do atributo (ver B7).

Nova ordem da aba Núcleo:
```
┌ ATRIBUTOS ───────────[✎]┐ ┌ DEFESA (CA + Saves) ─[✎]┐
├ COMBATE ─────────────[✎]┤ ├ CLASSES ───────────────┤
├ ATAQUES ───────[+ Ataque]┤ ├ IDENTIDADE ───────────┤
```

**Arquivos:** `CoreTab.jsx`, `ui/layout.jsx` (Section), cada painel.

**Riscos:** o `render.test` da aba core só verifica "Bonar". Os testes de interação de campo continuam válidos, porque o modo edição renderiza os mesmos `NumberField`.

**Prioridade:** P1.

### B7. AbilitiesPanel

**Problemas:**
- **[F]** São 6 colunas de input sempre visíveis.
- **[F]** O valor ajustado é sinalizado só pela cor gold-hi (`:26`, `:33`).
- **[F]** O modificador negativo usa `--color-hp` (`:36`), com 3,8:1 em fundo raised.
- **[F]** O nome completo do atributo fica só em `title` (`:29`).
- **[F]** Cabeçalhos de 10px `text-dim` (`:17`).

**Proposta:**

Modo leitura:
```
ATRIBUTOS                                         [✎ Editar]
FOR  Força          14   +2
DES  Destreza       18   +4   melhoria +2
CON  Constituição   12   +1   dano −2   ← chips (Badge) só das parcelas ≠ 0
INT  Inteligência   10   +0
```
- As parcelas vêm de `ch.<ab>_<part>`: é exibição de dado salvo, não recálculo. O valor e o modificador vêm de `sheet.abilities`.

Modo edição: a tabela atual, com
- `th` usando `.col-head` (muted);
- inputs com `--color-field-border`;
- uma coluna "= Valor" no fim, para a leitura ficar parcelas → total.

Modificador negativo: `--color-hp-text` + sinal "−" (já existe via `signed`).

**Arquivos:** `AbilitiesPanel.jsx`, `translations.js` (nomes completos já existem em `abilityNames`).

**Riscos:** nenhum na regra. Garantir que o chip de dano/dreno use `t('core.damage')`/`t('core.drain')`.

**Prioridade:** P1.

### B8. DefensePanel

**Problemas:**
- **[F]** A decomposição omite `misc`/temp (`:26`, `:30`, `grid-cols-8`), então a conta não fecha. **Bug P0.**
- **[F]** StatBoxes de CA duplicam a Sidebar (`:19-21`).
- **[F]** O aviso de bônus ignorados é `<p>` de 10px (`:33-37`), legível mas sem destaque.
- **[F]** O override é um ↺ só com tooltip, mais "Calculado: N" em 10px (`:48-49`).
- **[F]** Saves: a coluna "Outros" mostra o input `ch.<s>_misc`. O bônus de talento aparece em 9px `text-magic` embaixo (`:81`), e o `title` repete o mesmo texto (`:79`).
- **[F]** Placeholder "5/mágica" fixo em pt (`:91`), aparece também em en.

**Proposta** (modo leitura, uma equação por linha):
```
CLASSE DE ARMADURA                                            [✎ Editar]
 CA      18  = 10 + 5 armadura + 3 Des (máx. 3) + 0 tamanho … + 1 outros
 Toque   13  · Surpresa 15
 ⚠ Não somam (vale o maior do tipo): Deflexão +1 (Anel de Proteção)        ← Callout warn
 [Manual] CA definida à mão: 20 · Calculado: 18  [Voltar ao calculado]      ← só se override

TESTES DE RESISTÊNCIA
 Fortitude  +5 = 3 base + 1 Con + 1 mágico + 0 outros
 Reflexos   +4 = …
 Vontade    +7 = … + 2 talentos
 RM 12 · RD 5/mágica
```
- Em modo edição: os inputs atuais, agrupados por "Bônus manuais de CA" e "Ajustes de resistência". A coluna Talentos vira uma coluna **só leitura** própria, não um rodapé de 9px.
- Placeholder de RD vai para o i18n: `core.drPlaceholder` = pt "ex.: 5/mágica" / en "e.g. 5/magic".
- **Dados [F]:** `ac.parts` (incluindo `misc`), `ac.ignored`, `ac.computed` e `saves[s].{base,ability,magic,misc}` existem. `effects.saves[s]` existe à parte, mas `saves[s].misc` já inclui o talento (`combat.js:94`). Para separar misc, temp e talento sem conta no componente, o `breakdown` deve expor as três parcelas (fase F4).

**Arquivos:** `DefensePanel.jsx`, `ui/Callout.jsx`, `ui/Breakdown.jsx`, `translations.js`.

**Riscos:** a regra de empilhamento e a interpretação documentada (CLAUDE.md "Mapeamento dos campos") não podem ser reinterpretadas na UI; só exibir `ignored`.

**Prioridade:** P0 (`misc` ausente, placeholder), P1 (redesenho).

### B9. CombatPanel

**Problemas:**
- **[F]** As 5 StatBoxes duplicam a Sidebar (`:12-16`).
- **[F]** Os rótulos são concatenados: `${t('vitals.init')} ${t('common.misc')}` (`:19-27`), o que impede ordem de palavras natural em pt e en ("Inic. Outros").
- **[F]** "BBA Manual" com ↺ sem texto (`:23`).
- **[F]** Nenhuma composição: o motor não devolve parcelas para iniciativa, agarrar e ataques (`combat.js:100-115`).

**Proposta:**
```
COMBATE                                                   [✎ Editar]
 Iniciativa     +3      = Des +3 + outros 0 + talentos 0
 BBA            +3/−2   = Clérigo 3 (+2) + Feiticeiro 1 (+0)   [Manual: …]
 Agarrar        +4      = BBA +3 + For +1 + tamanho 0
 Corpo a corpo  +4/−1   = BBA +3 + For +1 + tamanho 0 + outros 0
 Distância      +7/+2   = BBA +3 + Des +4 + …
```
- i18n com chaves inteiras: `core.initMisc` "Outros (iniciativa)", `core.babManual` "BBA manual", `core.grappleMisc`, `core.meleeMisc`, `core.rangedMisc`.
- O BBA por classe pede `babFor(prog, level)` por linha (`progression.js:19`). A soma pode não bater por arredondamento entre classes. **[H]** Conferir em `baseAttackBonus` (`progression.js:34`) se a soma é por classe; se for, o breakdown por classe fecha.

**Arquivos:** `CombatPanel.jsx`, `shared/rules/breakdown.js` (novo), `sheet.js`, `tests/rules/breakdown.test.js`, `translations.js`.

**Riscos:** mudar a forma de retorno de `initiative()`/`grapple()` quebraria testes de regra. **[R]** Não mudar; acrescentar `sheet.breakdown` à parte.

**Prioridade:** P1 (P0 para as chaves i18n concatenadas, se for corrigido junto do i18n).

### B10. AttacksPanel

**Problemas:**
- **[F]** Cria a linha com nome placeholder "Arma" antes de o usuário digitar (`:18`).
- **[F]** Alcance em "(ft)" editado cru × exibido em metros (`:40` × `:61`). **P0.**
- **[F]** Textos fixos: "(min)" (`:59`), "×" como rótulo (`:60`), placeholders "1d8", "P/S/B" (`:53`, `:62`), "×1" (`:56`).
- **[F]** A linha resumida não tem cabeçalho de coluna: ataque, dano, crítico e alcance são números soltos (`:37-40`).
- **[F]** Emoji 🏹/⚔️ (`:35`).
- **[F]** O "fechar" ▴ fica no fim do formulário (`:65`), e a linha não tem chevron indicando que expande.

**Proposta:**
```
ATAQUES                                                      [+ Ataque]
            ATAQUE   DANO      CRÍTICO     ALCANCE
[sword] Maça    +4/−1  1d8+1     20/×2       —        [▾] [🗑]
[bow]   Besta   +7/+2  1d8       19–20/×2    24 m     [▴] [🗑]
  ┌ Nome [Besta leve      ]  Tipo (Corpo a corpo | Distância)  Atributo [Des ▾] …
  │ Crítico: margem a partir de [19] · multiplicador ×[2]
  │ Alcance [24] m        Tipo de dano [ex.: P]   Munição [20]
  └ Composição: BBA +3 + Des +4 + tamanho 0 + melhoria 0 + outros 0   (Breakdown)
```
- `InlineCreate`: "+ Ataque" vira input com o placeholder "Nome da arma (ex.: Espada longa)". Enter cria `{ name, kind:'melee', damage_ability:'str' }`, que hoje é o padrão.
- Desfazer exclusão (leaf, sem dependentes): o toast "Besta excluída · [Desfazer]" recria com o snapshot.
  - **[H]** O id muda e a linha vai para o fim (`position`); avisar no código.
- Alcance com `toDisplayDistance`/`fromDisplayDistance` e `suffix={t('units.distance')}`.
- Chaves i18n novas:
  - `core.attack.critFrom`: "Margem a partir de" / "Threat from";
  - `core.attack.critMult`: "Multiplicador" / "Multiplier";
  - `core.attack.dicePlaceholder`: "ex.: 1d8" / "e.g. 1d8";
  - `core.attack.typePlaceholder`: o texto exato das abreviaturas de tipo em pt precisa ser conferido no livro. **Não inventar:** até lá, usar "ex.: perfurante" / "e.g. piercing".
- Cabeçalhos de coluna: `core.attack.colAttack`, `colDamage`, `colCrit`, `colRange`.

**Arquivos:** `AttacksPanel.jsx`, `ui/InlineCreate.jsx`, `ui/Toast.jsx`, `translations.js`.

**Riscos:**
- `render.test` cria "Besta" com `range_ft: 80` e verifica só que renderiza.
- **[H]** Conferir se `server/schemas.js` aceita no POST de `attacks` as colunas de um snapshot (sem `id`, `character_id`, `position`). Se o `.strict()` recusar alguma, o desfazer falha com 400. Filtrar o snapshot pela whitelist.

**Prioridade:** P0 (unidade, i18n), P1 (InlineCreate, desfazer, cabeçalhos).

### B11. ClassesPanel

**Problemas:**
- **[F]** "+ Classe" cria Guerreiro 1 direto (`:21`). É dado válido, não placeholder de nome, mas soma nível na hora e mexe nos recursos (refetch em `queries:132`).
- **[F]** Excluir classe: ✕ com 2 cliques; os dependentes (recursos, slots, magias preparadas) somem em cascata. Não há aviso disso.
- **[F]** `d{def.hd}` em 10px dim (`:35`).
- **[F]** O rodapé "Nível N · Sugerido pelas regras: N" fica em 11px dim (`:78`).

**Proposta:**
- "+ Classe" abre um `Popover` com Select de classe + nível e o botão [Adicionar]. Só cria ao confirmar.
- Excluir passa a `ConfirmDialog`: "Remover Clérigo 3? Magias conhecidas e preparadas, espaços e recursos desta classe também serão apagados." **[H]** Confirmar a lista exata no cascade de `server/migrations/001`.
- DV vira Badge "d8" com rótulo acessível "Dado de vida d8".

**Arquivos:** `ClassesPanel.jsx`, `ui/Popover.jsx`, `ui/ConfirmDialog.jsx`, `translations.js`.

**Riscos:** baixos.

**Prioridade:** P1.

### B12. IdentityPanel

**Problemas:**
- **[F]** É uma grade densa de 4 colunas e 18 campos, toda editável (`:15-43`).
- **[F]** Usa `placeholder="—"` em Select (`:24`, `:31`), aceitável.
- **[F]** "Deslocamento (m)" já está certo.

**Proposta:**
- Agrupar em "Básico" (nome, jogador, raça, tendência, divindade, tamanho, deslocamento, XP), "Aparência" (gênero, idade, altura, peso, olhos, cabelo, pele) e "Personalidade" (idiomas, defeito, personalidade).
- "Aparência" e "Personalidade" ficam colapsáveis (`<details>` estilizado).
- Sem modo leitura obrigatório: o painel é raramente usado em jogo **[H]**.

**Prioridade:** P2.

### B13. Aba Perícias (`skills/SkillsTab.jsx`)

**Problemas:**
- **[F]** "+ Perícia personalizada" cria a linha com `custom_name` = "Perícia personalizada" (`:33`, via `replace('+ ', '')`, o que é frágil se a tradução mudar).
- **[F]** "ACP" fixo (`:95`), "●" e "✦" com `title` (`:41`, `:71`), "+" de especialização sem padding (`:103-105`).
- **[F]** Perícia "só treinada" sem graduação aparece com `opacity-50` na linha inteira (`:56`). Isso derruba o contraste de tudo, inclusive dos inputs que o usuário precisa usar para dar graduação.
- **[F]** O estouro de pontos é só cor (`:30`).
- **[F]** A coluna "Outros" é input de `row.misc`. O bônus de talento aparece como Badge calculado por `calc.misc - row.misc` no componente (`:97`). É derivação simples, mas é conta no componente: o `breakdown` resolve.
- **[F]** O total não explica a origem, embora `skillTotal` devolva `ranks`, `ability`, `misc`, `synergy`, `acp` e `size` (`skills.js:33-42`).
- **[F]** A coluna sem cabeçalho `{''}` (`:47`) e `<th className="w-8" />` (`:48`) não têm nome para leitor de tela.
- **[F]** A busca é input solto sem rótulo visível (só `aria-label`).

**Proposta:**
```
PERÍCIAS        Pontos: 22 de 24 · 2 livres     [🔎 Buscar perícia…]  (Todas|Treinadas|De classe)  [+ Perícia]
                ⚠ 3 pontos acima do disponível   ← Callout só quando excede (texto, não só cor)
 ★  PERÍCIA                    ATRIB.  TOTAL  GRAD.  OUTROS   OBSERVAÇÕES                AÇÕES
 ★  Concentração                CON    +9 ⓘ   [6]    [0]
    Esconder-se                 DES    +1 ⓘ   [0]    [0]      Armadura −4 · Tamanho +4
 🔒 Conhecimento (arcano)        INT    —      [0]    [0]      Só treinada: precisa de graduação
 ★  Ofícios (ferraria)          INT    +5     [2]    [0]                                 [+ especialização] [🗑]
```
- ★ = perícia de classe, como `Checkbox` com ícone `star` e rótulo acessível "Perícia de classe". Linha de classe com texto parchment **e** ícone.
- 🔒 = Icon `lock` + texto "Só treinada" visível. A linha bloqueada mostra o total como "—" em muted. **Não usar opacidade na linha.**
- Badge "Armadura −4" (pt) / "Armor −4" (en). Chave nova `skills.acpShort`: pt "Armadura {n}" / en "Armor check {n}" (hoje "−{n} ACP").
- Total clicável abre o Breakdown: graduação, atributo, outros, talentos, sinergia, tamanho, armadura.
- Graduação acima do máximo: `FieldError` inline "Máx. 7" (já existe `skills.maxRanks`), além da borda.
- `InlineCreate` para perícia personalizada, com placeholder "Nome da perícia".
- Filtro com `SegmentedControl` (o atual "Só treinadas" vira uma opção). **[R]** "De classe" é filtro novo, só de exibição (usa `calc.classSkill`).
- Cabeçalhos nomeados: "Observações" (`skills.notesCol`), "Ações" (`common.actions`) com `sr-only` onde fizer sentido.

**Arquivos:** `SkillsTab.jsx`, `ui/InlineCreate.jsx`, `ui/SegmentedControl.jsx`, `ui/Breakdown.jsx`, `ui/Icon.jsx`, `translations.js`.

**Riscos:**
- `skill_id` personalizado usa `Date.now()` (`:33`); manter.
- Desfazer exclusão de perícia personalizada é seguro (leaf). Para especialização de perícia múltipla, recriar com o mesmo `skill_id` e `custom_name`.

**Prioridade:** P0 (opacidade da linha, "ACP", cor como único sinal nos pontos), P1 (Breakdown, InlineCreate, filtros).

---

## C. Acessibilidade (valores reais dos tokens)

**Fundos:**
- `bg` #0d0902
- `surface` #1e1206
- `raised`/`wood-dark` #2a1a0a, que é o pior ponto do gradiente `.panel`
- `sunken` ≈ #140c04 (35% de preto sobre surface)

**Contraste de texto (pior fundo = raised; melhor = bg):**

| Token | Hex | Contraste | Veredito (texto pequeno, 4,5:1) |
|---|---|---|---|
| parchment | #f0e6c8 | 13,5–16,0 | ok |
| body | #c0a882 | 7,3–8,7 | ok |
| gold | #c9a84c | 7,4–8,7 | ok |
| muted | #9b8a6a | 5,0–5,9 | ok |
| **dim** | #6b5a3a | **2,5–3,0** | **falha** (65 usos em JSX, quase todos informativos: `th`, dicas, DV, "Nível N") |
| **danger (`text-bad`)** | #c0392b | **3,1–3,7** | **falha** (pontos excedidos, erro do assistente, ConfirmButton armado, hover de excluir) |
| danger-light | #e74c3c | 4,4–5,2 | limítrofe em raised (4,40) |
| **hp** | #c94444 | **3,5–4,2** | **falha** como texto (modificador negativo, rótulo "PV" em 10px) |
| goldDark (`gold-lo`) | #8a6e2a | 3,5–4,1 | só borda; ok como não texto |
| ac / save / magic / warn / success | — | 5,0–8,6 | ok |
| texto do botão gold (#1a1208) | — | 3,83 na ponta escura do gradiente, 8,10 no centro | **[H]** pode falhar nas bordas, onde não costuma haver texto; tirar o `gold-dark` das pontas ou subir para `gold-primary` |

**Correções [R]:**
- dim passa a muted para informação;
- `--color-danger-text` #e8604f (4,97 em raised);
- `--color-hp-text` #e06666 (5,01).

**Contraste não textual (WCAG 1.4.11, 3:1):**
- **[F]** Borda de campo `wood-border` #6b4a1a: 2,1–2,5:1, falha. Nova `--color-field-border` #8a6a35: 3,35–3,87.
- **[F]** `border-subtle` #3a2810: 1,2–1,4. Só para divisórias decorativas, nunca como único limite de controle.
- **[F]** As bordas dos tons (`hp-border` sobre `hp-bg` = 1,53; `save-border` = 2,18) envolvem os botões Dano/Curar (`HpTracker:57,59`). O texto do botão tem contraste, mas o limite do controle não. **[R]** Usar `bg-*-faint` de preenchimento ou a borda no tom do texto.

**Foco:**
- **[F]** O anel global existe (`index.css:127`), mas `.field:focus` o substitui por borda gold + brilho fraco (`:183`).
- **[F]** No PV, `!border-transparent` anula até a borda (`HpTracker:39,43`).
- **[R]** `.field:focus-visible { box-shadow: var(--focus-ring) }` e nenhum `!border-*` em campos.

**Alvos de clique (WCAG 2.5.8, 24×24):**
- **[F]** `ConfirmButton` ✕ com `px-1 text-xs` (cerca de 12×16) em Attacks, Classes e Skills.
- **[F]** O "+" de especialização não tem padding (`SkillsTab:103`).
- **[F]** O `Checkbox` tem 14px (`fields.jsx:96`); sem label, como no SkillsTab, o alvo é só a caixa.
- **[F]** O seletor de idioma tem cerca de 22px **[H]**.
- **[F]** O `IconButton` tem 28px: ok.

**Cor como único sinal:**
- **[F]** Atributo ajustado só em gold-hi (`AbilitiesPanel:33`).
- **[F]** Perícia de classe só muda a cor do nome; o checkbox ajuda, mas sem rótulo visível.
- **[F]** Pontos excedidos só mudam de cor (`SkillsTab:30`).
- **[F]** A perícia bloqueada usa opacidade + ● com `title`.
- **[F]** O tom da barra de PV vem com o número (aceitável).

**Semântica:**
- **[F]** `tabpanel` sem `aria-labelledby` (`SheetPage:66`).
- **[F]** Toast de erro sem `role="alert"`.
- **[F]** `th` vazios em Skills (`:47-48`).
- **[F]** Ficha sem `h1`.
- **[F]** Informações só em `title` (28 ocorrências no escopo).
- **[F]** O Modal está correto (foco preso, Esc, devolução do foco), com teste em `tests/ui/interaction.test.jsx:69-105`.

**Movimento:** **[F]** `prefers-reduced-motion` já é respeitado (`index.css:218`). O Popover e o Tooltip novos devem usar `.animate-fade`.

---

## D. Fatiamento em fases (cada uma revisável sozinha)

Comandos em toda fase: `npm test`, `npm run lint`, `npm run build`. A API e o Vite nunca sobem contra `data/`.

**F0: tokens e contraste (sem mudar layout)**
- Escopo:
  - tokens novos da seção A2/A3;
  - `@theme` (`text-2xs`, `text-3xl`, `bg-bad-faint`…);
  - `.label`, `.section-title` e `.col-head` com tokens;
  - `.field` com `--color-field-border` e foco com anel;
  - substituir o `rgba` dos componentes;
  - `text-dim` informativo passa a `text-muted`;
  - `text-bad` em texto passa a `--color-danger-text`.
- Arquivos: `tokens.css`, `index.css`, `ui/*`, e os arquivos do escopo com `text-[Npx]`. O outro designer faz os dele, ou se combina uma varredura única.
- Pronto quando:
  - `grep -E "text-\[[0-9]+px\]"` = 0 no escopo;
  - `grep "rgba(" src --include=*.jsx` = 0 fora de `assets/icons`;
  - nenhum `!border-transparent` em campo.
- Testes: os 3 comandos. Risco baixo: `render.test` compara texto, não classe.

**F1: i18n e bugs de exibição (P0)**
- Escopo:
  - alcance com conversão de unidade (`AttacksPanel:61`);
  - `misc` na decomposição da CA (`DefensePanel:26,30`);
  - "(ft)", "(min)", "×", "ACP", "NL", "5/mágica" e placeholders para o i18n;
  - rótulos concatenados do CombatPanel em chaves inteiras;
  - iterativos consistentes entre Sidebar e CombatPanel.
- Pronto quando: o grep desses literais em `src/features` dá 0, e `tests/i18n/keys.test.js` passa com as chaves novas em pt e en.
- Testes novos sugeridos:
  - em `render.test`, a aba core em pt **não** contém "(ft)";
  - um teste de regra opcional confirmando que a soma de `ac.parts` + 10 = `ac.computed`.

**F2: ícones**
- Escopo: `ui/Icon.jsx`; troca de emoji e glifos no escopo; `EquipSlotIcon`/`EscolaIcon` com cores via `style`/`currentColor`.
- Pronto quando: o grep dos glifos da seção A5 dá 0 no escopo, e o SVG não tem hex.
- Risco: o SSR do `render.test` vê o mesmo texto.

**F3: estados e componentes base**
- Escopo:
  - `Tooltip`, `Popover`, `Callout`, `SegmentedControl`, `Menu`, `ConfirmDialog`, `InlineCreate`;
  - `fields` com `hint`/`error`/`variant`/`suffix`/`stepper`;
  - `IconButton` separado (com reexport);
  - `ConfirmButton` com variante `icon` de 24px;
  - `Toast` com `undoable`, `role=alert` e pausa;
  - `Tabs` com `aria-controls`.
- Pronto quando houver testes jsdom em `tests/ui/interaction.test.jsx` para:
  - Popover (abre, Esc, foco volta);
  - InlineCreate (Enter cria; Esc não cria; vazio não cria; falha mantém o texto);
  - `toast.undoable` (o botão chama o callback);
  - Menu (setas e Esc).
- Os testes atuais de campo continuam verdes **sem alteração**.

**F4: composição de valores (regras)**
- Escopo:
  - `shared/rules/breakdown.js`, chamado por `computeSheet`, gerando `sheet.breakdown = { ac, touch, flatFooted, saves{fort,ref,will}, initiative, grapple, melee, ranged, bab (por classe), attacks{[id]}, skills{[id]} }`;
  - cada item com `[{ key, value, source? }]`, separando talento, misc e temp.
- Não muda nenhum retorno existente.
- Pronto quando houver `tests/rules/breakdown.test.js` com:
  - a soma das parcelas igual ao total para cada item;
  - casos de multiclasse, override de CA/BBA, Des limitada por `max_dex`, sinergia e armadura em Natação ×2.
- Os testes de `rules/combat.test.js` não mudam.

**F5: Sidebar e HpTracker**
- Escopo:
  - redesenho B4/B5 com StatBox + Breakdown;
  - lista de armas;
  - botão de foto visível + remover;
  - Novo Dia descritivo;
  - PV inline com foco;
  - desfazer dano e cura;
  - `applyDamage`/`applyHealing` em `shared/rules/hp.js` com testes (PHB p. 146).
- Pronto quando:
  - `render.test` "barra lateral: CA 18" continua verde;
  - um teste jsdom de "dano → desfazer restaura `hp_current`/`hp_temp`" passa, com `actions` mockado.

**F6: Núcleo em modo leitura/edição**
- Escopo: Section com `onToggleEdit`; Abilities, Defense e Combat em leitura (equações) com edição; tirar as StatBoxes duplicadas dos painéis.
- Pronto quando:
  - a aba core abre sem inputs nas três seções;
  - [Editar] mostra os campos atuais;
  - o teste jsdom alterna o modo e confirma que o `NumberField` salva no blur.

**F7: criação e exclusão nas listas do escopo**
- Escopo: InlineCreate em Ataques e Perícias personalizadas; Popover de "+ Classe"; desfazer exclusão de ataque e perícia personalizada (com snapshot filtrado pela whitelist de `server/schemas.js`); ConfirmDialog para classe.
- Pronto quando:
  - nenhum `actions.create` do escopo manda nome placeholder;
  - um teste de API garante que o POST do snapshot é aceito por `.strict()`, se houver dúvida.

**F8: Perícias**
- Escopo: B13 completo (ícones de classe e treinada, sem opacidade, Callout de pontos, Breakdown, filtros, cabeçalhos nomeados).
- Pronto quando: o `render.test` da aba skills passa, e um teste jsdom do filtro "De classe" passa.

**F9: Lista e Assistente**
- Escopo: ConfirmDialog com nome digitado; metadados (raça, atualizado); stepper e limite só no blur; erros inline; etapas visitadas clicáveis.
- Pronto quando: os testes "lista de personagens" e "assistente de criação" continuam verdes, e um teste jsdom confirma que apagar o campo de atributo não vira 1 até o blur.

**F10 (P2): Header e extras**
- Escopo: estado Salvo/Erro; menu Arquivo; agrupamento do IdentityPanel; desfazer Novo Dia.
- O desfazer do Novo Dia **exige mudança de API**: `POST /rest` precisaria devolver ou aceitar um snapshot (magias preparadas `used`, `spell_slots.used`, `resource_uses`, `pool_used`, PV), conforme `repo.js:232-247`. Pela regra do CLAUDE.md, isso precisa de aprovação e de teste em `tests/api`. Até lá, manter a confirmação com a descrição do que será restaurado.

---

### Fora do meu escopo, mas encontrado
- **[F]** `effects.js:83` gera notas com "ataque"/"dano" fixos em pt; elas aparecem em en. Afeta a aba Talentos.
- **[F]** ResourcesPanel e InventoryTab criam linhas com nome placeholder (`ResourcesPanel:21`, `InventoryTab:22`). O `InlineCreate` da F3 serve para eles.
- **[F]** O relatório de importação do ExchangeModal pode ser fechado clicando fora (`closeOnBackdrop`) sem navegar para o personagem importado (`ExchangeModal:50`).

### Arquivos críticos para a implementação
- C:\projects\Grimoire\src\styles\tokens.css
- C:\projects\Grimoire\src\index.css
- C:\projects\Grimoire\src\ui\layout.jsx
- C:\projects\Grimoire\src\ui\fields.jsx
- C:\projects\Grimoire\src\ui\Toast.jsx
- C:\projects\Grimoire\shared\rules\sheet.js (mais o novo C:\projects\Grimoire\shared\rules\breakdown.js)
- C:\projects\Grimoire\src\features\sheet\Sidebar.jsx
- C:\projects\Grimoire\src\features\sheet\HpTracker.jsx
- C:\projects\Grimoire\src\features\core\DefensePanel.jsx
- C:\projects\Grimoire\src\features\core\AttacksPanel.jsx
- C:\projects\Grimoire\src\features\skills\SkillsTab.jsx
- C:\projects\Grimoire\src\i18n\translations.js
- C:\projects\Grimoire\tests\ui\render.test.jsx e C:\projects\Grimoire\tests\ui\interaction.test.jsx
