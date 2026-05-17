import { z } from 'zod';
import type { DraftLike, ValidateStepResult } from '@/features/wizard-shell/use-step-navigation';

const CertificationsSchema = z.object({
    warranty: z.object({
        durationMonths: z.number().int().positive('Durée garantie > 0 requise'),
        terms: z.string().min(1, 'Termes garantie requis'),
    }),
});

const FIELD_LABELS: Record<string, string> = {
    durationMonths: 'Durée garantie',
    terms: 'Termes garantie',
};

export function validateStep(draft: DraftLike): ValidateStepResult {
    const parsed = CertificationsSchema.safeParse({ warranty: draft.warranty });
    if (parsed.success) return { ok: true };
    const missing = Array.from(
        new Set(
            parsed.error.issues.map((iss) => {
                const last = String(iss.path[iss.path.length - 1] ?? '');
                return FIELD_LABELS[last] ?? last;
            }),
        ),
    );
    return { ok: false, missing };
}
