'use client';

import { useMemo } from 'react';
import { mockPassports } from '@lumiris/mock-data';
import type { Passport } from '@lumiris/types';
import { useDraftStore, draftToPassport } from './draft-store';

/**
 * Combine les passeports mock (fixtures) avec les drafts persistés en localStorage.
 * Les drafts viennent en premier (créés récemment).
 * Filtré sur l'artisan courant.
 */
export function usePassports(artisanId: string): readonly Passport[] {
    const drafts = useDraftStore((s) => s.drafts);
    return useMemo(() => {
        const draftPassports = Object.values(drafts)
            .filter((d) => d.artisanId === artisanId)
            .map(draftToPassport);
        const fixed = mockPassports.filter((p) => p.artisanId === artisanId);
        return [...draftPassports, ...fixed];
    }, [drafts, artisanId]);
}
