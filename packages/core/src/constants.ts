import type { ScoreWeights } from '@lumiris/types';

// 50/30/20 is the LUMIRIS brand promise — changing these weights changes the brand.
export const LUMIRIS_WEIGHTS: ScoreWeights = {
    integrity: 0.5,
    trust: 0.3,
    impact: 0.2,
} as const;

// EU ESPR mandatory fields — each missing one linearly degrades the integrity axis.
export const MANDATORY_DPP_FIELDS = [
    'product_name',
    'material_composition',
    'country_of_origin',
    'manufacturer',
    'recycled_content_percentage',
    'water_usage_liters',
    'carbon_footprint_kg',
    'durability_score',
    'repairability_index',
    'eu_compliance_version',
] as const;

export type MandatoryField = (typeof MANDATORY_DPP_FIELDS)[number];

// Per-garment baselines calibrated against the median of GOTS/Bluesign-certified textile lines.
export const IMPACT_BASELINE = {
    /** kg CO₂e — anything at or above scores 0. */
    carbonCeilingKg: 12,
    /** Litres — anything at or above scores 0. */
    waterCeilingLiters: 3000,
    /** Recycled content % — at or above scores full marks. */
    recycledTargetPct: 50,
} as const;
