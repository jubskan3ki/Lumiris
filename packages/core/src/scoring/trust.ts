import type { Certificate, DPPRecord } from '@lumiris/types';

// Trust axis (30%): 40 pts auditor + 20 pts named supplier + 40 pts cert coverage (≥2 = full); -10 if any cert is cross-check flagged.
export function scoreTrust(
    dpp: DPPRecord,
    certificates: readonly Certificate[] = [],
): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    if (dpp.auditorId) {
        score += 40;
    } else {
        reasons.push('No auditor assigned');
    }

    if (dpp.supplierFactory && dpp.supplierFactory.toLowerCase() !== 'unknown') {
        score += 20;
    } else {
        reasons.push('Supplier factory is unknown');
    }

    const matching = certificates.filter((c) => c.factory === dpp.supplierFactory && c.status === 'Valid');
    if (matching.length === 0) {
        reasons.push('No valid certificate covers this supplier factory');
    } else {
        const coverage = Math.min(matching.length / 2, 1);
        score += 40 * coverage;
        if (matching.some((c) => c.crossCheckFlag)) {
            reasons.push('Certificate flagged for cross-check discrepancy');
            score -= 10;
        }
    }

    return { score: Math.max(0, Math.min(100, score)), reasons };
}
