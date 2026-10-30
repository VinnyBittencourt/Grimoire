# Relatório: 5 fichas da comunidade lançadas no Grimoire

**Data:** 2026-10-30.

**Como foi feito:**
- Cinco agentes, cada um no papel de um jogador, criaram um personagem original pela API de uma **instância de teste**: pasta de dados vazia no scratchpad, portas 3015/3013, sem tocar em `data/`.
- Cada personagem seguiu a estrutura de uma ficha usada pela comunidade.
- Os agentes conferiram os cálculos do motor (`computeSheet`) contra o SRD 3.5 (repositório `olimot/srd-v3.5`) e testaram os exports Grimoire e Roll20.
- Nenhum arquivo do projeto foi editado pelos agentes.

**Legenda:**
- **[F]** fato: testado na API ou visto no código. Os três achados mais graves (Novo Dia, Graça Divina e local do item) foram reconferidos no código depois.
- **[H]** hipótese ou estrutura de ficha não conferida na fonte.

Os relatórios individuais completos estão nos arquivos de trabalho de cada jogador (scratchpad, fora do git). Este documento consolida e remove as repetições.

---

## 1. Resumo executivo

- **O núcleo de regras está sólido.** Bateram com o SRD, nos 5 personagens:
  - ataque base multiclasse, saves base, ataque por arma, CA com empilhamento, toque e surpresa;
  - perícias com sinergia, tamanho e penalidade de armadura (Natação ×2), pontos de perícia;
  - slots e CD de mago, druida, bardo e paladino, recursos de classe automáticos, PV sugeridos e limites de carga.
- **O export Grimoire faz ida e volta sem perda** (5 de 5). O caminho **Roll20 perde dados** em todos os casos, alguns sem aviso.
- **Os 6 problemas mais graves:**
  1. **O Novo Dia apaga dado:** zera todos os recursos, inclusive cargas de varinha, usos semanais e foco psiônico, e apaga as anotações de uso.
  2. **Itens com `location` fora da lista** são aceitos pela API, somem da tela e mesmo assim contam como equipados.
  3. **Regras faltando:** Graça Divina do paladino, efeitos da carga, Foco em Magia/Perícia, Esquiva Sobrenatural e Fineza com Arma.
  4. **Pontos de perícia retroativos:** o modificador de Int atual é aplicado a todos os níveis.
  5. **Dados de referência errados:** listas padrão de magias do paladino e do druida, meio-elfo, halfling, textos de classe e pré-requisito de Convocar Melhorado.
  6. **Faltam estruturas inteiras:** companheiro permanente (montaria, companheiro animal, familiar), psiônicos, mago especialista e metamágica, Convocar Aliado da Natureza, aptidões de classe pela UI e recursos por período.

---

## 2. As fichas e os personagens

| Jogador | Ficha de referência | Estrutura conferida? | Personagem (id na instância de teste) |
|---|---|---|---|
| J1 | Ficha oficial D&D 3.5 da WotC ("Character Record Sheet", 2003) | **[H]** de memória; a busca não achou fonte confiável | Mago Conjurador 7 humano, com familiar, criação de itens e metamágica (id 3) |
| J2 | Roll20 "D&D 3.5" (`charsheet_3-5.html`, 3.551 atributos) | [F] HTML baixado do GitHub | Druida 6 meio-elfa, com companheiro animal e forma selvagem (id 12; import VTTES id 18; ida e volta id 19) |
| J3 | Myth-Weavers "D&D 3.5" | **[H]** o site exige login (não contornado); usado o layout clássico 3.5 | Ladino 5 / Guerreiro 2 halfling, com duas armas (id 4; cópias 8 e 9) |
| J4 | PCGen `csheet_fantasy_std` + bloco de estatísticas SRD do PCGen | [F] templates baixados do GitHub do PCGen; formato Hero Lab **[H]** | Paladino 6 anão, com montaria especial (id 5; cópias 13 e 14) |
| J5 | Dyslexic Character Sheets 3.5 (fichas Psion, Bard, Psionic, Psicrystal); Mad Irishman só tem fichas gerais | [F] fichas em branco do repositório open source | Bardo 3 / Psion 3 gnomo (id 15) |

---

## 3. O que funciona (conferido com o SRD)

