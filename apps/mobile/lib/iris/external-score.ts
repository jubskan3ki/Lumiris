// Score équivalent pour les DPP non-LUMIRIS lus par VISION (cahier §8).
// Réutilise les poids 40/25/25/10 et la logique de plafond D, mais adapte les
// pilotes aux champs standardisés ESPR : on ne touche jamais à @lumiris/core/scoring.

import { LUMIRIS_WEIGHTS } from '@lumiris/core/scoring';
import { toIrisGrade } from '@lumiris/core/scoring';
import type {
    ExternalDpp,
    ExternalDppSector,
    IrisAxis,
    IrisAxisBreakdown,
    ScoreCap,
    ScoreReason,
    ScoreResult,
} from '@lumiris/types';

// Plafond carbone "neutre" par secteur (kg CO₂e). Au-delà → sous-score carbone = 0.
// Sources : ADEME Base Empreinte 2024 + ICT Footprint v3 + Higg MSI v3.5.
const CARBON_CEILING_BY_SECTOR: Record<ExternalDppSector, number> = {
    electronics: 80,
    appliance: 800,
    furniture: 200,
    battery: 150,
    toy: 50,
    textile: 12,
};

// Labels secteur-agnostiques considérés "savoir-faire" - ESPR + référentiels publics
// (à étoffer plus tard si on rapatrie des labels d'un autre référentiel).
const CRAFTSMANSHIP_LABELS = [
    'EPV',
    'OFG',
    'Origine France',
    'Made in France',
    'Fairtrade',
    'NF Environnement',
    'PEFC',
    'FSC',
    'Blue Angel',
    'TCO Certified',
];

interface MissingField {
    path: string;
    /** ESPR (obligatoire pour tous DPP) ou AGEC (français, hors VISION → ignoré ici). */
    spec: 'ESPR';
}

function listMissingFields(dpp: ExternalDpp): readonly MissingField[] {
    const missing: MissingField[] = [];
    if (!dpp.productName?.trim()) missing.push({ path: 'productName', spec: 'ESPR' });
    if (!dpp.brand?.trim()) missing.push({ path: 'brand', spec: 'ESPR' });
    if (!dpp.emitter?.trim()) missing.push({ path: 'emitter', spec: 'ESPR' });
    if (!dpp.gtin?.trim()) missing.push({ path: 'gtin', spec: 'ESPR' });
    if (!dpp.manufacturedAt?.trim()) missing.push({ path: 'manufacturedAt', spec: 'ESPR' });
    if (!dpp.origin?.country?.trim()) missing.push({ path: 'origin.country', spec: 'ESPR' });
    if (dpp.materials.length === 0) {
        missing.push({ path: 'materials[]', spec: 'ESPR' });
    } else {
        const sum = dpp.materials.reduce((s, m) => s + (m.percentage ?? 0), 0);
        if (Math.abs(sum - 100) > 1) missing.push({ path: 'materials[].percentage(sum=100)', spec: 'ESPR' });
    }
    return missing;
}

function clamp(n: number, min = 0, max = 100): number {
    if (!Number.isFinite(n)) return min;
    return Math.max(min, Math.min(max, n));
}

function round1(n: number): number {
    return Math.round(n * 10) / 10;
}

interface AxisOutput {
    score: number;
    reasons: ScoreReason[];
}

