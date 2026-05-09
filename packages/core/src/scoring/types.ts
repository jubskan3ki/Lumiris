import type { ScoreReason } from '@lumiris/types';

export interface AxisResult {
    /** 0–100. */
    score: number;
    reasons: readonly ScoreReason[];
}
