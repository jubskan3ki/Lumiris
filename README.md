# LUMIRIS Ecosystem

> **Clinical & Transparent.** A Bun + Turbo monorepo for the LUMIRIS Digital Product Passport platform.

The whole ecosystem boots in one command:

```bash
bun install && bun dev
```

## Surfaces

| Workspace     | Package           | Role                                                                              | Port |
| ------------- | ----------------- | --------------------------------------------------------------------------------- | ---- |
| `apps/admin`  | `@lumiris/admin`  | Internal back-office — DPP audit, certificate vault, journal CMS. Light/Clinical. | 3001 |
| `apps/site`   | `@lumiris/site`   | Public marketing site, methodology pages, journal.                                | 3000 |
| `apps/mobile` | `@lumiris/mobile` | Mobile-optimized consumer view — Iris Scanner, Deep Reveal.                       | 3002 |

## Shared packages

| Package           | Role                                                                                                                                                |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@lumiris/ui`     | **Prismatic Clarity Design System** — Shadcn primitives, theme provider, hooks, Opal-glow Tailwind preset. The single source of truth for the look. |
| `@lumiris/core`   | The **50/30/20 LUMIRIS Scoring Algorithm** (Integrity 50% · Trust 30% · Impact 20%). Pure & deterministic — identical on every surface.             |
| `@lumiris/types`  | Unified TypeScript definitions for DPP, Iris Score, User, Journal, Regulatory.                                                                      |
| `@lumiris/config` | Shared toolchain — ESLint flat configs (base/react/next), TypeScript bases, Tailwind preset.                                                        |

## Stack

- **Runtime**: [Bun](https://bun.sh/) ≥ 1.1 (workspace native, drop-in test runner)
- **Orchestration**: [Turbo](https://turbo.build/) for cached lint/test/build pipelines
- **Apps**: Next.js 16 + React 19 + Tailwind 4
- **Quality gates**: ESLint flat config · Prettier · Knip · Husky + lint-staged · Lighthouse CI

## Folder structure

```
.
├── apps/
│   ├── admin/         # @lumiris/admin  → back-office dashboard
│   ├── site/          # @lumiris/site   → public site & journal
│   └── mobile/        # @lumiris/mobile → mobile-optimized view
├── packages/
│   ├── ui/            # @lumiris/ui     → Prismatic Clarity design system
│   ├── core/          # @lumiris/core   → Scoring Algorithm (50/30/20)
│   ├── types/         # @lumiris/types  → DPP / Score / User contracts
│   └── config/        # @lumiris/config → ESLint · TS · Tailwind presets
├── .husky/            # pre-commit guardrails (lint, format, secret scan)
├── .github/workflows/ # CI: lint → typecheck → test → build → Lighthouse
├── turbo.json         # task graph + caching
├── tsconfig.base.json # strict TS baseline
├── lighthouserc.cjs   # Web Vitals budgets
├── knip.json          # dead-code detection
└── Makefile           # `make help`
```

## Common tasks

| Make target            | What it does                            |
| ---------------------- | --------------------------------------- |
| `make install`         | Install everything via Bun              |
| `make dev`             | Run admin + site + mobile in parallel   |
| `make dev-site`        | Only the public site                    |
| `make build`           | Build all apps (Turbo-cached)           |
| `make verify`          | `lint` + `typecheck` + `test` + `knip`  |
| `make ci`              | Full local CI pipeline                  |
| `make clean` / `reset` | Remove build outputs / nuke + reinstall |

`make help` lists everything.

## Adding a new shared component

1. `cd packages/ui`
2. `bunx shadcn@latest add <name>`
3. The component lands in `packages/ui/src/components/ui/<name>.tsx`.
4. Consume from any app: `import { <Name> } from '@lumiris/ui/components/<name>'`.

## Deployment

Each `apps/*` is an independent Next.js app — deploy individually on Vercel, or build a Dockerfile per app from the workspace root. Turbo's remote cache (`turbo login && turbo link`) keeps CI builds fast across machines.

---

> **Philosophy.** DRY · type-safe · scalable. Every piece of code that affects the audit verdict (types, scoring, UI primitives) lives in `packages/` and is consumed identically across admin, site, and mobile. That's the brand promise: one truth, three surfaces.
