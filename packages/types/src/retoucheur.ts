// retoucheur - alimente `repairability` (≥3 autour de la ville artisan) ; ne produit pas de passeports

import type { FrenchRegion } from './artisan';
import type { CertificationRef } from './certificate';
import type { Coordinates } from './passport';

export type RepairerSpecialty = 'alteration' | 'embroidery' | 'shoe-repair' | 'leather' | 'lining';

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
}
