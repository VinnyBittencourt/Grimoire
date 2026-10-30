# Plano de refinamento de UI/UX — Grimoire

Consolidação de duas auditorias somente leitura feitas em 2026-10-29 (código, sem abrir o app no navegador):

- [auditoria-fundacao-e-telas.md](auditoria-fundacao-e-telas.md): design system, lista, assistente, barra lateral, PV, aba Principal, Perícias.
- [auditoria-funcionalidades.md](auditoria-funcionalidades.md): Talentos/Recursos, Magias, Inventário, Invocações, Diário, Arquivos/Roll20, Toast/Modal.

As auditorias trazem a evidência (`arquivo:linha`), os wireframes e a microcopy pt/en de cada tela. Este arquivo define **a ordem e o escopo das fases**. Cada fase precisa de aprovação própria (regra do CLAUDE.md).

Legenda: **[F]** fato conferido no código · **[H]** hipótese a confirmar no navegador.

## Objetivo

Uma ficha que se **lê** na mesa e se **edita** na preparação, com:

- hierarquia clara: o total em destaque e a composição sob demanda;
- toda ação visível sem depender de tooltip;
- desfazer onde errar é comum;
- texto legível (piso de 12px para informação) e contraste WCAG AA;
- um só sistema de ícones, com o visual medieval mantido.

## Princípios (valem para todas as fases)

1. **Ler ≠ editar.** Em modo leitura, um número não aparece como input; a edição é explícita (por seção).
2. **Todo número se explica.** Clicar num total abre a composição dele, que vem de `sheet.breakdown`. O componente não faz conta.
3. **Ação com rótulo.** Ícone sozinho só com nome acessível e tooltip real (teclado + mouse), nunca `title` como única pista.
4. **Nada é criado com nome falso.** A linha nasce do que o usuário digitou.
5. **Errou, desfaz.** Toast com "Desfazer" para dano, cura e exclusões sem dependentes. Exclusões em cascata usam `ConfirmDialog` com a consequência por escrito.
6. **Cor nunca é o único sinal.** Sempre há texto ou ícone junto.
7. **Contratos intocados:** campos salvam no blur/Enter e cancelam com Esc; `useSheetActions` resolve `undefined` na falha; i18n pt/en; tokens; regras só em `shared/rules`.

## Bugs confirmados que entram primeiro (UX-0)

| # | Problema [F] | Onde |
|---|---|---|
| 1 | Alcance da arma: a lista mostra metros, mas a edição pede pés ("(ft)" fixo) e grava o número cru | `AttacksPanel.jsx:40,61` |
| 2 | A composição da CA omite "outros/temp", então a conta visível não fecha | `DefensePanel.jsx:26,30` × `combat.js:58` |
| 3 | Itens, recursos, NPCs etc. criados com o nome do botão via `.replace('+ ', '')`, gravado no idioma da UI | `InventoryTab:22`, `ResourcesPanel:21`, `ListDetail:16`, `SkillsTab:33`, `SpellbookPanel:67` |
| 4 | A sessão nova aparece no fim da lista: o servidor ordena por data decrescente, mas o create otimista faz append | `queries/characters.js:130`, `repo.js:60` |
| 5 | Diário fica em "Carregando…" para sempre se `/journal` falhar | `JournalTab.jsx:17` |
| 6 | Relatório de import some com um clique fora e não leva ao personagem importado | `ExchangeModal.jsx:51` |
| 7 | "Preparar Magias" no estado vazio é um Badge que parece botão e não é | `CasterBlock.jsx:106` |
| 8 | Duplo clique numa ficha de recurso abre a nota **e** alterna o uso duas vezes [H forte] | `ResourcesPanel.jsx:66-68` |
| 9 | Bônus de CA negativo exibido como "+-1" | `InventoryTab.jsx:42` |
| 10 | Textos fixos fora do i18n: "(ft)", "(min)", "×", "ACP", "NL", "5/mágica", "SM {r}", "🙂", rótulos concatenados ("Inic. Outros") | `AttacksPanel`, `SkillsTab`, `HpTracker`, `DefensePanel`, `SummonsTab`, `ItemRow`, `CombatPanel` |
| 11 | Ataque iterativo mostrado de dois jeitos (barra lateral: valor único; Combate: sequência) | `Sidebar.jsx:62`, `CombatPanel.jsx:15` |
| 12 | Perícia "só treinada" sem graduação com `opacity-50` na linha inteira, inclusive no input que o usuário precisa usar | `SkillsTab.jsx:56` |
| 13 | Excluir nota ou item do diário troca a seleção antes do resultado | `NotesPanel.jsx:64`, `ListDetail.jsx:43` |
| 14 | PrepareModal descarta o rascunho com Esc/× sem perguntar | `PrepareModal.jsx:9,45` |

