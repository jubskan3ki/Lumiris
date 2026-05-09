// Iris Score V2 - 40/25/25/10 sur 4 axes, 5 grades A→E (jamais A+).

export const IRIS_GRADES = ['A', 'B', 'C', 'D', 'E'] as const;

export type IrisGrade = (typeof IRIS_GRADES)[number];

export type IrisAxis = 'transparency' | 'craftsmanship' | 'impact' | 'repairability';

export type IrisAxisBreakdown = Record<IrisAxis, number>;

export interface ScoreWeights {
    /** Default 0.40 - composition + factures + photos étapes + certifs fibres. */
    transparency: number;
    /** Default 0.25 - part artisanale + labels EPV/OFG + garantie. */
    craftsmanship: number;
    /** Default 0.25 - carbone (fibres × masse) + eau + part recyclée. */
    impact: number;
    /** Default 0.10 - retoucheurs proches + fibre réparable + garantie longue. */
    repairability: number;
}

export type ScoreBreakdown = IrisAxisBreakdown;

export type ScoreReasonSeverity = 'info' | 'warn' | 'error';

export interface ScoreReason {
    axis: IrisAxis;
    /** Message FR consommé directement par scoring-ui - pas de clé i18n ici. */
    message: string;
    severity: ScoreReasonSeverity;
}

export interface ScoreCap {
    /** Vrai si le grade a été plafonné à D quel que soit le total. */
    applied: boolean;
    /** Raison FR - `'champ_espr_manquant: composition[0].fiber'` etc. */
    reason?: string;
}

export interface ScoreResult {
    /** 0–100 (1 décimale). Le total *brut* est conservé même quand `cap.applied`. */
    total: number;
    grade: IrisGrade;
    breakdown: IrisAxisBreakdown;
    /** Poids effectivement utilisés (post-renormalisation). */
    weights: ScoreWeights;
    reasons: readonly ScoreReason[];
    cap?: ScoreCap;
}
