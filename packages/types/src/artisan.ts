// artisan derrière un Passport - tier Solo/Studio/Maison + flag ATELIER+ + labels EPV/OFG

/** Tiers d'abonnement ATELIER. Conditionne `passportLimit`. */
export type ArtisanTier = 'Solo' | 'Studio' | 'Maison';

/** Régions FR métropole - string union plutôt qu'INSEE pour libellé humain en UI. */
export type FrenchRegion =
    | 'Auvergne-Rhône-Alpes'
    | 'Bourgogne-Franche-Comté'
    | 'Bretagne'
    | 'Centre-Val de Loire'
    | 'Corse'
    | 'Grand Est'
    | 'Hauts-de-France'
    | 'Île-de-France'
    | 'Normandie'
    | 'Nouvelle-Aquitaine'
    | 'Occitanie'
    | 'Pays de la Loire'
    | "Provence-Alpes-Côte d'Azur";

export interface Artisan {
    id: string;
    displayName: string;
    atelierName: string;
    city: string;
    region: FrenchRegion;
    tier: ArtisanTier;
    /** ATELIER+ activé : module dépôt-vente + factures + analytics. */
    plus: boolean;
    epvLabeled: boolean;
    ofgLabeled: boolean;
    specialities: readonly string[];
    story: string;
    photoUrl: string;
    joinedAt: string;
    /** URL absolue du site externe de l'atelier (https://…). Optionnel : tous n'en ont pas. */
    websiteUrl?: string;
    /** Plafond de passeports actifs (50 Solo / 300 Studio / Infinity Maison). */
    passportLimit: number;
}

/** Plafonds par tier - la source de vérité pour `Artisan.passportLimit`. */
export const ARTISAN_PASSPORT_LIMIT: Record<ArtisanTier, number> = {
    Solo: 50,
    Studio: 300,
    Maison: Number.POSITIVE_INFINITY,
};
