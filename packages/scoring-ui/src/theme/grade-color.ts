import type { IrisGrade } from '@lumiris/types';

// Single source of truth: every grade-aware surface MUST consume these tokens — they map to the --lumiris-* CSS variables in packages/ui's prismatic.css.

export type GradeColorToken = 'lumiris-emerald' | 'lumiris-cyan' | 'lumiris-amber' | 'lumiris-rose';

export const GRADE_COLOR: Record<IrisGrade, GradeColorToken> = {
    'A+': 'lumiris-emerald',
    A: 'lumiris-emerald',
    B: 'lumiris-cyan',
    C: 'lumiris-amber',
    D: 'lumiris-amber',
    E: 'lumiris-rose',
};

export function gradeColor(grade: IrisGrade): string {
    return `text-${GRADE_COLOR[grade]}`;
}

export function gradeBackground(grade: IrisGrade): string {
    return `bg-${GRADE_COLOR[grade]}/10`;
}

export function gradeBorder(grade: IrisGrade): string {
    return `border-${GRADE_COLOR[grade]}/30`;
}

export function gradeBackgroundSolid(grade: IrisGrade): string {
    return `bg-${GRADE_COLOR[grade]}`;
}

// Lives next to the colour tokens so admin/web/mobile stay in lock-step on the human-facing label.
export const GRADE_LABEL: Record<IrisGrade, string> = {
    'A+': 'Exemplary',
    A: 'Excellent',
    B: 'Good',
    C: 'Average',
    D: 'Below Average',
    E: 'Opaque',
};
