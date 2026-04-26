/**
 * LUMIRIS Iris Grade — the aggregate transparency score derived from
 * the 50/30/20 weighted rule (see @lumiris/core).
 */

export type IrisGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'E';

export interface ScoreWeights {
    /** Mandatory EU ESPR field completeness (default 0.5). */
    integrity: number;
    /** Sourcing & certification trust score (default 0.3). */
    trust: number;
    /** Environmental impact score: carbon, water, recycled content (default 0.2). */
    impact: number;
}

export interface ScoreBreakdown {
    integrity: number;
    trust: number;
    impact: number;
}

export interface ScoreResult {
    /** Final 0–100 weighted score. */
    total: number;
    /** Letter grade derived from `total`. */
    grade: IrisGrade;
    /** Sub-scores per axis (0–100 each). */
    breakdown: ScoreBreakdown;
    /** Effective weights used at compute time. */
    weights: ScoreWeights;
    /** Human-readable list of issues that lowered the score. */
    reasons: string[];
}