// Transparence 40% - présence origine, certifications valides, complétude matières.
function scoreTransparency(dpp: ExternalDpp, now: Date): AxisOutput {
    const reasons: ScoreReason[] = [];
    const axis: IrisAxis = 'transparency';

    let score = 0;

    // Origine pays + région : 25 points.
    if (dpp.origin?.country) {
        const originScore = dpp.origin.region ? 25 : 18;
        score += originScore;
        reasons.push({
            axis,
            message: dpp.origin.region
                ? `Origine renseignée : ${dpp.origin.region}, ${dpp.origin.country}.`
                : `Pays d'origine renseigné : ${dpp.origin.country}.`,
            severity: 'info',
        });
    } else {
        reasons.push({ axis, message: "Pays d'origine non renseigné.", severity: 'warn' });
    }

    // Certifications valides au temps `now` : jusqu'à 40 points (palier 10 / 25 / 40).
    const validCerts = dpp.certifications.filter((c) => {
        if (!c.validUntil) return true;
        const exp = new Date(c.validUntil);
        return Number.isFinite(exp.getTime()) && exp.getTime() >= now.getTime();
    });
    if (validCerts.length === 0) {
        reasons.push({ axis, message: 'Aucune certification valide au scan.', severity: 'warn' });
    } else if (validCerts.length === 1) {
        score += 15;
        reasons.push({ axis, message: `1 certification valide : ${validCerts[0]?.name}.`, severity: 'info' });
    } else if (validCerts.length === 2) {
        score += 28;
        reasons.push({ axis, message: `${validCerts.length} certifications valides.`, severity: 'info' });
    } else {
        score += 40;
        reasons.push({ axis, message: `${validCerts.length} certifications valides.`, severity: 'info' });
    }

    // Complétude matières : 35 points si somme = 100 et toutes les lignes ont une part.
    if (dpp.materials.length > 0) {
        const sum = dpp.materials.reduce((s, m) => s + (m.percentage ?? 0), 0);
        const balanced = Math.abs(sum - 100) < 1 && dpp.materials.every((m) => (m.percentage ?? 0) > 0);
        if (balanced) {
            score += 35;
            reasons.push({
                axis,
                message: `Composition complète (${dpp.materials.length} matières, total 100 %).`,
                severity: 'info',
            });
        } else {
            score += 18;
            reasons.push({
                axis,
                message: 'Composition partielle - somme des pourcentages incomplète.',
                severity: 'warn',
            });
        }
    } else {
        reasons.push({ axis, message: 'Aucune matière renseignée.', severity: 'error' });
    }

    return { score: clamp(score), reasons };
}

// Savoir-faire 25% - labels reconnus + garantie longue.
function scoreCraftsmanship(dpp: ExternalDpp, now: Date): AxisOutput {
    const reasons: ScoreReason[] = [];
    const axis: IrisAxis = 'craftsmanship';
    let score = 0;

    const matched = dpp.certifications.filter((c) => {
        const isValid = !c.validUntil || new Date(c.validUntil).getTime() >= now.getTime();
        if (!isValid) return false;
        const haystack = `${c.name} ${c.issuer}`.toLowerCase();
        return CRAFTSMANSHIP_LABELS.some((label) => haystack.includes(label.toLowerCase()));
    });

    if (matched.length > 0) {
        score += 50;
        reasons.push({
            axis,
            message: `Label savoir-faire reconnu : ${matched.map((c) => c.name).join(', ')}.`,
            severity: 'info',
        });
    } else {
        reasons.push({ axis, message: 'Aucun label EPV / Origine France équivalent.', severity: 'warn' });
    }

    const months = dpp.warrantyMonths ?? 0;
    if (months >= 60) {
        score += 50;
        reasons.push({ axis, message: `Garantie ${months} mois - engagement durable.`, severity: 'info' });
    } else if (months >= 24) {
        score += 30;
        reasons.push({ axis, message: `Garantie ${months} mois (>= 24).`, severity: 'info' });
    } else if (months > 0) {
        score += 12;
        reasons.push({ axis, message: `Garantie courte (${months} mois).`, severity: 'warn' });
    } else {
        reasons.push({ axis, message: 'Garantie non renseignée.', severity: 'warn' });
    }

    return { score: clamp(score), reasons };
}

