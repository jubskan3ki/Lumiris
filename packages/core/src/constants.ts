import type { ScoreWeights } from '@lumiris/types';

/**
 * The LUMIRIS 50/30/20 rule — the immutable spine of the transparency score.
 * Changing these weights means changing the brand promise; do not edit lightly.
 */
export const LUMIRIS_WEIGHTS: ScoreWeights = {
    integrity: 0.5,
    trust: 0.3,
    impact: 0.2,
} as const;

/**
 * EU ESPR mandatory fields. A missing field linearly degrades the integrity axis.
 */
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

/**
 * Reference baseline used to normalise environmental impact (per garment).
 * These targets reflect the median of GOTS/Bluesign-certified textile lines.
 */
export const IMPACT_BASELINE = {
    /** Worst-case carbon footprint in kg CO₂e — anything above scores 0. */
    carbonCeilingKg: 12,
    /** Worst-case water usage in litres — anything above scores 0. */
    waterCeilingLiters: 3000,
    /** Recycled content target percentage — at or above scores full marks. */
    recycledTargetPct: 50,
} as const;
