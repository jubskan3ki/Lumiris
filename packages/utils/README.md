# @lumiris/utils

Pure runtime helpers that all three Lumiris surfaces share. No JSX, no DOM
beyond what an entry advertises - if you reach for React, you want
`@lumiris/ui` or `@lumiris/scoring-ui` instead.

## Entries

| Import                      | Purpose                                                             |
| --------------------------- | ------------------------------------------------------------------- |
| `@lumiris/utils/env`        | Zero-dep schema validator. Crash-early on missing required env.     |
| `@lumiris/utils/web-vitals` | Vendor-agnostic `web-vitals` plumbing (sampling + tagging wrapper). |
| `@lumiris/utils/format`     | `formatDate`, `formatPercent`, `formatScoreTotal`, `formatGrade`, … |
| `@lumiris/utils/analytics`  | `AnalyticsClient` interface + `noopAnalytics` stub, app-injected.   |

The barrel `@lumiris/utils` re-exports everything, but prefer subpath imports -
they keep the dead-code elimination crisp for Next.

## Decision rule

> If `X` is pure (no JSX, no React) and you need it in two of admin/web/mobile,
> it lives here.