| Área | Casos conferidos |
|---|---|
| Ataque base e saves | multiclasse somando por classe (J1, J3, J5); paladino, druida e mago |
| Ataques | por arma, iterativos, duas armas com −2 manual (J3), funda e arremesso, multiplicador ×1½ e ×½ de For |
| CA | empilhamento: braçadeiras ignoradas sob Armadura Arcana ou camisão (J1, J3); toque e surpresa; Des máx. da armadura |
| Perícias | sinergias incondicionais, tamanho em Esconder-se, penalidade de armadura com Natação ×2, graduação máxima, especialização (Atuação, Ofício) |
| Pontos de perícia | multiclasse correta (J2, J3, J4, J5); ver o problema retroativo do J1 |
| Conjuração | Mago 7 (4/4/3/2/1 e 5/6/5/4/3 com Int e especialista manual), Druida 6 (5/5/4/3, CD 15–18), Bardo 3 (conhecidas e por dia), Paladino 6 (NC 3, CD 12, 2 slots) |
| Recursos automáticos | forma selvagem 2, música de bardo 3, destruir o mal 2, cura pelas mãos 12, expulsar 5 |
| PV e carga | PV sugeridos nos 5; limites de carga por tamanho; moedas no peso |
| Validação | `.strict()` recusa chave desconhecida e `kind` inválido |
| Export Grimoire | ida e volta sem diferença nos 5 personagens |

---

## 4. Problemas encontrados (consolidados)

### 4.1 Bugs que perdem ou escondem dados

| # | Problema | Quem viu | Evidência |
|---|---|---|---|
| B1 | ✅ **Corrigido em 2026-10-30** (migração 004, `period` day/week/charges). **O Novo Dia zerava todos os recursos e apagava as notas de uso.** Afeta varinha com cargas, Remover Doença (semanal), foco psiônico e recursos personalizados. Não existe período (dia/semana/cargas). | J1, J4, J5 | [F] `server/repo.js` `rest()`: `DELETE FROM resource_uses` e `pool_used = 0` em todos os recursos |
| B2 | ✅ **Corrigido em 2026-10-30** (enum na API, `isEquipped` só com slot conhecido, import Grimoire tolerante). **`items.location` aceitava qualquer texto.** O item some do Inventário, mas pesa e conta como equipado (CA, Des máx. e penalidade entrariam). | J1, J3 | [F] `server/schemas.js:69` (`z.string()`), `combat.js` `isEquipped` (tudo ≠ backpack) |
| B3 | **Export Roll20 cria linhas de magia órfãs.** Campos extras guardados (ex.: `spellrange`) voltam com o id de linha antigo, e as magias dobram. | J2 | [F] export do id 18 |
| B4 | **Export Roll20 descarta poderes (magias de classe sem `caster`), recursos personalizados, montaria e companheiro sem aviso.** Os poderes não estão na lista de "não exportados" do CLAUDE.md. | J2, J4, J5 | [F] magias 16 → 9, recursos 4 → 1 |
| B5 | **Import Roll20 de classe `custom` quebra os saves sem aviso** (Vontade 6 → 4). O `bab_override` fica congelado e não acompanha a subida de nível. | J5 | [F] `server/roll20/index.js:336` |
| B6 | **`PUT /prepared` aceita mais magias que a capacidade** (8 de 4º onde cabem 3); só a UI limita. | J1 | [F] |
| B7 | **Uso de recurso com `idx` acima do total é aceito e contado.** | J2 | [F] na API; [H] na tela |

### 4.2 Regras calculadas errado ou ausentes

| # | Regra | Esperado (SRD) × Grimoire | Quem viu |
|---|---|---|---|
| R1 | ✅ (2026-10-30) **Graça Divina** (paladino 2+: Car nos saves) | Paladino 6: 10/4/5 × **8/2/3** | J4 [F] (`combat.js` `savingThrows`) |
| R2 | ✅ (2026-10-30) **Efeitos da carga** média/pesada: Des máx., penalidade de armadura e deslocamento | 4 personagens com carga média ou pesada; nada muda | J1, J2, J3, J5 |
| R3 | ✅ (2026-10-30; regra no PHB, não no SRD) **Pontos de perícia não retroativos** (aumento de Int só vale dali em diante) | Mago: 60 × **70** | J1 [F] (`skills.js` `skillPointsAvailable` usa o modificador atual) |
| R4 | **Foco em Magia** (+1 na CD da escola) | Teia CD 17 × 16; druida 16–19 × 15–18 | J1, J2 |
| R5 | **Foco em Perícia** (+3) | Atuação 16 × **13** (vira nota) | J5 |
| R6 | **Esquiva Sobrenatural** (mantém a Des na surpresa) | 23 × **18** | J3 |
| R7 | **Fineza com Arma** no "Corpo a corpo" geral | +11 × **+6** (o talento não tem efeito) | J3 |
| R8 | **Saltar × deslocamento** (−6 a cada 10 ft abaixo de 30) | +3 × **+9** | J3 |
| R9 | **Recuperação de não letal no descanso** (1/hora/nível) | 8 h × 7 = 56 × **7** | J1 |
| R10 | Arredondamento da carga para tamanho Pequeno | 24,75/49,5 × 25/50; 19,5/39,75 × 20/40 | J3, J5 (pequeno; o Grimoire usa pesada ÷ 3) |
| R11 | Sem cálculo: Furtivo, Evasão, Sentir Armadilhas, Empatia Selvagem, Conhecimento de Bardo, nível efetivo de expulsão, dano do Destruir o Mal, XP do próximo nível, falha arcana total (calculada mas não exibida) e a exceção de armadura leve do bardo | — | J1–J5 |

