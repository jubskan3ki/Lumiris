import type { IrisGrade } from '@lumiris/types';

/**
 * Map a 0–100 score into the LUMIRIS Iris Grade letter scale.
 * Boundaries are calibrated against the EU ESPR thresholds.
 */
export function toIrisGrade(total: number): IrisGrade {
    if (total >= 90) return 'A+';
    if (total >= 80) return 'A';
    if (total >= 65) return 'B';
    if (total >= 50) return 'C';
    if (total >= 35) return 'D';
    return 'E';
}
