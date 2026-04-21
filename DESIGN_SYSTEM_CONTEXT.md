# Grimoire Design System — Contexto

> Repositório: https://github.com/VinnyBittencourt/grimoire-design-system
> Local: `C:\projects\grimoire-design-system`

## Stack

- React 19 + Vite 8 (library mode: ES + UMD em `dist/`)
- CSS Modules por componente
- CSS custom properties para tokens
- Storybook 10 para documentação interativa

## Estrutura

```
src/
  components/
    Button/   Button.jsx · Button.module.css · Button.stories.jsx
    Card/     Card.jsx · Card.module.css · Card.stories.jsx
    Input/    Input.jsx · Input.module.css · Input.stories.jsx
    Modal/    Modal.jsx · Modal.module.css · Modal.stories.jsx
    Panel/    Panel.jsx · Panel.module.css · Panel.stories.jsx
  tokens/     tokens.css   ← todas as CSS custom properties
  index.js    ← barrel de exports
  style.css   ← importa tokens + reset global
.storybook/
  main.js
  preview.js  ← importa src/style.css, fundo dark como padrão
DESIGN.md     ← brand doc lido pelo Claude Design
CLAUDE.md     ← contexto para o Claude Code
```

## Componentes

| Componente | Props principais |
|---|---|
| `Button` | `variant` (gold/ghost/danger), `size` (sm/md/lg), `disabled`, `onClick`, `type` |
| `Card` | `onClick` (ativa hover clicável), `className`, `style` |
| `Input` | `label`, `id`, `value`, `onChange`, `placeholder`, `type`, `disabled` |
| `Modal` | `isOpen`, `onClose`, `title`, `maxWidth` (default `500px`) |
| `Panel` | `className`, `style` — superfície com gradiente wood |

## Design Tokens

```css
--color-gold-primary: #c9a84c   --color-gold-light: #f0d070   --color-gold-dark: #8a6e2a
--color-wood-darkest: #1a1208   --color-wood-dark: #2a1a0a    --color-wood-medium: #3d2810
--color-wood-border: #6b4a1a    --color-text-light: #f0e6c8   --color-text-muted: #9b8a6a
--color-danger: #c0392b         --color-success: #27ae60
--font-heading: 'Cinzel', serif  --font-body: 'Inter', sans-serif
--space-1..8: 4px..32px         --radius-sm/md/lg: 4px/8px/12px
```

## Padrões

- Novos componentes em `src/components/Nome/` com 3 arquivos: `.jsx`, `.module.css`, `.stories.jsx`
- Adicionar export no `src/index.js` ao criar componente novo
- Stories: CSF3 com `tags: ['autodocs']`
- Nunca valores hardcoded — sempre tokens CSS

## Scripts

```bash
npm run storybook      # docs interativas em localhost:6006
npm run build          # gera dist/
```

## Como o Grimoire consome

Instalado via git dependency:
```bash
npm install github:VinnyBittencourt/grimoire-design-system
```
Import nos componentes:
```jsx
import { Button, Panel, Card, Input, Modal } from 'grimoire-design-system'
```

## Fluxo de atualização

1. Editar componente no repo do DS (ou via Claude Design handoff bundle)
2. `npm run build && git push`
3. No Grimoire: `npm install github:VinnyBittencourt/grimoire-design-system`

## Claude Design

- Linkar o repo `grimoire-design-system` no claude.ai/design
- Claude Design lê o `DESIGN.md` para entender o brand
- Editar visualmente → exportar handoff bundle → Claude Code implementa
