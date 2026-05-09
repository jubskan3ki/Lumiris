import type { IrisAxis, IrisGrade } from '@lumiris/types';

// source unique des tokens grade/axis - mappés sur les vars --lumiris-* de @lumiris/ui prismatic.css

export type GradeColorToken = 'lumiris-emerald' | 'lumiris-cyan' | 'lumiris-amber' | 'lumiris-orange' | 'lumiris-rose';

export const GRADE_COLOR: Record<IrisGrade, GradeColorToken> = {
    A: 'lumiris-emerald',
    B: 'lumiris-cyan',
    C: 'lumiris-amber',
    D: 'lumiris-orange',
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

// Classes hardcodées pour que le scanner Tailwind v4 les pickup (pas de `border-${var}` dynamique).
export function gradeBorder2px(grade: IrisGrade): string {
    return `border-2 border-${GRADE_COLOR[grade]}`;
}

/** Retourne la CSS var bruite (`var(--lumiris-emerald)`) - utile pour `style={{ stroke: ... }}` ou SVG inline. */
export function gradeColorVar(grade: IrisGrade): string {
    return `var(--${GRADE_COLOR[grade]})`;
}

// Lives next to the colour tokens so admin/web/mobile stay in lock-step on the human-facing label.
export const GRADE_LABEL: Record<IrisGrade, string> = {
    A: 'Excellent',
    B: 'Bon',
    C: 'Moyen',
    D: 'Insuffisant',
    E: 'Opaque',
};

// Per-axis colour mapping - drives the four-axis breakdown bar.
export const AXIS_COLOR: Record<IrisAxis, GradeColorToken> = {
    transparency: 'lumiris-emerald',
    craftsmanship: 'lumiris-cyan',
    impact: 'lumiris-amber',
    repairability: 'lumiris-orange',
};

export const AXIS_LABEL: Record<IrisAxis, string> = {
    transparency: 'Transparence',
    craftsmanship: 'Savoir-faire',
    impact: 'Impact',
    repairability: 'Réparabilité',
};
