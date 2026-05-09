import type { IrisGrade } from '@lumiris/types';

// KPIs admin/founder - création/publication passeports + distribution grades

export interface MockKpi {
    /** Période de référence (mois en cours). */
    periodLabel: string;
    /** Nb passeports créés ce mois (Draft + InCompletion + Published). */
    passportsCreatedThisMonth: number;
    /** Nb passeports publiés ce mois. */
    passportsPublishedThisMonth: number;
    /** Distribution des grades parmi les passeports Published. Somme = 100 %. */
    gradeDistribution: Record<IrisGrade, number>;
    /** Top 5 régions artisans (% des artisans actifs). */
    topRegions: ReadonlyArray<{ region: string; share: number }>;
    /** Top fibres utilisées en composition (% des passeports les contenant). */
    topFibers: ReadonlyArray<{ fiber: string; share: number }>;
    /** Conversion Draft → Published (%). */
    draftToPublishedRate: number;
    /** Nb passeports plafonnés D ce mois (signal alerting pour le founder). */
    cappedThisMonth: number;
}

export const mockKpi: MockKpi = {
    periodLabel: 'Avril 2026',
    passportsCreatedThisMonth: 38,
    passportsPublishedThisMonth: 22,
    gradeDistribution: {
        A: 18,
        B: 32,
        C: 28,
        D: 16,
        E: 6,
    },
    topRegions: [
        { region: 'Auvergne-Rhône-Alpes', share: 22 },
        { region: 'Bretagne', share: 18 },
        { region: 'Occitanie', share: 17 },
        { region: 'Île-de-France', share: 14 },
        { region: 'Hauts-de-France', share: 11 },
    ],
    topFibers: [
        { fiber: 'linen', share: 34 },
        { fiber: 'wool', share: 27 },
        { fiber: 'leather', share: 18 },
        { fiber: 'cotton', share: 11 },
        { fiber: 'silk', share: 6 },
    ],
    draftToPublishedRate: 58,
    cappedThisMonth: 4,
};
