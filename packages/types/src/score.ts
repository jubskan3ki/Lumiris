// Aggregate transparency score derived from the 50/30/20 weighted rule (see @lumiris/core).

export type IrisGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'E';

export interface ScoreWeights {
    /** EU ESPR mandatory field completeness (default 0.5). */
    integrity: number;
    /** Sourcing & certification trust (default 0.3). */
    trust: number;
    /** Carbon, water, recycled content (default 0.2). */
    impact: number;
}

export interface ScoreBreakdown {
    integrity: number;
    trust: number;
    impact: number;
}

export interface ScoreResult {
    /** 0–100 weighted total. */
    total: number;
    grade: IrisGrade;
    /** Sub-scores per axis, 0–100 each. */
    breakdown: ScoreBreakdown;
    /** Weights actually used at compute time. */
    weights: ScoreWeights;
    /** Human-readable list of issues that lowered the score. */
    reasons: string[];
}
