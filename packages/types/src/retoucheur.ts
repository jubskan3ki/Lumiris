// retoucheur - alimente `repairability` (≥3 autour de la ville artisan) ; ne produit pas de passeports

import type { FrenchRegion } from './artisan';
import type { CertificationRef } from './certificate';
import type { Coordinates } from './passport';

export type RepairerSpecialty =
    // textile (V0)
    | 'alteration'
    | 'embroidery'
    | 'shoe-repair'
    | 'leather'
    | 'lining'
    // électronique (préparation V2+)
    | 'electronics-repair'
    | 'phone-repair'
    | 'computer-repair'
    // mobilier (préparation V2+)
    | 'cabinetmaking'
    | 'upholstery'
    // électroménager (préparation V2+)
    | 'appliance-repair';

export type RepairerSector = 'textile' | 'electronics' | 'furniture' | 'appliance';

export const SPECIALTY_TO_SECTOR: Record<RepairerSpecialty, RepairerSector> = {
    alteration: 'textile',
    embroidery: 'textile',
    'shoe-repair': 'textile',
    leather: 'textile',
    lining: 'textile',
    'electronics-repair': 'electronics',
    'phone-repair': 'electronics',
    'computer-repair': 'electronics',
    cabinetmaking: 'furniture',
    upholstery: 'furniture',
    'appliance-repair': 'appliance',
};

export interface RepairerPriceRange {
    min: number;
    max: number;
    currency: 'EUR';
}

export interface Repairer {
    id: string;
    displayName: string;
    atelierName?: string;
    city: string;
    region: FrenchRegion;
    /** Distance au consommateur en km - souvent calculée côté client à partir de la géoloc. Optionnel sur le mock. */
    distanceKm?: number;
    /** Optionnel - quand fourni, alimente le tri par distance côté `<RepairersNearby />`. */
    coordinates?: Coordinates;
    specialities: readonly RepairerSpecialty[];
    certifications: readonly CertificationRef[];
    /** 0 – 5. */
    avgRating: number;
    reviewCount: number;
    avgDelayDays: number;
    priceRange: RepairerPriceRange;
    /** Abonné au service "Local" payant (visible sur la carte consumer). */
    localSubscribed: boolean;
    joinedAt: string;
    /** E.164 si possible : "+33612345678". */
    phone?: string;
    /** Contact pro. */
    email?: string;
}
