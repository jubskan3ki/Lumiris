'use client';

import { useMemo } from 'react';
import type { Passport, ScoreResult } from '@lumiris/types';
import { useComputeScore } from '@lumiris/scoring-ui';
import { mockArtisans, mockRepairers } from '@lumiris/mock-data';
import { useCurationStore } from './curation-store';
import type { EffectiveStatus, PassportRow } from './types';

const SCORING_NOW = new Date('2026-04-30T08:00:00Z');

function deriveEffectiveStatus(passport: Passport, overlayStatus: EffectiveStatus | undefined): EffectiveStatus {
    if (overlayStatus) return overlayStatus;
    if (passport.moderation?.status === 'Approved') return 'validated';
    if (passport.moderation?.status === 'Rejected') return 'flagged';
    return 'pending';
}

/** Retourne les rows enrichis (passport + status + délai) — base pour la file de curation. */
export function usePassportRows(passports: readonly Passport[]): readonly PassportRow[] {
    const { overlays } = useCurationStore();
    return useMemo(() => {
        const now = Date.now();
        return passports.map((passport) => {
            const overlay = overlays.get(passport.id);
            const ageHours = Math.max(0, Math.round((now - new Date(passport.createdAt).getTime()) / 3_600_000));
            return {
                passport,
                status: deriveEffectiveStatus(passport, overlay?.status),
                ageHours,
            };
        });
    }, [passports, overlays]);
}

/** Score Iris d'un passeport, calculé en injectant l'artisan + retoucheurs locaux. */
export function useIrisScore(passport: Passport): ScoreResult {
    const options = useMemo(() => {
        const artisan = mockArtisans.find((a) => a.id === passport.artisanId);
        return {
            certificates: passport.materials.flatMap((m) => m.certifications),
            ...(artisan ? { artisan } : {}),
            retoucheurs: mockRepairers,
            now: SCORING_NOW,
        };
    }, [passport]);
    return useComputeScore(passport, options);
}
