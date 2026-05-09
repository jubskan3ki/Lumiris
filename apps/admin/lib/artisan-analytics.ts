import { computeScore } from '@lumiris/core/scoring';
import {
    IRIS_GRADES,
    type Artisan,
    type ArtisanTier,
    type IrisGrade,
    type Passport,
    type Repairer,
} from '@lumiris/types';

export const TIER_MRR: Record<ArtisanTier, number> = { Solo: 29, Studio: 79, Maison: 149 };
export const PLUS_ADDON = 19;

export interface ArtisanRow {
    artisan: Artisan;
    publishedCount: number;
    avgGrade: IrisGrade | '-';
    avgScore: number;
    cappedShare: number;
    flaggedShare: number;
    qualityRisk: boolean;
    mrr: number;
}

export function buildArtisanRows(
    artisans: readonly Artisan[],
    passports: readonly Passport[],
    repairers: readonly Repairer[],
    now: Date,
): readonly ArtisanRow[] {
    return artisans.map((artisan) => {
        const artisanPassports = passports.filter((p) => p.artisanId === artisan.id);
        const published = artisanPassports.filter((p) => p.status === 'Published');
        const scores = published.map((p) =>
            computeScore(p, {
                certificates: p.materials.flatMap((m) => m.certifications),
                artisan,
                retoucheurs: repairers,
                now,
            }),
        );
        const cappedShare =
            scores.length === 0 ? 0 : scores.filter((s) => s.cap?.applied || s.grade === 'D').length / scores.length;
        const avgScore = scores.length === 0 ? 0 : scores.reduce((sum, s) => sum + s.total, 0) / scores.length;
        const gradeCounts: Record<IrisGrade, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
        scores.forEach((s) => {
            gradeCounts[s.grade] += 1;
        });
        const dominantGrade: IrisGrade | '-' =
            scores.length === 0
                ? '-'
                : IRIS_GRADES.reduce<IrisGrade>((best, g) => (gradeCounts[g] > gradeCounts[best] ? g : best), 'A');
        return {
            artisan,
            publishedCount: published.length,
            avgGrade: dominantGrade,
            avgScore,
            cappedShare,
            flaggedShare: 0,
            qualityRisk: cappedShare > 0.3,
            mrr: TIER_MRR[artisan.tier] + (artisan.plus ? PLUS_ADDON : 0),
        } satisfies ArtisanRow;
    });
}
