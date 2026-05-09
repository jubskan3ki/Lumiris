// transparence 40 % - complétude composition (40) + factures (25) + photos étapes (20) + certifs fibres (15)

import type { Passport, ScoreReason } from '@lumiris/types';
import { getEffectiveWeight } from '@lumiris/types';
import type { AxisResult } from './types';

export function scoreTransparency(passport: Passport, now: Date): AxisResult {
    const reasons: ScoreReason[] = [];
    const composition = passport.materials;

    if (composition.length === 0) {
        reasons.push({
            axis: 'transparency',
            message: 'Composition vide - impossible de tracer la matière.',
            severity: 'error',
        });
        return { score: 0, reasons };
    }

    const sumPct = composition.reduce((s, m) => s + m.percentage, 0);
    const sumOk = Math.abs(sumPct - 100) < 1;
    const completeRows = composition.filter((m) => m.fiber && m.supplierId && m.originCountry).length;
    const completeRatio = completeRows / composition.length;
    const completenessPts = (sumOk ? 1 : 0.5) * completeRatio * 40;
    if (!sumOk) {
        reasons.push({
            axis: 'transparency',
            message: `Somme des pourcentages = ${sumPct.toFixed(1)} % (attendu 100 %).`,
            severity: 'error',
        });
    }
    if (completeRows < composition.length) {
        reasons.push({
            axis: 'transparency',
            message: `${composition.length - completeRows} ligne(s) de composition incomplète(s) (fibre/fournisseur/origine).`,
            severity: 'warn',
        });
    }

    const withInvoice = composition.filter((m) => !!m.invoiceRef).length;
    const invoiceRatio = withInvoice / composition.length;
    const invoicePts = invoiceRatio * 25;
    if (withInvoice < composition.length) {
        reasons.push({
            axis: 'transparency',
            message: `${composition.length - withInvoice} matière(s) sans facture fournisseur reliée.`,
            severity: 'warn',
        });
    }

    const steps = passport.steps;
    const stepsWithPhoto = steps.filter((s) => s.photos.length > 0).length;
    const stepsCount = Math.max(steps.length, 1);
    const photosRatio = stepsWithPhoto / stepsCount;
    const photosPts = photosRatio * 20;
    if (steps.length === 0) {
        reasons.push({
            axis: 'transparency',
            message: 'Aucune étape de fabrication documentée.',
            severity: 'error',
        });
    } else if (stepsWithPhoto < steps.length) {
        reasons.push({
            axis: 'transparency',
            message: `${steps.length - stepsWithPhoto} étape(s) sans photo.`,
            severity: 'warn',
        });
    }

    const fiberCertScores = composition.map((m) => {
        if (m.certifications.length === 0) return 0;
        const sum = m.certifications.reduce((acc, c) => acc + getEffectiveWeight(c, now), 0);
        return Math.min(1, sum / m.certifications.length);
    });
    const certsAverage = fiberCertScores.reduce((a, b) => a + b, 0) / composition.length;
    const certsPts = certsAverage * 15;
    if (certsAverage < 1) {
        const uncovered = composition.filter((m, i) => (fiberCertScores[i] ?? 0) < 1).length;
        reasons.push({
            axis: 'transparency',
            message: `${uncovered} matière(s) sans certification valide à jour.`,
            severity: 'info',
        });
    }

    const score = round(Math.max(0, Math.min(100, completenessPts + invoicePts + photosPts + certsPts)));
    return { score, reasons };
}

function round(n: number): number {
    return Math.round(n * 10) / 10;
}
