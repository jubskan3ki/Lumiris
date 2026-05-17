'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from './auth-store';

/** Id artisan courant côté store réactif (null si non connecté). */
export function useAuthArtisanId(): string | null {
    return useAuthStore((s) => s.artisanId);
}

/** Évite le flash redirect d'<AuthGuard> avant que zustand/persist ait relu le localStorage. */
export function useAuthHydrated(): boolean {
    const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());

    useEffect(() => {
        if (useAuthStore.persist.hasHydrated()) {
            setHydrated(true);
            return;
        }
        const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
        return unsub;
    }, []);

    return hydrated;
}
