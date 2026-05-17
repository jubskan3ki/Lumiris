import { z } from 'zod';
import type { DraftLike, ValidateStepResult } from '@/features/wizard-shell/use-step-navigation';

const STAGE_KINDS = [
    'weaving',
    'dyeing',
    'cutting',
    'sewing',
    'finishing',
    'embroidery',
    'assembly',
    'quality-check',
    'other',
] as const;

const StepSchema = z.object({
    kind: z.enum(STAGE_KINDS),
    label: z.string().min(1, 'Libellé manquant'),
    performedBy: z.string().min(1, 'Réalisateur manquant'),
    locationCity: z.string().min(1, 'Ville manquante'),
    locationCountry: z.string().min(2, 'Pays manquant'),
});

const ManufacturingSchema = z.object({
    steps: z.array(StepSchema).min(1, 'Au moins une étape requise'),
});

export function validateStep(draft: DraftLike): ValidateStepResult {
    const parsed = ManufacturingSchema.safeParse({ steps: draft.steps });
    if (parsed.success) return { ok: true };
    const labels = new Set<string>();
    for (const iss of parsed.error.issues) {
        if (iss.path[0] !== 'steps') {
            labels.add(iss.message);
            continue;
        }
        const idx = iss.path[1];
        const field = iss.path[2];
        if (typeof idx !== 'number') {
            labels.add(iss.message);
            continue;
        }
        if (field === 'label') labels.add(`Étape #${idx + 1} · libellé`);
        else if (field === 'kind') labels.add(`Étape #${idx + 1} · type`);
        else if (field === 'performedBy') labels.add(`Étape #${idx + 1} · réalisateur`);
        else if (field === 'locationCity') labels.add(`Étape #${idx + 1} · ville`);
        else if (field === 'locationCountry') labels.add(`Étape #${idx + 1} · pays`);
        else labels.add(iss.message);
    }
    return { ok: false, missing: Array.from(labels) };
}
