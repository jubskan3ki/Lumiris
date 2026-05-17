import { z } from 'zod';
import type { DraftLike, ValidateStepResult } from '@/features/wizard-shell/use-step-navigation';

const FIBER_VALUES = ['wool', 'linen', 'cotton', 'silk', 'hemp', 'cashmere', 'recycled-polyester', 'other'] as const;

const MaterialSchema = z.object({
    fiber: z.enum(FIBER_VALUES),
    percentage: z.number().positive('Pourcentage > 0 requis').max(100),
    supplierId: z.string().min(1, 'Fournisseur manquant'),
    originCountry: z.string().min(2, 'Pays manquant'),
});

const CompositionSchema = z
    .object({
        materials: z.array(MaterialSchema).min(1, 'Au moins une fibre requise'),
    })
    .refine((v) => Math.abs(v.materials.reduce((s, m) => s + (Number(m.percentage) || 0), 0) - 100) < 1, {
        message: 'Somme des pourcentages = 100',
        path: ['materials'],
    });

export function validateStep(draft: DraftLike): ValidateStepResult {
    const parsed = CompositionSchema.safeParse({ materials: draft.materials });
    if (parsed.success) return { ok: true };
    const labels = new Set<string>();
    for (const iss of parsed.error.issues) {
        if (iss.path[0] !== 'materials') {
            labels.add(iss.message);
            continue;
        }
        const idx = iss.path[1];
        const field = iss.path[2];
        if (typeof idx !== 'number') {
            labels.add(iss.message);
            continue;
        }
        if (field === 'supplierId') labels.add(`Fibre #${idx + 1} · fournisseur`);
        else if (field === 'fiber') labels.add(`Fibre #${idx + 1} · type`);
        else if (field === 'originCountry') labels.add(`Fibre #${idx + 1} · origine`);
        else labels.add(iss.message);
    }
    return { ok: false, missing: Array.from(labels) };
}