## Fases

Toda fase termina com `npm test`, `npm run lint`, `npm run build`, revisão do diff, CLAUDE.md atualizado e `learnings.md` quando houver surpresa. Nenhuma sobe a API contra `data/`.

| Fase | Escopo | Depende de | Risco |
|---|---|---|---|
| **UX-0 Correções** | os 14 itens acima (o 14 com uma guarda simples no próprio modal), sem componente novo | — | baixo |
| **UX-1 Fundação visual** | escala tipográfica (`text-2xs` 11px só para rótulo caps; informação ≥ 12px); tokens de contraste (`text-dim` informativo → `muted`, `--color-danger-text`, `--color-hp-text`, `--color-field-border`); tokens `*-faint`/`scrim`/`hover` no lugar dos `rgba` soltos; anel de foco em todos os campos (fim do `!border-transparent`); classes de papel `.col-head`, `.caption`, `.num-part`, `.num-total`, `.num-hero` | — | baixo (os testes comparam texto, não classe) |
| **UX-2 Componentes base** | `Icon` (SVG `currentColor`); `Tooltip`; `Popover`; `Notice` (avisos); `Menu`; `SegmentedControl`; `ConfirmDialog`; `QuickAdd` (criação inline); `QuickAmount` (valor + ações, extraído do PV); `TokenTrack` (fichas de uso/slots); `Stepper`; `SaveStatus`; `Modal.confirmClose`; `Toast.undoable` + `role=alert` + pausa no hover; campos com `hint`/`error`/`variant=inline`/`suffix`/`stepper`; `Tabs` com `aria-controls`; alvos ≥ 24px | UX-1 | médio (testes jsdom novos para cada um) |
| **UX-3 Composição no motor** | `shared/rules/breakdown.js` → `sheet.breakdown` (CA, toque, surpresa, saves, iniciativa, agarrar, ataques, BBA por classe, perícias), separando talento/outros/temp; `applyDamage`/`applyHealing` em `shared/rules/hp.js` (PHB p. 146). Não muda nenhum retorno existente | — | médio (regra; testes com soma = total, multiclasse, override, `max_dex`, Natação ×2) |
| **UX-4 Barra lateral e PV** | barra lateral = modo mesa (só totais clicáveis com composição, armas, deslocamento/RM/RD); PV com número herói editável visível, Dano/Curar com desfazer, não letal no menu; foto com botão sempre visível + remover (ação já existe); Novo Dia dizendo o que restaura e que apaga as notas de uso | UX-2, UX-3 | médio |
| **UX-5 Aba Principal** | Atributos, Defesa e Combate em leitura (equações) com [Editar] por seção; fim das StatBoxes duplicadas; Ataques com cabeçalho de colunas, criação inline, desfazer exclusão; "+ Classe" com escolha antes de criar e ConfirmDialog com a cascata; Identidade agrupada | UX-2, UX-3 | médio |
| **UX-6 Perícias** | ícones de classe/só treinada com texto; aviso de pontos excedidos; total com composição; filtro Todas/Treinadas/De classe; cabeçalhos nomeados | UX-2, UX-3 | baixo |
| **UX-7 Magias** | card de preparada com "Conjurar" / "Conjurada ↶"; resumo de slots com `TokenTrack`; PrepareModal com contador ×n, slots livres e guarda de rascunho; grimório com editar explícito e aviso ao excluir magia preparada; SummonModal travado no nível da magia, com quantidade e criatura personalizada sempre acessível | UX-2 | médio (render test exige "Convocar Monstro I", "Domínio", "Feiticeiro 1") |
| **UX-8 Talentos e recursos** | "x de y restantes"; "Anotar uso" visível; reserva com Gastar/Recuperar; Restaurar confirma quando há nota; criar recurso inline; FeatPicker com contagem, "nada encontrado" e "Criar “{busca}”"; descrições com "mais/menos" | UX-2 | baixo |
| **UX-9 Inventário** | adição rápida (nome + qtd) na mochila e no slot; moedas com Receber/Gastar; item com grupo "Proteção" recolhido; "Guardar na mochila"; busca | UX-2 | baixo (peso em kg com `fromDisplayWeight`) |
| **UX-10 Invocações** | Dano/Curar com valor; "Próxima rodada" para todas; estado "Expirou"; "Dispensar todas" com desfazer | UX-2 | baixo |
| **UX-11 Diário** | indicador Salvando/Salvo/Erro no editor; campo "Título" com foco ao criar; busca vazia; sub-aba lembrada (`?sub=`); ligações NPC/Local ↔ Missão; paleta das notas em arquivo próprio com rótulos i18n (sem alterar os hex já gravados) | UX-2 | médio (teste "foco e blur sem editar não regravam" deve continuar verde) |
| **UX-12 Arquivos e cabeçalho** | botão "Arquivos" no lugar de "Exportar"; modal em seções (Exportar / Importar — cria personagem novo / Segurança); export Roll20 avisando o que não vai e que a volta não foi testada; relatório em 3 grupos (Importado / Revise à mão / Guardado) com "Abrir ficha importada"; cabeçalho com Salvo/Erro; idioma como `SegmentedControl` | UX-2 | baixo |
| **UX-13 Lista e assistente** | cartão com raça e "atualizado há…"; excluir personagem com `ConfirmDialog` (digitar o nome); assistente com stepper, limite só no blur, erros junto ao campo e etapas visitadas clicáveis | UX-2 | baixo |
| **UX-14 Varredura final** | critérios globais: `grep "text-\[[0-9]+px\]" src` = 0; nenhum `rgba(`/hex em componente (exceto paleta persistida das notas); nenhum emoji/glifo de UI em `src/features` e `src/ui`; checagem de contraste | todas | baixo |

