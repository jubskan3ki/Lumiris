import type { DraftLike, ValidateStepResult } from '@/features/wizard-shell/use-step-navigation';

// Étape optionnelle — ne bloque jamais le wizard.
export function validateStep(_draft: DraftLike): ValidateStepResult {
    return { ok: true };
}
