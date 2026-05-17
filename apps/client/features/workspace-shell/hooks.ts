'use client';

import { useMemo } from 'react';
import { mockCertificates } from '@lumiris/mock-data';
import type { Artisan, ArtisanTier, CertificationRef } from '@lumiris/types';
import { useBilling } from '@/lib/billing-store';
import { usePassports } from '@/lib/passports-source';
import { buildNotifications, type AtelierNotification } from '@/lib/notifications-mock';

export const ATELIER_PASSPORT_LIMIT_LABEL: Record<ArtisanTier, string> = {
    Solo: '50',
    Studio: '300',
    Maison: '∞',
};

export function usePassportCount(artisanId: string): number {
    const passports = usePassports(artisanId);
    return passports.filter((p) => p.status !== 'Draft').length;
}

export function useHasAtelierPlus(artisanId: string): boolean {
    return useBilling(artisanId).atelierPlus;
}

export function useWorkspaceNotifications(artisan: Artisan): readonly AtelierNotification[] {
    const passports = usePassports(artisan.id);
    return useMemo(
        () =>
            buildNotifications({
                artisan,
                passports,
                certificates: mockCertificates as readonly CertificationRef[],
            }),
        [artisan, passports],
    );
}
