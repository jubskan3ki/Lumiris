// garde-robe consumer - store (IndexedDB / Tauri-SQL) dans @lumiris/utils

import type { IrisGrade } from './score';

/** Fallback manuel quand un produit scanné n'a pas de passeport LUMIRIS. */
export interface WardrobeFallback {
    name: string;
    brand: string;
    photoUrl?: string;
    /** Estimation manuelle - non autoritative. */
    estimatedGrade?: IrisGrade;
}

export interface WardrobeItem {
    id: string;
    userId: string;
    scannedAt: string;
    /** ID du passeport quand le produit est référencé chez LUMIRIS. */
    passportId?: string;
    /** Mutuellement exclusif avec `passportId`. */
    fallback?: WardrobeFallback;
    notes?: string;
}
