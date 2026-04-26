/**
 * Rich consumer-facing product fixtures used by the mobile reveal. Every entry
 * is anchored to a real DPP (`dppId`) so `computeScore(mockDppById(p.dppId), …)`
 * is the canonical grade — there is no `grade` field stored here.
 */

import type { DPPRecord } from '@lumiris/types';
import { mockDppById } from './dpp';

export type ProductCategory = 'Outerwear' | 'Knitwear' | 'Shirts & Blouses' | 'Dresses' | 'Accessories' | 'Base Layers';

export type PriceGradeRatio = 'Great Deal' | 'Fair' | 'Overpriced';

export interface ProductCompositionPart {
    material: string;
    percentage: number;
    isRecycled: boolean;
    origin?: string;
    originFlag?: string;
}

export interface ProductEnvironmentalStat {
    label: string;
    value: number | string;
    unit: string;
    comparison: string;
}

export interface ProductJourneyStep {
    stage: string;
    location: string;
    country: string;
    date: string;
    flag?: string;
}

export interface ProductCertificate {
    name: string;
    issuer: string;
    verified: boolean;
}

export interface MockProduct {
    /** Stable id used for navigation; distinct from dppId to allow stable URLs. */
    id: string;
    /** Anchor into the canonical DPP fixture — drives the score. */
    dppId: string;
    name: string;
    brand: string;
    category: ProductCategory;
    price: number;
    priceGradeRatio: PriceGradeRatio;
    composition: ProductCompositionPart[];
    environmental: ProductEnvironmentalStat[];
    journey: ProductJourneyStep[];
    certificates: ProductCertificate[];
    scannedAt: string;
}

