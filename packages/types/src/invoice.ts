// factures fournisseurs uploadées sur ATELIER+ - alimentent le sous-score transparency

import type { Fiber } from './passport';

export interface OcrLineItem {
    /** Détecté par l'OCR - souvent imprécis, l'artisan peut corriger. */
    fiber?: Fiber;
    label: string;
    qty: number;
    /** Unité libre : `kg`, `m`, `m²`, `pièce`. */
    unit: string;
}

export interface OcrExtraction {
    supplierName: string;
    invoiceDate: string;
    /** Total HT en `currency`. */
    totalHt: number;
    currency: 'EUR';
    lineItems: readonly OcrLineItem[];
}

export interface SupplierInvoice {
    id: string;
    supplierId: string;
    fileUrl: string;
    /** `null` quand l'OCR n'a pas encore tourné (cas "à valider manuellement"). */
    ocrExtracted: OcrExtraction | null;
    uploadedAt: string;
    /** Passeports qui référencent cette facture via `composition[].invoiceRef`. */
    linkedPassportIds: readonly string[];
}
