'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { IrisGrade } from '@lumiris/types';

// Couche de "modération étendue" - vit en mémoire dans l'admin app et n'altère JAMAIS
// les fixtures de @lumiris/mock-data. Encode les statuts qui n'existent pas dans le pivot
// v6.1 (changes_requested / flagged / archived) comme des overlays par passportId.
// Quand le backend arrivera, ce store sera remplacé par un fetch sur /admin/passports.

export type CurationOverlayStatus = 'pending' | 'validated' | 'changes_requested' | 'flagged' | 'archived';

interface CurationOverlay {
    /** Bascule logique appliquée par-dessus `passport.status` + `moderation.status`. */
    status: CurationOverlayStatus;
    flagReason?: string;
    flagTags?: readonly string[];
    changesMessage?: string;
    changesChecklist?: readonly string[];
    /** Override de score - overlay visuel uniquement, pas un vrai changement de score. */
    overrideGrade?: IrisGrade;
    overrideReason?: string;
    /** Trace minimaliste pour rejouer l'historique, en complément de l'audit log. */
    publishedAt?: string;
}

interface CurationStoreValue {
    overlays: ReadonlyMap<string, CurationOverlay>;
    setOverlay: (passportId: string, patch: Partial<CurationOverlay>) => void;
}

const CurationStoreContext = createContext<CurationStoreValue | null>(null);

export function CurationStoreProvider({ children }: { children: ReactNode }) {
    const [overlays, setOverlays] = useState<Map<string, CurationOverlay>>(() => new Map());

    const setOverlay = useCallback((passportId: string, patch: Partial<CurationOverlay>) => {
        setOverlays((prev) => {
            const next = new Map(prev);
            const current = next.get(passportId) ?? { status: 'pending' as CurationOverlayStatus };
            next.set(passportId, { ...current, ...patch });
            return next;
        });
    }, []);

    const value = useMemo<CurationStoreValue>(() => ({ overlays, setOverlay }), [overlays, setOverlay]);

    return <CurationStoreContext.Provider value={value}>{children}</CurationStoreContext.Provider>;
}

export function useCurationStore(): CurationStoreValue {
    const ctx = useContext(CurationStoreContext);
    if (!ctx) {
        throw new Error('useCurationStore must be used inside <CurationStoreProvider>.');
    }
    return ctx;
}
