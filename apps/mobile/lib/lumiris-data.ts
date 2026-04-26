/**
 * Mobile-local fixture surface. The mobile features were authored against this
 * shape before the cross-app reorg landed; this shim keeps them compiling
 * while routing the SKUs and the score back to the canonical sources:
 *
 *   - DPP & products → `@lumiris/mock-data`
 *   - 50/30/20 grade → `@lumiris/core`'s `computeScore`
 *
 * Anything visual (colours, labels) lives here because it is mobile-specific
 * UI dressing — there is no shared `GRADE_CONFIG` to re-export from
 * `@lumiris/scoring-ui` (the canonical mapping there is Tailwind tokens via
 * `GRADE_COLOR`, not raw hex strings used in inline `style={...}`).
 */

import { computeScore } from '@lumiris/core/scoring';
import { mockCertificates, mockProducts, type MockProduct } from '@lumiris/mock-data';
import { mockDppById } from '@lumiris/mock-data/dpp';

export type ProductGrade = 'A' | 'B' | 'C' | 'D' | 'E';

export interface Product extends MockProduct {
    /** Letter grade derived from the canonical 50/30/20 algorithm. */
    grade: ProductGrade;
}

export interface DiscoveryItem {
    id: string;
    title: string;
    subtitle: string;
    category: 'Trend' | 'Audit' | 'Regulation' | 'Lifestyle';
    grade: ProductGrade;
    publishedAt: string;
}

export interface GradeConfigEntry {
    /** CSS colour string used inline in mobile components. Do not duplicate; if
     *  you need a Tailwind class, import `gradeColor()` from `@lumiris/scoring-ui`. */
    color: string;
    label: string;
}

export const GRADE_CONFIG: Record<ProductGrade, GradeConfigEntry> = {
    A: { color: 'oklch(0.55 0.18 160)', label: 'Transparent' },
    B: { color: 'oklch(0.60 0.13 195)', label: 'Trusted' },
    C: { color: 'oklch(0.72 0.16 85)', label: 'Mixed' },
    D: { color: 'oklch(0.65 0.18 50)', label: 'Opaque' },
    E: { color: 'oklch(0.55 0.20 15)', label: 'Withheld' },
};

function gradeFromDpp(dppId: string): ProductGrade {
    const dpp = mockDppById(dppId);
    if (!dpp) return 'E';
    const { grade } = computeScore(dpp, { certificates: mockCertificates });
    // mobile fixtures collapse A+ into A — there is no `+` row in GRADE_CONFIG
    return grade === 'A+' ? 'A' : (grade as ProductGrade);
}

const enrich = (p: MockProduct): Product => ({ ...p, grade: gradeFromDpp(p.dppId) });

export const WARDROBE_ITEMS: Product[] = mockProducts.map(enrich);

export const SAMPLE_PRODUCT: Product = WARDROBE_ITEMS[0] ?? enrich(mockProducts[0]!);

export const DISCOVERY_FEED: DiscoveryItem[] = [
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
        grade: 'A',
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