export const mockProducts: readonly MockProduct[] = [
    {
        id: 'PROD-2024-001',
        dppId: 'DPP-2024-003',
        name: 'Organic Linen Shirt',
        brand: 'Verde Collective',
        category: 'Shirts & Blouses',
        price: 89,
        priceGradeRatio: 'Great Deal',
        composition: [
            { material: 'Organic Linen', percentage: 100, isRecycled: false, origin: 'Portugal', originFlag: '🇵🇹' },
        ],
        environmental: [
            { label: 'Carbon', value: 1.8, unit: 'kg CO₂e', comparison: '85% lower than category avg' },
            { label: 'Water', value: 450, unit: 'L', comparison: '6× less than conventional cotton' },
            { label: 'Energy', value: 2.4, unit: 'kWh', comparison: 'Equivalent to 2h of laptop use' },
        ],
        journey: [
            { stage: 'Material', location: 'Alentejo', country: 'Portugal', date: '2024-08-12', flag: '🇵🇹' },
            { stage: 'Spinning', location: 'Porto', country: 'Portugal', date: '2024-09-03', flag: '🇵🇹' },
            { stage: 'Weaving', location: 'Guimarães', country: 'Portugal', date: '2024-09-21', flag: '🇵🇹' },
            { stage: 'Sewing', location: 'Lisbon', country: 'Portugal', date: '2024-10-15', flag: '🇵🇹' },
        ],
        certificates: [
            { name: 'OEKO-TEX Standard 100', issuer: 'OEKO-TEX Association', verified: true },
            { name: 'GOTS Organic', issuer: 'Global Organic Textile Standard', verified: true },
        ],
        scannedAt: '2024-12-16T08:24:00Z',
    },
    {
        id: 'PROD-2024-002',
        dppId: 'DPP-2024-005',
        name: 'Hemp Canvas Tote',
        brand: 'Atelier Nord',
        category: 'Accessories',
        price: 45,
        priceGradeRatio: 'Great Deal',
        composition: [
            { material: 'Organic Hemp', percentage: 100, isRecycled: false, origin: 'Finland', originFlag: '🇫🇮' },
        ],
        environmental: [
            { label: 'Carbon', value: 0.9, unit: 'kg CO₂e', comparison: '92% lower than nylon tote' },
            { label: 'Water', value: 120, unit: 'L', comparison: 'Hemp needs ~50% less water than cotton' },
            { label: 'Energy', value: 1.1, unit: 'kWh', comparison: 'Equivalent to a 60W bulb for 18h' },
        ],
        journey: [
            { stage: 'Material', location: 'Tampere', country: 'Finland', date: '2024-09-01', flag: '🇫🇮' },
            { stage: 'Weaving', location: 'Oulu', country: 'Finland', date: '2024-09-22', flag: '🇫🇮' },
            { stage: 'Cutting', location: 'Stockholm', country: 'Sweden', date: '2024-10-10', flag: '🇸🇪' },
        ],
        certificates: [{ name: 'Bluesign Partner', issuer: 'Bluesign Technologies', verified: true }],
        scannedAt: '2024-12-15T14:11:00Z',
    },
    {
        id: 'PROD-2024-003',
        dppId: 'DPP-2024-007',
        name: 'Tencel Midi Dress',
        brand: 'Lux Fabrica',
        category: 'Dresses',
        price: 159,
        priceGradeRatio: 'Fair',
        composition: [
            { material: 'Tencel Lyocell', percentage: 90, isRecycled: false, origin: 'Portugal', originFlag: '🇵🇹' },
            { material: 'Elastane', percentage: 10, isRecycled: false },
        ],
        environmental: [
            { label: 'Carbon', value: 2.1, unit: 'kg CO₂e', comparison: '60% lower than viscose dress' },
            { label: 'Water', value: 380, unit: 'L', comparison: 'Closed-loop solvent recovery' },
            { label: 'Energy', value: 3.1, unit: 'kWh', comparison: 'Half a viscose equivalent' },
        ],
        journey: [
            { stage: 'Material', location: 'Lenzing', country: 'Austria', date: '2024-08-21', flag: '🇦🇹' },
            { stage: 'Spinning', location: 'Porto', country: 'Portugal', date: '2024-09-12', flag: '🇵🇹' },
            { stage: 'Sewing', location: 'Braga', country: 'Portugal', date: '2024-10-09', flag: '🇵🇹' },
        ],
        certificates: [{ name: 'GRS Recycled Content', issuer: 'Textile Exchange', verified: false }],
        scannedAt: '2024-12-15T17:32:00Z',
    },
    {
        id: 'PROD-2024-004',
        dppId: 'DPP-2024-001',
        name: 'Silk Draped Blazer',
        brand: 'Maison Lumiere',
        category: 'Outerwear',
        price: 420,
        priceGradeRatio: 'Fair',
        composition: [
            { material: 'Silk', percentage: 78, isRecycled: false, origin: 'Italy', originFlag: '🇮🇹' },
            { material: 'Organic Cotton', percentage: 22, isRecycled: false, origin: 'Italy', originFlag: '🇮🇹' },
        ],
        environmental: [
            { label: 'Carbon', value: 4.2, unit: 'kg CO₂e', comparison: 'On par with category avg' },
            { label: 'Water', value: '—', unit: 'L', comparison: 'Pending supplier disclosure' },
            { label: 'Energy', value: 5.8, unit: 'kWh', comparison: 'Silk processing is energy-intensive' },
        ],
        journey: [
            { stage: 'Material', location: 'Como', country: 'Italy', date: '2024-08-01', flag: '🇮🇹' },
            { stage: 'Weaving', location: 'Milan', country: 'Italy', date: '2024-09-04', flag: '🇮🇹' },
            { stage: 'Tailoring', location: 'Florence', country: 'Italy', date: '2024-10-02', flag: '🇮🇹' },
        ],
        certificates: [{ name: 'GOTS Organic Cotton', issuer: 'Global Organic Textile Standard', verified: true }],
        scannedAt: '2024-12-14T11:08:00Z',
    },
    {
        id: 'PROD-2024-005',
        dppId: 'DPP-2024-002',
        name: 'Recycled Wool Overcoat',
        brand: 'Atelier Nord',
        category: 'Outerwear',
        price: 380,
        priceGradeRatio: 'Overpriced',
        composition: [
            { material: 'Recycled Wool', percentage: 65, isRecycled: true, origin: 'Sweden', originFlag: '🇸🇪' },
            { material: 'Polyester', percentage: 35, isRecycled: false, origin: 'Sweden', originFlag: '🇸🇪' },
        ],
        environmental: [
            { label: 'Carbon', value: '—', unit: 'kg CO₂e', comparison: 'Pending supplier disclosure' },
            { label: 'Water', value: 2100, unit: 'L', comparison: 'Above category avg' },
            { label: 'Energy', value: '—', unit: 'kWh', comparison: 'Pending supplier disclosure' },
        ],
        journey: [
            { stage: 'Recovery', location: 'Gothenburg', country: 'Sweden', date: '2024-08-19', flag: '🇸🇪' },
            { stage: 'Spinning', location: 'Borås', country: 'Sweden', date: '2024-09-08', flag: '🇸🇪' },
            { stage: 'Tailoring', location: 'Stockholm', country: 'Sweden', date: '2024-10-25', flag: '🇸🇪' },
        ],
        certificates: [],
        scannedAt: '2024-12-13T09:50:00Z',
    },
    {
        id: 'PROD-2024-006',
        dppId: 'DPP-2024-008',
        name: 'Merino Base Layer',
        brand: 'Lux Fabrica',
        category: 'Base Layers',
        price: 110,
        priceGradeRatio: 'Fair',
        composition: [
            { material: 'Merino Wool', percentage: 100, isRecycled: false, origin: 'Italy', originFlag: '🇮🇹' },
        ],
        environmental: [
            { label: 'Carbon', value: 3.5, unit: 'kg CO₂e', comparison: 'Slightly above category avg' },
            { label: 'Water', value: '—', unit: 'L', comparison: 'Pending supplier disclosure' },
            { label: 'Energy', value: 4.0, unit: 'kWh', comparison: 'Wool finishing is energy-heavy' },
        ],
        journey: [
            { stage: 'Material', location: 'Biella', country: 'Italy', date: '2024-09-12', flag: '🇮🇹' },
            { stage: 'Knitting', location: 'Milan', country: 'Italy', date: '2024-10-03', flag: '🇮🇹' },
        ],
        certificates: [{ name: 'Responsible Wool Standard', issuer: 'Textile Exchange', verified: false }],
        scannedAt: '2024-12-12T16:42:00Z',
    },
    {
        id: 'PROD-2024-007',
        dppId: 'DPP-2024-006',
        name: 'Bamboo Knit Sweater',
        brand: 'Verde Collective',
        category: 'Knitwear',
        price: 95,
        priceGradeRatio: 'Overpriced',
        composition: [{ material: 'Undisclosed', percentage: 100, isRecycled: false }],
        environmental: [
            { label: 'Carbon', value: '—', unit: 'kg CO₂e', comparison: 'Brand has not disclosed' },
            { label: 'Water', value: '—', unit: 'L', comparison: 'Brand has not disclosed' },
            { label: 'Energy', value: '—', unit: 'kWh', comparison: 'Brand has not disclosed' },
        ],
        journey: [{ stage: 'Sourcing', location: 'Unknown', country: '', date: '—' }],
        certificates: [],
        scannedAt: '2024-12-11T10:18:00Z',
    },
    {
        id: 'PROD-2024-008',
        dppId: 'DPP-2024-004',
        name: 'Cashmere Pullover',
        brand: 'Maison Lumiere',
        category: 'Knitwear',
        price: 540,
        priceGradeRatio: 'Overpriced',
        composition: [{ material: 'Undisclosed', percentage: 100, isRecycled: false }],
        environmental: [
            { label: 'Carbon', value: '—', unit: 'kg CO₂e', comparison: 'Pending supplier disclosure' },
            { label: 'Water', value: '—', unit: 'L', comparison: 'Pending supplier disclosure' },
            { label: 'Energy', value: '—', unit: 'kWh', comparison: 'Pending supplier disclosure' },
        ],
        journey: [{ stage: 'Sourcing', location: 'Italy', country: 'Italy', date: '—', flag: '🇮🇹' }],
        certificates: [],
        scannedAt: '2024-12-10T13:01:00Z',
    },
] as const;

export function mockProductById(id: string): MockProduct | undefined {
    return mockProducts.find((p) => p.id === id);
}

export function mockProductDpp(product: MockProduct): DPPRecord | undefined {
    return mockDppById(product.dppId);
}

/** Default highlight reel — wardrobe and feed both consume from the same head. */
export const sampleProduct: MockProduct = mockProducts[0]!;
