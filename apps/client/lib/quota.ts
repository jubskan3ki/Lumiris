import { ARTISAN_PASSPORT_LIMIT } from '@lumiris/types';
import type { ArtisanTier, Passport } from '@lumiris/types';

export function activePassportCount(passports: readonly Passport[]): number {
    return passports.filter((p) => p.status !== 'Draft').length;
}

export function isQuotaReached(passports: readonly Passport[], tier: ArtisanTier): boolean {
    const limit = ARTISAN_PASSPORT_LIMIT[tier];
    if (!Number.isFinite(limit)) return false;
    return activePassportCount(passports) >= limit;
}

export function isQuotaNearLimit(passports: readonly Passport[], tier: ArtisanTier, threshold = 0.9): boolean {
    const limit = ARTISAN_PASSPORT_LIMIT[tier];
    if (!Number.isFinite(limit) || limit <= 0) return false;
    return activePassportCount(passports) / limit > threshold;
}

export function nextTier(tier: ArtisanTier): ArtisanTier | null {
    if (tier === 'Solo') return 'Studio';
    if (tier === 'Studio') return 'Maison';
    return null;
}
