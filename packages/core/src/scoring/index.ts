import type { Certificate, DPPRecord, ScoreResult, ScoreWeights } from '@lumiris/types';
import { LUMIRIS_WEIGHTS } from '../constants';
import { toIrisGrade } from './grade';
import { scoreImpact } from './impact';
import { scoreIntegrity } from './integrity';
import { scoreTrust } from './trust';

export interface ScoreOptions {
    certificates?: readonly Certificate[];
    weights?: Partial<ScoreWeights>;
}

/**
 * The LUMIRIS Scoring Algorithm — applies the 50/30/20 weighted rule across
 * Integrity, Trust, and Impact. Pure & deterministic: identical output on
 * the admin dashboard, the public web, and the mobile vision.
 */
export function computeScore(dpp: DPPRecord, options: ScoreOptions = {}): ScoreResult {
    const weights = normalizeWeights({ ...LUMIRIS_WEIGHTS, ...(options.weights ?? {}) });
    const certificates = options.certificates ?? [];

    const integrity = scoreIntegrity(dpp);
    const trust = scoreTrust(dpp, certificates);
    const impact = scoreImpact(dpp);

    const total = integrity.score * weights.integrity + trust.score * weights.trust + impact.score * weights.impact;

    const rounded = Math.round(total * 10) / 10;

    return {
        total: rounded,
        grade: toIrisGrade(rounded),
        breakdown: {
            integrity: round1(integrity.score),
            trust: round1(trust.score),
            impact: round1(impact.score),
        },
        weights,
        reasons: [...integrity.reasons, ...trust.reasons, ...impact.reasons],
    };
}

/**
 * Re-normalise partial weight overrides so they always sum to 1. This keeps
 * the score on a 0–100 scale even if a caller supplies non-default weights.
 */
function normalizeWeights(w: ScoreWeights): ScoreWeights {
    const sum = w.integrity + w.trust + w.impact;
    if (sum === 0) return LUMIRIS_WEIGHTS;
    return {
        integrity: w.integrity / sum,
        trust: w.trust / sum,
        impact: w.impact / sum,
    };
}

function round1(n: number): number {
    return Math.round(n * 10) / 10;
}

export { scoreImpact, scoreIntegrity, scoreTrust, toIrisGrade };
