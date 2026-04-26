import { describe, expect, it } from 'bun:test';
import type { Certificate, DPPRecord } from '@lumiris/types';
import { LUMIRIS_WEIGHTS, computeScore, toIrisGrade } from '../index';

const fullyCompliantDPP: DPPRecord = {
    id: 'DPP-TEST-001',
    brand: 'Test Brand',
    productName: 'Organic Linen Shirt',
    sku: 'TST-001',
    status: 'Published_Live',
    submittedAt: '2026-01-01T00:00:00Z',
    auditorId: 'AUD-001',
    dataIntegrity: 100,
    missingFields: [],
    supplierFactory: 'EcoWeave Portugal Lda',
    carbonScore: 1.5,
    rawData: {
        product_name: 'Organic Linen Shirt',
        material_composition: '100% Organic Linen',
        country_of_origin: 'Portugal',
        manufacturer: 'EcoWeave Portugal Lda',
        recycled_content_percentage: 60,
        water_usage_liters: 400,
        carbon_footprint_kg: 1.5,
        durability_score: 'A+',
        repairability_index: 9,
        eu_compliance_version: 'ESPR-2024-v2',
    },
};

const validCert: Certificate = {
    id: 'CERT-T-1',
    brand: 'Test Brand',
    documentName: 'GOTS',
    type: 'Organic',
    organization: 'GOTS',
    expiryDate: '2027-01-01',
    scope: 'Full Production',
    factory: 'EcoWeave Portugal Lda',
    carbonScore: 1.5,
    status: 'Valid',
    crossCheckFlag: false,
};

describe('LUMIRIS Scoring Algorithm', () => {
    it('applies the 50/30/20 weights by default', () => {
        expect(LUMIRIS_WEIGHTS).toEqual({ integrity: 0.5, trust: 0.3, impact: 0.2 });
    });

    it('grades a fully compliant, certified DPP at A+', () => {
        const result = computeScore(fullyCompliantDPP, { certificates: [validCert] });
        expect(result.breakdown.integrity).toBe(100);
        expect(result.total).toBeGreaterThanOrEqual(90);
        expect(result.grade).toBe('A+');
    });

    it('drops the score sharply when mandatory fields are missing', () => {
        const broken: DPPRecord = {
            ...fullyCompliantDPP,
            auditorId: null,
            supplierFactory: 'Unknown',
            rawData: {
                product_name: 'Mystery Item',
                material_composition: null,
                country_of_origin: null,
                manufacturer: null,
                recycled_content_percentage: null,
                water_usage_liters: null,
                carbon_footprint_kg: null,
                durability_score: null,
                repairability_index: null,
                eu_compliance_version: null,
            },
        };
        const result = computeScore(broken);
        expect(result.grade).toBe('E');
        expect(result.reasons.length).toBeGreaterThan(0);
    });

    it('produces identical totals for the same input (deterministic)', () => {
        const a = computeScore(fullyCompliantDPP, { certificates: [validCert] });
        const b = computeScore(fullyCompliantDPP, { certificates: [validCert] });
        expect(a).toEqual(b);
    });

    it('renormalises custom weights to sum to 1', () => {
        const r = computeScore(fullyCompliantDPP, {
            certificates: [validCert],
            weights: { integrity: 5, trust: 3, impact: 2 },
        });
        const sum = r.weights.integrity + r.weights.trust + r.weights.impact;
        expect(sum).toBeCloseTo(1, 5);
    });

    it('maps boundaries correctly', () => {
        expect(toIrisGrade(100)).toBe('A+');
        expect(toIrisGrade(89.9)).toBe('A');
        expect(toIrisGrade(64.9)).toBe('C');
        expect(toIrisGrade(0)).toBe('E');
    });
});