As telas (UX-4 a UX-13) trocam os seus próprios ícones e tamanhos ao serem redesenhadas; a UX-14 só fecha o que sobrar.

## Fora destas fases (exigem aprovação separada: API ou regra)

- `_import.issues` com códigos no relatório Roll20, para traduzir as linhas para en e linkar a aba (aditivo em `server/roll20/index.js` + `tests/roll20`).
- Remover foto de NPC (rota `DELETE` + `tests/api`).
- Desfazer o Novo Dia (o `POST /rest` precisaria devolver um snapshot).
- Duração automática de Convocar Monstro (regra em `shared/rules` com fonte conferida).
- Aplicar o ajuste racial no assistente (decidir se `*_base` guarda o valor com ou sem raça).

## Decisões do usuário (2026-10-29)

1. **Leitura × edição:** um botão Editar por seção.
2. **Convocar Monstro nos badges:** manter "SM" (inglês) nos dois idiomas.
3. **Excluir personagem:** só diálogo de confirmação (sem digitar o nome).

## Estado (2026-10-30)

O usuário aprovou executar o plano inteiro. Implementado, com cada tela reescrita uma vez (as correções da UX-0 entraram junto da tela correspondente, para não fazer trabalho em dobro):

- **UX-0:** os 14 itens. O 8 (duplo clique) foi resolvido removendo o `onDoubleClick`; a nota abre por "Anotar uso" ou clique direito.
- **UX-1 a UX-3:** tokens/contraste/foco, componentes base, `breakdown.js` e `applyDamage`/`applyHealing` com testes.
- **UX-4 a UX-13:** todas as telas.
- **UX-14:** `grep text-[Npx]` = 0; nenhum `rgba(`/hex em `src/features` e `src/ui`; nenhum emoji/glifo de UI.

Verificação: `npm test`, `npm run lint`, `npm run build` e screenshots (Chrome headless) de uma instância de teste com dados fictícios numa pasta vazia do scratchpad.

**Pendências conhecidas:**
- As ilustrações de `src/assets/icons` (`equipmentIcons`, `escolaIcons`) ainda têm ~270 cores fixas. `var()` em atributo de apresentação SVG não é garantido e não foi conferido na tela; fica para uma tarefa própria.
- As linhas do relatório de import do Roll20 continuam em pt fixo (vêm do servidor): exige a mudança de API `_import.issues` (fora destas fases).
- O ícone personalizado de recurso (`class_resources.icon`, emoji) não aparece mais na interface (todos usam o ícone SVG de recurso); o dado continua salvo e exportado.
- Leitores de tela e navegação só por teclado foram cobertos por atributos (`aria-*`, foco visível) e testes jsdom, sem teste com leitor de tela real.

## Verificação visual

As auditorias foram feitas lendo o código. Para conferir cada fase na tela sem tocar nos dados reais: instância de teste com `GRIMOIRE_DATA_DIR` apontando para uma cópia (ver `learnings.md`, "Instância de teste"), mediante aprovação.
