'use client';

// Stats agrégées d'une garde-robe : distribution A→E + grade global pour la jauge
// "Wardrobe Health" + bilan CO₂/eau "évité" pour le profil. Helpers purs (testables
// isolément) + hook `useWardrobeStats` qui résout chaque entry vers son passeport mock,
// calcule le grade via @lumiris/core et garde tout mémoïsé.

import { useMemo } from 'react';
import { FIBER_IMPACT_COEFFICIENTS, FIBER_WATER_COEFFICIENTS, IMPACT_BASELINE } from '@lumiris/core/scoring';
import { mockPassportById } from '@lumiris/mock-data';
import type { IrisGrade, Passport } from '@lumiris/types';
import { scorePassport } from '../passport-score';
import { useWardrobe, type WardrobeEntry } from '../wardrobe-storage';

const FALLBACK_WEIGHT_G = 400;

type GradeDistribution = Record<IrisGrade, number>;

export function getGradeDistribution(grades: readonly IrisGrade[]): GradeDistribution {
    const dist: GradeDistribution = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    for (const grade of grades) dist[grade] += 1;
    return dist;
}

const GRADE_VALUE: Record<IrisGrade, number> = { A: 5, B: 4, C: 3, D: 2, E: 1 };

interface OverallScore {
    grade: IrisGrade;
    /** 0–100, alimente le `strokeDashoffset` de la jauge circulaire. */
    percentage: number;
}

export function getOverallScore(grades: readonly IrisGrade[]): OverallScore {
    if (grades.length === 0) return { grade: 'C', percentage: 0 };
    const total = grades.reduce((sum, g) => sum + GRADE_VALUE[g], 0);
    const avg = total / grades.length;
    const grade: IrisGrade = avg >= 4.5 ? 'A' : avg >= 3.5 ? 'B' : avg >= 2.5 ? 'C' : avg >= 1.5 ? 'D' : 'E';
    return { grade, percentage: (avg / 5) * 100 };
}

function carbonForPassport(p: Passport): number {
    if (typeof p.carbonKg === 'number') return p.carbonKg;
    const weightKg = (p.garment.dimensions?.weightG ?? FALLBACK_WEIGHT_G) / 1000;
    return p.materials.reduce((sum, m) => {
        const coef = FIBER_IMPACT_COEFFICIENTS[m.fiber] ?? FIBER_IMPACT_COEFFICIENTS.other;
        return sum + (m.percentage / 100) * coef * weightKg;
    }, 0);
}

function waterForPassport(p: Passport): number {
    if (typeof p.waterLiters === 'number') return p.waterLiters;
    const weightKg = (p.garment.dimensions?.weightG ?? FALLBACK_WEIGHT_G) / 1000;
    return p.materials.reduce((sum, m) => {
        const coef = FIBER_WATER_COEFFICIENTS[m.fiber] ?? FIBER_WATER_COEFFICIENTS.other;
        return sum + (m.percentage / 100) * coef * weightKg;
    }, 0);
}

interface ImpactSummary {
    /** Somme `max(0, plafond ADEME − empreinte calculée)` sur toutes les pièces, en kgCO₂e arrondis. */
    co2AvoidedKg: number;
    /** Idem pour l'eau, en litres entiers. */
    waterSavedLiters: number;
}

interface WardrobeStats {
    entries: readonly WardrobeEntry[];
    grades: readonly IrisGrade[];
    distribution: GradeDistribution;
    overall: OverallScore;
    impact: ImpactSummary;
}

export function useWardrobeStats(now: Date = new Date()): WardrobeStats {
    const entries = useWardrobe();
    const dayKey = now.toISOString().slice(0, 10);
    return useMemo(() => {
        const grades: IrisGrade[] = [];
        let co2Avoided = 0;
        let waterSaved = 0;
        for (const entry of entries) {
            const passport = mockPassportById(entry.passportId);
            if (!passport) continue;
            grades.push(scorePassport(passport, now).grade);
            co2Avoided += Math.max(0, IMPACT_BASELINE.carbonCeilingKg - carbonForPassport(passport));
            waterSaved += Math.max(0, IMPACT_BASELINE.waterCeilingLiters - waterForPassport(passport));
        }
        return {
            entries,
            grades,
            distribution: getGradeDistribution(grades),
            overall: getOverallScore(grades),
            impact: {
                co2AvoidedKg: Math.round(co2Avoided * 10) / 10,
                waterSavedLiters: Math.round(waterSaved),
            },
        };
    }, [entries, dayKey, now]);
}
