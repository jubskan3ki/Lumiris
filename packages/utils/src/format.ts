/**
 * Cross-app formatters. Locale-stable defaults (en-US) so admin dashboards,
 * the public web journal, and the mobile reveal all render the same string
 * for the same input.
 */

import type { IrisGrade, ScoreBreakdown } from '@lumiris/types';

export const DEFAULT_LOCALE = 'en-US';

export interface FormatOptions {
    locale?: string;
}

/** ISO date (YYYY-MM-DD or full ISO) → "Dec 14, 2024". */
export function formatDate(value: string | Date, options: FormatOptions = {}): string {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat(options.locale ?? DEFAULT_LOCALE, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
}

/** Compact relative date for activity feeds — "2 days ago", "in 3 weeks". */
export function formatRelativeDate(
    value: string | Date,
    reference: Date = new Date(),
    options: FormatOptions = {},
): string {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    const diffMs = date.getTime() - reference.getTime();
    const rtf = new Intl.RelativeTimeFormat(options.locale ?? DEFAULT_LOCALE, { numeric: 'auto' });
    const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
        ['year', 1000 * 60 * 60 * 24 * 365],
        ['month', 1000 * 60 * 60 * 24 * 30],
        ['week', 1000 * 60 * 60 * 24 * 7],
        ['day', 1000 * 60 * 60 * 24],
        ['hour', 1000 * 60 * 60],
        ['minute', 1000 * 60],
        ['second', 1000],
    ];
    for (const [unit, ms] of units) {
        if (Math.abs(diffMs) >= ms) return rtf.format(Math.round(diffMs / ms), unit);
    }
    return rtf.format(0, 'second');
}

/**
 * Percent formatter. `value` is treated as 0–100 (matching ScoreBreakdown axes
 * and DPP integrity values), not 0–1. Use `fromUnit: true` when you actually
 * pass 0–1 fractions.
 */
export function formatPercent(
    value: number,
    options: FormatOptions & { fromUnit?: boolean; digits?: number } = {},
): string {
    if (!Number.isFinite(value)) return '—';
    const ratio = options.fromUnit ? value : value / 100;
    return new Intl.NumberFormat(options.locale ?? DEFAULT_LOCALE, {
        style: 'percent',
        minimumFractionDigits: options.digits ?? 0,
        maximumFractionDigits: options.digits ?? 1,
    }).format(ratio);
}

/** "78.4 / 100" — the clinical Lumiris style for a total score. */
export function formatScoreTotal(total: number): string {
    if (!Number.isFinite(total)) return '— / 100';
    return `${roundTo(total, 1)} / 100`;
}

/**
 * Sub-axis label, e.g. `formatScoreAxis('integrity', breakdown)` →
 * "Integrity · 92.0 / 50" (axis × weight cap).
 */
export function formatScoreAxis(
    axis: keyof ScoreBreakdown,
    breakdown: ScoreBreakdown,
    weights: { [K in keyof ScoreBreakdown]: number } = { integrity: 50, trust: 30, impact: 20 },
): string {
    const score = breakdown[axis];
    const cap = weights[axis];
    const weighted = roundTo((score * cap) / 100, 1);
    return `${capitalize(axis)} · ${weighted} / ${cap}`;
}

/** "A+", "B" — passthrough today, but exists so callers route through one helper. */
export function formatGrade(grade: IrisGrade | null | undefined): string {
    return grade ?? '—';
}

function roundTo(n: number, digits: number): number {
    const f = 10 ** digits;
    return Math.round(n * f) / f;
}

function capitalize(s: string): string {
    return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
}
