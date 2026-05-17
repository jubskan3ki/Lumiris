import type { DraftLike, ValidateStepResult } from '@/features/wizard-shell/use-step-navigation';
import { validateStep as validateIdentification } from '@/features/create-step-identification/schema';
import { validateStep as validateComposition } from '@/features/create-step-composition/schema';
import { validateStep as validateManufacturing } from '@/features/create-step-manufacturing/schema';
import { validateStep as validateCertifications } from '@/features/create-step-certifications/schema';

export function validateStep(draft: DraftLike): ValidateStepResult {
    const all = [
        validateIdentification(draft),
        validateComposition(draft),
        validateManufacturing(draft),
        validateCertifications(draft),
    ];
    const missing = all.flatMap((r) => (r.ok ? [] : r.missing));
    if (missing.length === 0) return { ok: true };
    return { ok: false, missing: Array.from(new Set(missing)) };
}
