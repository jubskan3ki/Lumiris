import type { IrisGrade } from '@lumiris/types';

/**
 * Single source of truth for grade → palette token mapping. Every grade-aware
 * surface (admin pastille, web hero badge, mobile reveal halo) MUST consume
 * these values rather than hard-coding a colour.
 *
 * Tokens map onto the `--lumiris-*` CSS variables defined in
 * `packages/ui/src/styles/prismatic.css`.
 */

export type GradeColorToken = 'lumiris-emerald' | 'lumiris-cyan' | 'lumiris-amber' | 'lumiris-rose';

export const GRADE_COLOR: Record<IrisGrade, GradeColorToken> = {
    'A+': 'lumiris-emerald',
    A: 'lumiris-emerald',
    B: 'lumiris-cyan',
    C: 'lumiris-amber',
    D: 'lumiris-amber',
    E: 'lumiris-rose',
};

/** Tailwind text colour class for a grade. */
export function gradeColor(grade: IrisGrade): string {
    return `text-${GRADE_COLOR[grade]}`;
}

/** Tailwind background class with low opacity (for pastille fills). */
export function gradeBackground(grade: IrisGrade): string {
    return `bg-${GRADE_COLOR[grade]}/10`;
}

/** Tailwind border colour class. */
export function gradeBorder(grade: IrisGrade): string {
    return `border-${GRADE_COLOR[grade]}/30`;
}
