# @lumiris/ui — Prismatic Clarity Design System

Domain-agnostic primitives. The `prismatic.css` Tailwind v4 theme is the single
source of truth for the Lumiris colour system; tokens flow into
`@lumiris/scoring-ui` for grade-aware visualisations.

## Layout

```
packages/ui/src/
├── components/         "use client" interactive primitives (Shadcn / Radix)
├── server/             RSC-only primitives — no React state, no event handlers
├── hooks/              client hooks (use-toast, use-mobile)
├── lib/                tiny utilities (cn)
└── styles/prismatic.css   the CSS-native Tailwind v4 theme
```

## Subpath imports

Prefer granular imports for tree-shaking:

```ts
import { Button } from '@lumiris/ui/components/button';
import { cn } from '@lumiris/ui/lib/cn';
import { ThemeProvider } from '@lumiris/ui/theme-provider';
```

The barrel `@lumiris/ui` only re-exports `cn`, `ThemeProvider`, `useIsMobile`,
`useToast`, `toast` — the cross-cutting utilities used in nearly every app.

## Server vs client

- `@lumiris/ui/server` — reserved for primitives that read build-time env or
  otherwise must run in an RSC context. The `react-server` condition in the
  package.json `exports` map auto-routes the bare `@lumiris/ui` import to this
  surface inside RSC trees.
- `@lumiris/ui/components/*` — `'use client'` Shadcn primitives. Always callable
  from a Client Component, opt-in from RSC.

## Decision rule

> If `X` does not depend on grade/score/DPP, and renders JSX → it lives here.
> If `X` depends on grade/score/DPP → it lives in `@lumiris/scoring-ui`.
