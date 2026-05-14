# Grimoire — Contexto do Projeto

App pessoal de RPG D&D 3.5 para organizar fichas de personagem, magias, equipamentos e anotações de sessão.

## Stack

- React 19 + Vite 8 + Tailwind CSS 4
- JavaScript (sem TypeScript)
- Express 5 como API backend (porta 3001)
- XLSX para persistência de dados em Excel
- React Router DOM 7 para navegação

## Rodar o projeto

```bash
npm run dev:all   # Vite (5173) + Express (3001) simultaneamente
npm run dev       # só Vite
npm run dev:api   # só Express
npm run build     # build de produção
```

## Estrutura

```
src/
  pages/
    IntroPage.jsx           ← landing page
    CharacterListPage.jsx   ← seleção de personagem
    CharacterFormPage.jsx   ← criação/edição de personagem
    DashboardPage.jsx       ← ficha completa (tela principal)
  components/
    Layout/Header.jsx
    CharacterInfo/CharacterInfo.jsx   ← atributos, CA, HP, saves
    SpellBoard/SpellBoard.jsx         ← grade de magias preparadas
    Equipments/                       ← slots de equipamento
    Mochila/                          ← inventário
    Talentos/                         ← feats/talentos
    RecursosClasse/                   ← recursos de classe
    SectionNotes/                     ← anotações da sessão
    CriaturaInvocada/                 ← criatura invocada ativa
    modals/
      SpellPrepModal.jsx
      SummonCreatureModal.jsx
      SessionNotesModal.jsx
  context/AppContext.jsx    ← estado global (useApp())
  hooks/useEfeitosDoPersonagem.js
  services/
    dnd35Feats.js           ← banco de talentos D&D 3.5
    dnd35Tables.js          ← tabelas e constantes do sistema
    excelService.js         ← leitura/escrita do Excel
  assets/icons/
    equipmentIcons.jsx
    escolaIcons.jsx
  index.css                 ← tema medieval + Tailwind
data/
  grimoire_data.xlsx        ← banco de dados principal
  fotos.json                ← fotos dos personagens (base64)
server.js                   ← API Express (porta 3001)
```

## Arquitetura de dados

Tudo persiste em `data/grimoire_data.xlsx` via API Express:
- `GET /api/data` → lê o Excel e retorna JSON
- `POST /api/data` → recebe JSON e salva no Excel
- `GET/POST /api/fotos` → gerencia fotos em `data/fotos.json`

O Vite tem proxy configurado: chamadas para `/api` são redirecionadas para `localhost:3001`.

## Estado global (AppContext)

```jsx
const { db, personagemAtivo, setPersonagemAtivo, salvar, ... } = useApp()
```

- `db` — objeto completo do Excel em memória
- `personagemAtivo` — personagem selecionado
- `salvar()` — persiste o estado atual no Excel

## Estilo

Híbrido: Tailwind CSS 4 + classes customizadas medievais em `src/index.css`.
Classes principais: `.panel`, `.btn-gold`, `.btn-ghost`, `.btn-danger`, `.spell-card`, `.input-medieval`, `.label-medieval`, `.character-card`.

**Design system externo:** `grimoire-design-system` instalado como dependência npm.
Ver `DESIGN_SYSTEM_CONTEXT.md` para detalhes dos componentes disponíveis.

## Regras do jogo (D&D 3.5)

- Modificador de atributo: `Math.floor((valor - 10) / 2)`
- Saves base, BAB e magias por nível estão em `services/dnd35Tables.js`
- Talentos com pré-requisitos em `services/dnd35Feats.js`
- O app faz os cálculos automáticos mas permite override (homebrew)
