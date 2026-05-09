// passport textile : materials + steps + certifications + warranty + care

import type { CertificationRef } from './certificate';

/** GS1 Digital Link en clair, format `https://id.lumiris.fr/01/<gtin>/21/<serial>`. */
export type GS1DigitalLink = string;

/** Identifiant GS1 décomposé - porté par `Passport.gs1`, exposé décomposé pour les UIs. */
export interface GS1Identifier {
    gtin: string;
    serial: string;
    /** URL publique de vérification - typiquement `https://lumiris.fr/passeport/<id>`. */
    verificationUrl: string;
    /** Numéro de série NFC quand le passeport est livré avec une puce. */
    nfcSerial?: string;
}

/** Coordonnées géographiques WGS84 pour atelier / fournisseur / retoucheur. */
export interface Coordinates {
    lat: number;
    lng: number;
}

export type PassportStatus = 'Draft' | 'InCompletion' | 'Published';

export type Fiber =
    | 'wool'
    | 'linen'
    | 'cotton'
    | 'silk'
    | 'hemp'
    | 'leather'
    | 'cashmere'
    | 'recycled-polyester'
    | 'other';

/** ISO 3166-1 alpha-2 (e.g. `FR`, `IT`). */
export type CountryCode = string;

export interface Material {
    fiber: Fiber;
    /** 0–100. La somme des `percentage` du tableau `materials` doit valoir 100. */
    percentage: number;
    supplierId: string;
    originCountry: CountryCode;
    certifications: readonly CertificationRef[];
    /** Référence vers une SupplierInvoice qui justifie cette ligne (cf. invoice.ts). */
    invoiceRef?: string;
}

export type StageKind =
    | 'weaving'
    | 'dyeing'
    | 'cutting'
    | 'sewing'
    | 'finishing'
    | 'embroidery'
    | 'assembly'
    | 'quality-check'
    | 'other';

export interface ProductionStep {
    id: string;
    kind: StageKind;
    /** Libellé court FR affiché côté Vision (`Tissage à la navette`). */
    label: string;
    /** Nom de la personne / atelier qui a réalisé l'étape. Comparé à artisan.displayName / atelierName pour le sous-score "part artisanale". */
    performedBy: string;
    locationCity: string;
    locationCountry: CountryCode;
    photos: readonly string[];
    performedAt?: string;
}

export type GarmentKind = 'sweater' | 'shirt' | 'shoe' | 'jacket' | 'trouser' | 'accessory' | 'other';
/** @deprecated alias historique - utiliser {@link GarmentKind}. */
export type ProductKind = GarmentKind;

export interface GarmentDimensions {
    length?: number;
    width?: number;
    height?: number;
    /** Masse en grammes - utilisée par le scoring impact pour calculer kgCO₂e. */
    weightG?: number;
}
/** @deprecated alias historique - utiliser {@link GarmentDimensions}. */
export type ProductDimensions = GarmentDimensions;

export interface GarmentInfo {
    kind: GarmentKind;
    reference: string;
    mainPhotoUrl: string;
    dimensions: GarmentDimensions;
    retailPrice: number;
    currency: 'EUR';
}
/** @deprecated alias historique - utiliser {@link GarmentInfo}. */
export type ProductInfo = GarmentInfo;

export interface PassportWarranty {
    durationMonths: number;
    terms: string;
    /** Engagement de réparabilité en clair - `>= 30` caractères contribue à l'axe Réparabilité. */
    repairabilityCommitment?: string;
}

export interface CareInstructions {
    washing: string;
    drying: string;
    ironing: string;
    storage: string;
}

export type ModerationStatus = 'PendingReview' | 'Approved' | 'Rejected';

export interface PassportModeration {
    status: ModerationStatus;
    reviewerId: string;
    reviewedAt: string;
    notes?: string;
}

export interface Passport {
    id: string;
    /** Identifiant GS1 décomposé - gtin + serial + URL de vérification consommateur. */
    gs1: GS1Identifier;
    status: PassportStatus;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    artisanId: string;
    /** Pièce textile (référence, photo, dimensions, prix). */
    garment: GarmentInfo;
    /** Composition matières - somme des `percentage` doit faire 100. */
    materials: readonly Material[];
    /** Étapes de fabrication ordonnées. */
    steps: readonly ProductionStep[];
    /** Certifications du *passeport* (ex. AGEC d'ensemble) - distinct des certifs *par matière* dans `materials[].certifications`. */
    certifications: readonly CertificationRef[];
    warranty: PassportWarranty;
    moderation?: PassportModeration;
    /** Conseils d'entretien - affichés sur la page consommateur, contribuent à l'AGEC. */
    care?: CareInstructions;
    /** Empreinte carbone déclarée (kg CO₂e). Quand renseignée, prime sur le calcul fibre × masse. */
    carbonKg?: number;
    /** Consommation d'eau déclarée (L). Idem : prime sur le calcul fibre × masse. */
    waterLiters?: number;
    /** Part recyclée déclarée (%). Idem : prime sur la somme `recycled-polyester` du `materials`. */
    recycledPct?: number;
    /** Distance transport totale (km). Quand renseignée, alimente un sous-score impact dédié. */
    transportKm?: number;
}

/** Construit un GS1 Digital Link `https://id.lumiris.fr/01/<gtin>/21/<serial>`. */
export function buildGS1DigitalLink(gtin: string, serial: string): GS1DigitalLink {
    return `https://id.lumiris.fr/01/${gtin}/21/${serial}`;
}

/** Construit un GS1Identifier ; `slug` permet d'utiliser un id passeport plutôt que le serial brut dans l'URL. */
export function buildGS1Identifier(gtin: string, serial: string, slug: string = serial): GS1Identifier {
    return {
        gtin,
        serial,
        verificationUrl: `https://lumiris.fr/passeport/${slug}`,
    };
}
