// DPP non-LUMIRIS lu par VISION : passeport ESPR standardisé d'un autre émetteur.
// VISION reste universelle (cahier §3) - on calcule un score équivalent à partir
// des données standardisées (cahier §8). Aucune création possible côté UI : VISION
// est consultation pour ces DPP.

import type { CountryCode } from './passport';

export type ExternalDppSector = 'electronics' | 'appliance' | 'furniture' | 'battery' | 'toy' | 'textile';

export interface ExternalDppMaterial {
    name: string;
    /** 0–100. La somme des `percentage` doit valoir 100. */
    percentage: number;
    /** Part de matière recyclée dans cette ligne (0–100). */
    recycledShare?: number;
}

export interface ExternalDppCertification {
    name: string;
    issuer: string;
    /** ISO date - quand renseignée, on calcule un statut effectif au temps `now`. */
    validUntil?: string;
}

export interface ExternalDppOrigin {
    country: CountryCode;
    region?: string;
}

export interface ExternalDpp {
    source: 'external-espr';
    /** Émetteur ESPR (entreprise, ex. "Fairphone", "BSH Hausgeräte"). */
    emitter: string;
    gtin: string;
    serial?: string;
    sector: ExternalDppSector;
    productName: string;
    brand: string;
    /** ISO date de fabrication. */
    manufacturedAt: string;
    origin: ExternalDppOrigin;
    materials: readonly ExternalDppMaterial[];
    certifications: readonly ExternalDppCertification[];
    warrantyMonths?: number;
    /** Index français de réparabilité 0..10 (quand il existe). */
    repairabilityIndex?: number;
    carbonFootprintKg?: number;
}
