# @lumiris/scoring-ui

Visual primitives bound to the LUMIRIS 50/30/20 transparency score. Re-uses the
algorithm from `@lumiris/core` and the design tokens from `@lumiris/ui` -
**owns no domain logic of its own**.

## Components

- `<IrisGrade grade size>` - grade pastille (A+ → E) using the canonical palette.
- `<ScoreBreakdown breakdown weights>` - three bars sized against 50/30/20.
- `<ScoreReasonsList reasons limit>` - narrative explanation of issues.
- `<MissingFieldsBadge dpp>` - counter derived from `MANDATORY_DPP_FIELDS`.

## Theme

`grade-color.ts` is the **single source of truth** for grade → palette mapping.
Importable via `@lumiris/scoring-ui/theme/grade-color` for app-level needs
(e.g. tinting a non-component surface like a chart).

```ts
import { GRADE_COLOR, gradeColor } from '@lumiris/scoring-ui/theme/grade-color';
GRADE_COLOR['A+']; // → 'lumiris-emerald'
gradeColor('E'); // → 'text-lumiris-rose'
```

## Decision rule

> If `X` depends on grade / score / DPP **and** renders JSX, it lives here -
> not in `@lumiris/ui` (which stays domain-agnostic) and not in app code.