### 4.3 Dados de referência errados (conferidos pelos jogadores no SRD)

| # | Onde | Erro |
|---|---|---|
| D1 | `src/data/builtinSpells.json` **paladino** | Magias que não são de paladino (Escudo da Fé, Detectar o Mal, "Luz Divina") e níveis errados (Curar Moderados é 3º, Arma Sagrada 4º, Curar Sérios 4º). Faltam Favor Divino, Abençoar Arma e Restauração Menor. |
| D2 | `builtinSpells.json` **druida** | Níveis errados: Curar Moderados 3º, Falar com Plantas 3º, Curar Sérios 4º, Dissipar Magia 4º. Faltam **Convocar Aliado da Natureza I–IX**. "Forma Natural I" e "Sentido Sísmico" não constam na lista do SRD. |
| D3 | `referenceData.js` meio-elfo | Bônus trocados: o certo é +1 Ouvir/Procurar/Observar e +2 Diplomacia/Obter Informação. |
| D4 | `referenceData.js` halfling | Faltam +2 em Ouvir e as fundas no +1 de ataque. |
| D5 | `referenceData.js` paladino e druida | Textos errados: Golpe Sagrado "1+Car/dia", "Aura Divina" e "Forma Vegetal 13+". Faltam Aura de Coragem e Saúde Divina. Hoje não aparece nas telas; sai pela API `/api/ref/ref_classes`. |
| D6 | `featsData.json` `phb_augment_summoning` | O pré-requisito é Foco em Magia (Conjuração), não "Conjurar em Combate". |

Pela regra do projeto, cada correção de referência pede `SEED_VERSION++` e teste.

### 4.4 Estruturas que não existem

| # | Falta | Jogadores | Jeitinho de hoje |
|---|---|---|---|
| E1 | **Companheiro permanente** (montaria especial, companheiro animal, familiar, psicristal), com estatísticas editáveis e progressão pelo nível do mestre | J1, J2, J4, J5 | Linha em `summons` (rodadas, selo "SM", "Dispensar" apaga; o `data` não é editável pela UI) |
| E2 | **Psiônicos:** classe Psion, pontos de poder calculados, poderes (custo, CD, nível de manifestador), foco psiônico, perícias psiônicas | J5 | Classe `custom` + recurso manual. **Os poderes gravados não aparecem em nenhuma tela.** |
| E3 | **Mago especialista:** escola e proibidas, espaço extra automático e restrito, aviso para magia proibida | J1 | `+1` manual em cada nível de 0 a 4 |
| E4 | **Metamágica na preparação** (magia menor em espaço maior, com o talento marcado) | J1 | Só pela API; a UI lista só o próprio nível |
| E5 | **Convocar Aliado da Natureza** e conversão espontânea (druida; curar/infligir do clérigo) | J2 | Não existe; as criaturas de CAN têm `nivel_sm: 0` |
| E6 | **Aptidões de classe e raça pela UI** (`kind: feature/trait`), em seção própria, separada dos talentos | J1, J3, J4, J5 | Só pela API; aparecem misturadas aos talentos como "Personalizado" |
| E7 | **Recursos por período** (dia, semana, cargas sem renovação) | J1, J4, J5 | Ver B1 |
| E8 | **Bônus de item ligados ao item** (manto nos saves, tiara/periapto no atributo), aplicados ao equipar | J1, J2 | Digitar duas vezes (no item e no personagem); desequipar não tira o bônus |
| E9 | **Bônus com tipo e origem** em perícias e saves (racial, competência, circunstância, condicional "vs. medo/encantamento") | J1–J5 | Tudo no `misc`, sem origem |
| E10 | **Traços raciais aplicados** (ajuste de atributo, bônus de perícia) | J2, J3, J4, J5 | O assistente só mostra em texto; tudo à mão |
| E11 | Duas armas como "ataque total", munição ligada ao item, recipientes e riqueza, itens com cargas, erguer/empurrar, XP gasto e próximo nível, PV por nível, Falar Idioma, campanha, sub-raça visível, campos estruturados de magia (componentes, alcance, duração, RM) | J1–J5 | Notas |

### 4.5 Roll20 (ida e volta), além de B3–B5

- **Itens equipados** que não são armadura nem escudo **voltam para a mochila** (o slot vai parar nas notas). Anel e amuleto viram campos manuais de CA. (J1–J4)
- **Perdem-se:**
  - `damage_mult` (a mão inábil volta com For cheia) e `damage_type`;
  - `player`, `personality`, `flaw`, `race_name`, `domains` e descrições de magia;
  - custo da armadura;
  - o atributo-chave da perícia personalizada.