// Impact 25% - empreinte carbone (rang sectoriel) + part recyclée.
function scoreImpact(dpp: ExternalDpp): AxisOutput {
    const reasons: ScoreReason[] = [];
    const axis: IrisAxis = 'impact';
    let score = 0;

    const ceiling = CARBON_CEILING_BY_SECTOR[dpp.sector];
    if (typeof dpp.carbonFootprintKg === 'number' && Number.isFinite(dpp.carbonFootprintKg)) {
        const ratio = clamp(1 - dpp.carbonFootprintKg / ceiling, 0, 1);
        const carbonScore = Math.round(ratio * 50);
        score += carbonScore;
        reasons.push({
            axis,
            message: `Empreinte ${dpp.carbonFootprintKg.toFixed(1)} kg CO₂e - plafond secteur ${ceiling} kg.`,
            severity: ratio > 0.5 ? 'info' : 'warn',
        });
    } else {
        reasons.push({ axis, message: 'Empreinte carbone non déclarée.', severity: 'warn' });
    }

    // Part recyclée pondérée par la part matière de chaque ligne.
    const totalShare = dpp.materials.reduce((s, m) => s + (m.percentage ?? 0), 0);
    const recycledWeighted = dpp.materials.reduce(
        (s, m) => s + ((m.recycledShare ?? 0) * (m.percentage ?? 0)) / 100,
        0,
    );
    const recycledPct = totalShare > 0 ? clamp((recycledWeighted / totalShare) * 100, 0, 100) : 0;
    if (recycledPct > 0) {
        const recycledScore = Math.round(clamp(recycledPct / 50, 0, 1) * 50);
        score += recycledScore;
        reasons.push({
            axis,
            message: `Part recyclée pondérée ${Math.round(recycledPct)} %.`,
            severity: recycledPct >= 30 ? 'info' : 'warn',
        });
    } else {
        reasons.push({ axis, message: 'Aucune matière recyclée déclarée.', severity: 'warn' });
    }

    return { score: clamp(score), reasons };
}

// Réparabilité 10% - index FR + garantie longue.
function scoreRepairability(dpp: ExternalDpp): AxisOutput {
    const reasons: ScoreReason[] = [];
    const axis: IrisAxis = 'repairability';
    let score = 0;

    if (typeof dpp.repairabilityIndex === 'number' && Number.isFinite(dpp.repairabilityIndex)) {
        const idx = clamp(dpp.repairabilityIndex, 0, 10);
        score += Math.round((idx / 10) * 60);
        reasons.push({
            axis,
            message: `Indice de réparabilité FR : ${idx.toFixed(1)} / 10.`,
            severity: idx >= 7 ? 'info' : idx >= 5 ? 'warn' : 'error',
        });
    } else {
        reasons.push({ axis, message: 'Indice de réparabilité non renseigné.', severity: 'warn' });
    }

    const months = dpp.warrantyMonths ?? 0;
    if (months >= 36) {
        score += 40;
        reasons.push({ axis, message: `Garantie longue (${months} mois).`, severity: 'info' });
    } else if (months >= 24) {
        score += 20;
    }

    return { score: clamp(score), reasons };
}

/**
 * Calcule un ScoreResult équivalent à computeScore() de @lumiris/core, mais à partir
 * d'un ExternalDpp ESPR. Mêmes poids 40/25/25/10, même typage `ScoreResult` →
 * réutilisable par `IrisGrade`, `ScoreBreakdown`, `ScoreReasonsList`.
 */
export function computeExternalScore(dpp: ExternalDpp, now: Date = new Date()): ScoreResult {
    const transparency = scoreTransparency(dpp, now);
    const craftsmanship = scoreCraftsmanship(dpp, now);
    const impact = scoreImpact(dpp);
    const repairability = scoreRepairability(dpp);

    const breakdown: IrisAxisBreakdown = {
        transparency: transparency.score,
        craftsmanship: craftsmanship.score,
        impact: impact.score,
        repairability: repairability.score,
    };

    const total = round1(
        breakdown.transparency * LUMIRIS_WEIGHTS.transparency +
            breakdown.craftsmanship * LUMIRIS_WEIGHTS.craftsmanship +
            breakdown.impact * LUMIRIS_WEIGHTS.impact +
            breakdown.repairability * LUMIRIS_WEIGHTS.repairability,
    );

    const missing = listMissingFields(dpp);
    const capped = missing.length > 0;
    const grade = toIrisGrade(total, capped ? 'D' : undefined);

    const reasons: ScoreReason[] = [
        ...transparency.reasons,
        ...craftsmanship.reasons,
        ...impact.reasons,
        ...repairability.reasons,
    ];
    if (capped) {
        reasons.push({
            axis: 'transparency',
            message: `Score plafonné à D - champ ESPR manquant : ${missing.map((m) => m.path).join(', ')}.`,
            severity: 'error',
        });
    }

    const cap: ScoreCap = capped
        ? { applied: true, reason: `champ_espr_manquant: ${missing.map((m) => m.path).join(', ')}` }
        : { applied: false };

    return {
        total,
        grade,
        breakdown,
        weights: LUMIRIS_WEIGHTS,
        reasons,
        cap,
    };
}
