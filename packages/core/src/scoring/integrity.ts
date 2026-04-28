import type { DPPRecord } from '@lumiris/types';
import { MANDATORY_DPP_FIELDS } from '../constants';

// Integrity axis (50%): share of EU ESPR mandatory fields present and non-null in the DPP raw payload.
export function scoreIntegrity(dpp: DPPRecord): { score: number; reasons: string[] } {
    const raw = (dpp.rawData ?? {}) as Record<string, unknown>;
    const missing: string[] = [];
    let present = 0;

    for (const field of MANDATORY_DPP_FIELDS) {
        const value = raw[field];
        if (value === null || value === undefined || value === '') {
            missing.push(field);
        } else {
            present += 1;
        }
    }

    const score = (present / MANDATORY_DPP_FIELDS.length) * 100;
    const reasons = missing.map((f) => `Missing mandatory field: ${f}`);
    return { score, reasons };
}
