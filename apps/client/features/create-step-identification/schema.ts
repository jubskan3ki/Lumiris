import { z } from 'zod';
import type { DraftLike, ValidateStepResult } from '@/features/wizard-shell/use-step-navigation';

const GARMENT_KINDS = ['sweater', 'shirt', 'shoe', 'jacket', 'trouser', 'accessory', 'other'] as const;

const IdentificationSchema = z.object({
    reference: z.string().min(1, 'Référence requise').max(60, 'Référence trop longue (60 max)'),
    kind: z.enum(GARMENT_KINDS),
    mainPhotoUrl: z.string().min(1, 'Photo principale requise'),
    retailPrice: z.number().positive('Prix > 0 requis'),
    dimensions: z
        .object({
            length: z.number().min(0).optional(),
            width: z.number().min(0).optional(),
            height: z.number().min(0).optional(),
            weightG: z.number().min(0).optional(),
        })
        .default({}),
});

const FIELD_LABELS: Record<string, string> = {
    reference: 'Référence',
    kind: 'Type produit',
    mainPhotoUrl: 'Photo principale',
    retailPrice: 'Prix de vente',
};

export function validateStep(draft: DraftLike): ValidateStepResult {
    const parsed = IdentificationSchema.safeParse({
        reference: draft.garment.reference,
        kind: draft.garment.kind,
        mainPhotoUrl: draft.garment.mainPhotoUrl,
        retailPrice: draft.garment.retailPrice,
        dimensions: draft.garment.dimensions,
    });
    if (parsed.success) return { ok: true };
    const missing = Array.from(
        new Set(
            parsed.error.issues.map((iss) => {
                const root = String(iss.path[0] ?? '');
                return FIELD_LABELS[root] ?? root;
            }),
        ),
    );
    return { ok: false, missing };
}
