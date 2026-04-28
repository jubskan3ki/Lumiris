import { computeScore } from '@lumiris/core/scoring';
import { mockCertificates, mockProducts, type MockProduct } from '@lumiris/mock-data';
import { mockDppById } from '@lumiris/mock-data/dpp';
import type { DPPRecord, IrisGrade as IrisGradeLetter, ScoreBreakdown } from '@lumiris/types';

export interface MobileProduct extends MockProduct {
    grade: IrisGradeLetter;
    score: number;
    breakdown: ScoreBreakdown;
    reasons: readonly string[];
    dpp: DPPRecord;
}

function enrich(product: MockProduct): MobileProduct {
    const dpp = mockDppById(product.dppId);
    if (!dpp) {
        throw new Error(`MobileProduct ${product.id} references unknown DPP ${product.dppId}`);
    }
    const result = computeScore(dpp, { certificates: mockCertificates });
    return {
        ...product,
        dpp,
        grade: result.grade,
        score: result.total,
        breakdown: result.breakdown,
        reasons: result.reasons,
    };
}

export const WARDROBE_ITEMS: readonly MobileProduct[] = mockProducts.map(enrich);

interface DiscoveryItem {
    id: string;
    title: string;
    subtitle: string;
    category: 'Trend' | 'Audit' | 'Regulation' | 'Lifestyle';
    grade: IrisGradeLetter;
    publishedAt: string;
}

export const DISCOVERY_FEED: readonly DiscoveryItem[] = [
    {
        id: 'DSC-001',
        title: 'EU ESPR enters force in 2027 — what every brand must publish',
        subtitle: 'A practical breakdown of the 12 mandatory fields and the audit cadence.',
        category: 'Regulation',
        grade: 'A',
        publishedAt: '2024-12-12T08:00:00Z',
    },
    {
        id: 'DSC-002',
        title: 'Inside the audit: how Verde Collective hit a 100% integrity score',
        subtitle: 'A close read of DPP-2024-003 and the supplier letters that made it possible.',
        category: 'Audit',
        grade: 'A+',
        publishedAt: '2024-12-09T08:00:00Z',
    },
    {
        id: 'DSC-003',
        title: 'Why "bamboo" doesn\'t always mean low-carbon',
        subtitle: 'Three brands, three viscose processes, three very different impact stories.',
        category: 'Trend',
        grade: 'C',
        publishedAt: '2024-12-06T08:00:00Z',
    },
    {
        id: 'DSC-004',
        title: 'Repairability index 8.4: the new floor for premium tailoring',
        subtitle: 'How EcoWeave re-engineered seam construction to satisfy ESPR-2024-v2.',
        category: 'Lifestyle',
        grade: 'B',
        publishedAt: '2024-12-04T08:00:00Z',
    },
    {
        id: 'DSC-005',
        title: 'Auto-graded E: the eight signals that trigger a Grade E lock',
        subtitle: 'When mandatory data is missing, the score floors. Here is the heuristic.',
        category: 'Audit',
        grade: 'E',
        publishedAt: '2024-12-02T08:00:00Z',
    },
];
