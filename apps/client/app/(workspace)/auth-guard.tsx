'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthArtisanId, useAuthHydrated } from '@/lib/use-auth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const hydrated = useAuthHydrated();
    const artisanId = useAuthArtisanId();

    useEffect(() => {
        if (hydrated && !artisanId) {
            router.replace('/login');
        }
    }, [hydrated, artisanId, router]);

    if (!hydrated || !artisanId) return null;

    return <>{children}</>;
}