- **Aptidões** (`feature`/`trait`) voltam como talentos. Especializações em parênteses se partem ("Foco em Arma (espada curta)").
- **"Esquiva Sobrenatural" casa com "Esquiva"** e duplica o talento: o casamento é pelo maior nome no começo da linha. (J3)
- **Espaços manuais somem** e a magia preparada num espaço maior volta no próprio nível. (J1)
- **Penalidade de armadura:** muda de sinal (sem efeito no cálculo, porque o motor usa o valor absoluto).
- **Avisos falsos e silêncios:** o ataque "Destruir o Mal" gera o aviso de foco/especialização. O import guarda o companheiro inteiro, as habilidades, as notas, `playername` e `neckslot` em `roll20_extra` **sem avisar**, e o `roll20_extra` não aparece na UI.
- Importar no Roll20 real um arquivo gerado pelo Grimoire **continua sem teste**.

### 4.6 Validação frouxa na API

- `notes.session_date` aceita "30/10/2026" (o padrão é ISO).
- `spells.school` aceita escola inventada.
- `caster_ability` em classe `custom` é aceito sem efeito.
- `acp` negativo é aceito.
- O nome do VTTES (`character.name`) é ignorado em favor de `character_name`.

### 4.7 Fricções de UX vistas pelos jogadores

- Invocações misturam convocação temporária e companheiro permanente. "Dispensar todas" apaga o companheiro junto (há Desfazer).
- A aba Magias chama de "Grimório" a lista do druida, que não tem grimório (cada magia precisa ser adicionada antes de preparar). Os poderes do psion ficam invisíveis.
- Carga "Média/Pesada" aparece em cor, sem dizer o efeito. A barra lateral não muda.
- Perícias:
  - a coluna "Outros" não mostra a origem;
  - a tabela tem rolagem horizontal a 1600 px;
  - a especialização de Ofício fica redundante;
  - "Sinergia +2" aparece numa perícia bloqueada.
- Nomes da lista padrão de magias divergem do que o jogador digita ("Míssil Mágico" × "Mísseis Mágicos").
- Bordão de duas mãos + escudo sem aviso; falha arcana aparece para conjurador divino.

---

## 5. Prioridades sugeridas

Cada item é uma fase própria, com aprovação.

**Alta (dados e regras)**
1. **B1** Recursos com período (`day`/`week`/`charges`); o Novo Dia só renova os diários e preserva as notas dos outros (migração + API + teste).
2. **B2** `items.location` com enum (`backpack` + `EQUIPMENT_SLOTS`), ou recipientes de verdade.
3. **R1** Graça Divina. **R3** Pontos de perícia não retroativos (decidir como guardar o histórico de Int). **R2** Efeitos da carga (ou, no mínimo, aviso).
4. **D1–D6** Corrigir os dados de referência pelo SRD (`SEED_VERSION++`).
5. **B3–B5** Roll20 sem linhas órfãs, sem perda silenciosa e com aviso de save divergente.

**Média (estruturas)**

6. **E1** Companheiro permanente (montaria, companheiro animal, familiar) separado das invocações.
7. **E6** Aptidões de classe e raça na UI, em seção própria.
8. **R4/R5** Foco em Magia e Foco em Perícia com alvo. **R6** Esquiva Sobrenatural. **R7** Fineza com Arma.
9. **E3/E4** Mago especialista e metamágica na preparação.
10. **E5** Convocar Aliado da Natureza e conversão espontânea.
11. **E8** Bônus de item ligados ao item equipado.
12. Roll20: local do item, `damage_mult`/`damage_type`, casamento de talento por palavra inteira, mostrar o `roll20_extra`.

**Baixa**

13. **E2** Psiônicos completos (classe, pontos de poder, aba de poderes): o maior item, só se o usuário jogar com psiônicos.
14. **E9/E10** Bônus com origem e traços raciais aplicados.
15. **R8–R11** e **E11** (Saltar, não letal, arredondamento, munição, recipientes, XP do próximo nível…).
16. **4.6** Validações da API.

---

## 6. Limites deste teste

- As fichas da WotC e do Myth-Weavers foram reconstruídas de memória ou pelo layout clássico, sem conferir a fonte (J1, J3). Os campos podem não bater 1:1.
- As telas foram avaliadas pelo código e por alguns screenshots headless (J2, J3), não por uso interativo.
- Algumas regras de raça e de talento citadas nas notas dos personagens vieram de memória dos agentes e estão marcadas como não conferidas nos relatórios individuais.
- O caminho "Grimoire → Roll20 real" não foi testado.
