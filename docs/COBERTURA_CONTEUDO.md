# Cobertura do conteúdo de referência

Gerado por `npm run coverage:content` a partir de `src/db` e `src/data`. Não edite à mão.

- **SRD**: consta no SRD 3.5 (conferido por nome nas páginas do SRD, ou por estatística no caso das criaturas).
- **Verificado**: números conferidos com uma fonte. Hoje só as criaturas de Convocar Monstro (SRD).
- **Página**: nenhuma registrada ainda (nunca inventada).

## Por tipo

| Tipo | Registros | No SRD | Verificados | Com página | needs_review |
| --- | ---: | ---: | ---: | ---: | ---: |
| Talentos | 305 | 113 | 0 | 0 | 11 |
| Falhas | 20 | 0 | 0 | 0 | 20 |
| Raças | 22 | 11 | 0 | 0 | 4 |
| Classes | 35 | 21 | 0 | 0 | 0 |
| Criaturas | 43 | 32 | 32 | 0 | 0 |

Magias padrão (`src/data/builtinSpells.json`): 326 entradas por classe, sem metadados de fonte (lista de conveniência; o grimório do personagem é livre).

## Por publicação

| Livro | Título | Editora | Categoria | No SRD | Registros | Situação bibliográfica |
| --- | --- | --- | --- | --- | ---: | --- |
| PHB | Player's Handbook (v.3.5) | Wizards of the Coast | basico | parcial | 126 | unresearched |
| DMG | Dungeon Master's Guide (v.3.5) | Wizards of the Coast | basico | parcial | 10 | unresearched |
| Monster Manual | Monster Manual (v.3.5) | Wizards of the Coast | basico | parcial | 51 | unresearched |
| Expanded Psionics | Expanded Psionics Handbook | Wizards of the Coast | suplemento | parcial | 5 | unresearched |
| Unearthed Arcana | Unearthed Arcana | Wizards of the Coast | suplemento | nao | 20 | unresearched |
| Complete Warrior | Complete Warrior | Wizards of the Coast | suplemento | nao | 24 | unresearched |
| Complete Divine | Complete Divine | Wizards of the Coast | suplemento | nao | 11 | unresearched |
| Complete Arcane | Complete Arcane | Wizards of the Coast | suplemento | nao | 20 | unresearched |
| Complete Adventurer | Complete Adventurer | Wizards of the Coast | suplemento | nao | 17 | unresearched |
| Complete Champion | Complete Champion | Wizards of the Coast | suplemento | nao | 7 | unresearched |
| Complete Mage | Complete Mage | Wizards of the Coast | suplemento | nao | 7 | unresearched |
| Complete Scoundrel | Complete Scoundrel | Wizards of the Coast | suplemento | nao | 6 | unresearched |
| PHB II | Player's Handbook II | Wizards of the Coast | suplemento | nao | 12 | unresearched |
| Tome of Battle | Tome of Battle: The Book of Nine Swords | Wizards of the Coast | suplemento | nao | 9 | unresearched |
| Tome of Magic | Tome of Magic | Wizards of the Coast | suplemento | nao | 5 | unresearched |
| Miniatures Handbook | Miniatures Handbook | Wizards of the Coast | suplemento | nao | 2 | unresearched |
| Dungeonscape | Dungeonscape | Wizards of the Coast | suplemento | nao | 2 | unresearched |
| Races of the Dragon | Races of the Dragon | Wizards of the Coast | suplemento | nao | 3 | unresearched |
| Races of the Wild | Races of the Wild | Wizards of the Coast | suplemento | nao | 9 | unresearched |
| Races of Stone | Races of Stone | Wizards of the Coast | suplemento | nao | 7 | unresearched |
| Libris Mortis | Libris Mortis: The Book of the Dead | Wizards of the Coast | suplemento | nao | 9 | unresearched |
| Heroes of Horror | Heroes of Horror | Wizards of the Coast | suplemento | nao | 5 | unresearched |
| Dragon Magic | Dragon Magic | Wizards of the Coast | suplemento | nao | 5 | unresearched |
| Sandstorm | Sandstorm | Wizards of the Coast | suplemento | nao | 3 | unresearched |
| Frostburn | Frostburn | Wizards of the Coast | suplemento | nao | 3 | unresearched |
| Stormwrack | Stormwrack | Wizards of the Coast | suplemento | nao | 3 | unresearched |
| Eberron Campaign Setting | Eberron Campaign Setting | Wizards of the Coast | cenario | nao | 24 | unresearched |
| Dragonlance Campaign Setting | Dragonlance Campaign Setting | Wizards of the Coast | cenario | nao | 9 | unresearched |
| Legends of the Twins | Legends of the Twins | Margaret Weis Productions (a confirmar) | cenario | nao | 11 | needs_review |

## Pendências conhecidas

- Pesquisa bibliográfica completa (prompt §18 das instruções mestre): títulos, anos, códigos e erratas ainda não cruzados com dois índices.
- Talentos, raças e classes: efeitos e textos não conferidos com o livro; só a presença no SRD foi checada.
- Criaturas de Convocar Monstro: habilidades especiais e modelo celestial/abissal (resistências, RD, RM, destruir) não conferidos.
- Criaturas `_san` (Convocar Aliado da Natureza): não conferidas.
- Genasi: livro provavelmente errado (não constam no SRD nem, ao que tudo indica, no Monster Manual).
- Classes de suplemento: DV/BBA/saves com `verified: false` (Swashbuckler e Artificer com suspeita de erro).
