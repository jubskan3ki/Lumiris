import type { ArtisanTier } from '@lumiris/types';
import { usePassports } from '@/lib/passports-source';

export const ATELIER_PASSPORT_LIMIT_LABEL: Record<ArtisanTier, string> = {
    Solo: '50',
    Studio: '300',
    Maison: '∞',
};

export function usePassportCount(artisanId: string): number {
    const passports = usePassports(artisanId);
    return passports.filter((p) => p.status !== 'Draft').length;
}
