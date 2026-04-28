import type { DPPRecord } from '@lumiris/types';
import { IMPACT_BASELINE } from '../constants';

// Impact axis (20%): three sub-scores equally weighted (carbon, water, circular); missing data scores 0 on its sub.
export function scoreImpact(dpp: DPPRecord): { score: number; reasons: string[] } {
    const raw = (dpp.rawData ?? {}) as Record<string, unknown>;
    const reasons: string[] = [];

    const carbon = numberOrNull(raw.carbon_footprint_kg);
    const water = numberOrNull(raw.water_usage_liters);
    const recycled = numberOrNull(raw.recycled_content_percentage);

    let carbonScore = 0;
    if (carbon == null) {
        reasons.push('Carbon footprint missing — impact penalised');
    } else {
        carbonScore = clamp(1 - carbon / IMPACT_BASELINE.carbonCeilingKg) * 100;
    }

    let waterScore = 0;
    if (water == null) {
        reasons.push('Water usage missing — impact penalised');
    } else {
        waterScore = clamp(1 - water / IMPACT_BASELINE.waterCeilingLiters) * 100;
    }

    let circularScore = 0;
    if (recycled == null) {
        reasons.push('Recycled content missing — impact penalised');
    } else {
        circularScore = clamp(recycled / IMPACT_BASELINE.recycledTargetPct) * 100;
    }

    const score = (carbonScore + waterScore + circularScore) / 3;
    return { score, reasons };
}

function numberOrNull(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function clamp(n: number, min = 0, max = 1): number {
    return Math.max(min, Math.min(max, n));
}
