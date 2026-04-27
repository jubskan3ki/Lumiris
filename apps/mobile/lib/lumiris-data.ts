/**
 * Mobile-local fixture surface. The mobile features were authored against this
 * shape before the cross-app reorg landed; this shim keeps them compiling
 * while routing the SKUs and the score back to the canonical sources:
 *
 *   - DPP & products → `@lumiris/mock-data`
 *   - 50/30/20 grade → `@lumiris/core`'s `computeScore`
 *
 * No grade → colour mapping lives here. Colours are sourced from
 * `@lumiris/scoring-ui` (Tailwind tokens), never duplicated per-app.
 */

import { computeScore } from '@lumiris/core/scoring';
import { mockCertificates, mockProducts, type MockProduct } from '@lumiris/mock-data';
import { mockDppById } from '@lumiris/mock-data/dpp';
import type { DPPRecord, IrisGrade as IrisGradeLetter, ScoreBreakdown } from '@lumiris/types';

export interface MobileProduct extends MockProduct {
    /** Letter grade derived from the canonical 50/30/20 algorithm. */
    grade: IrisGradeLetter;
    /** Numeric 0–100 total — drives the wardrobe progress bar. */
    score: number;
    /** Per-axis sub-scores from `computeScore`. */
    breakdown: ScoreBreakdown;
    /** Reasons the score is below 100, surfaced in the reveal. */
    reasons: readonly string[];
    /** Anchor DPP — exposed for grade-aware components downstream. */
    dpp: DPPRecord;
}

export interface DiscoveryItem {
    id: string;
    title: string;
    subtitle: string;
    category: 'Trend' | 'Audit' | 'Regulation' | 'Lifestyle';
    grade: IrisGradeLetter;
    publishedAt: string;
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

const fallbackProduct = mockProducts[0];
if (!fallbackProduct) {
    throw new Error('mockProducts is empty — cannot derive SAMPLE_PRODUCT');
}
export const SAMPLE_PRODUCT: MobileProduct = WARDROBE_ITEMS[0] ?? enrich(fallbackProduct);

/** Pick a random product for the simulated scan flow. */
export function randomProduct(): MobileProduct {
    if (WARDROBE_ITEMS.length === 0) {
        return SAMPLE_PRODUCT;
    }
    const index = Math.floor(Math.random() * WARDROBE_ITEMS.length);
    return WARDROBE_ITEMS[index] ?? SAMPLE_PRODUCT;
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
