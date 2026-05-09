import type { AdminAction, AdminAuditLogEntry } from '@lumiris/types';

export interface AnomalyAlert {
    id: string;
    severity: 'warn' | 'error';
    title: string;
    detail: string;
    relatedIds: readonly string[];
}

export const SENSITIVE_ACTIONS = new Set<AdminAction>([
    'passport.override_score',
    'passport.flag',
    'artisan.suspend',
    'retoucheur.suspend',
    'vision_user.export_rgpd',
    'vision_user.erase_rgpd',
    'billing.dunning',
]);

// Détecte 3 patterns d'audit log : burst d'actions sensibles, override de grade en hausse, validations en rafale.
export function detectAnomalies(auditLog: readonly AdminAuditLogEntry[]): readonly AnomalyAlert[] {
    const alerts: AnomalyAlert[] = [];
    const HOUR_MS = 60 * 60 * 1000;
    const FIVE_MIN_MS = 5 * 60 * 1000;
    const now = Date.now();
    const GRADE_RANK: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1 };

    const recentSensitive = auditLog.filter(
        (e) => SENSITIVE_ACTIONS.has(e.action) && now - new Date(e.ts).getTime() < HOUR_MS,
    );
    const byActor = new Map<string, AdminAuditLogEntry[]>();
    for (const entry of recentSensitive) {
        const list = byActor.get(entry.actorId) ?? [];
        list.push(entry);
        byActor.set(entry.actorId, list);
    }
    for (const [actorId, entries] of byActor.entries()) {
        if (entries.length > 10) {
            alerts.push({
                id: `actor-burst-${actorId}`,
                severity: 'error',
                title: `${actorId} a effectué ${entries.length} actions sensibles en < 1h`,
                detail: "Velocity excessive - vérifier que le compte n'est pas compromis.",
                relatedIds: entries.map((e) => e.id),
            });
        }
    }

    for (const entry of auditLog) {
        if (entry.action !== 'passport.override_score') continue;
        const from = entry.payload.from as string | undefined;
        const to = entry.payload.to as string | undefined;
        const reason = entry.payload.reason as string | undefined;
        if (!from || !to) continue;
        const fromRank = GRADE_RANK[from] ?? 0;
        const toRank = GRADE_RANK[to] ?? 0;
        if (toRank - fromRank >= 2) {
            alerts.push({
                id: `override-jump-${entry.id}`,
                severity: 'warn',
                title: `Override remontant le grade ${from} → ${to}`,
                detail: `Justification : ${reason ?? '(non précisée)'}. Vérifier que la preuve documentaire suit.`,
                relatedIds: [entry.id, entry.targetId],
            });
        }
    }

    const validationsByArtisan = new Map<string, AdminAuditLogEntry[]>();
    for (const entry of auditLog) {
        if (entry.action !== 'passport.curate') continue;
        const artisanId =
            entry.targetType === 'artisan' ? entry.targetId : (entry.payload.artisanId as string | undefined);
        if (!artisanId) continue;
        const list = validationsByArtisan.get(artisanId) ?? [];
        list.push(entry);
        validationsByArtisan.set(artisanId, list);
    }
    for (const [artisanId, entries] of validationsByArtisan.entries()) {
        const sorted = [...entries].sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
        for (let i = 0; i < sorted.length - 3; i++) {
            const window = sorted.slice(i, i + 4);
            const first = window[0];
            const last = window[3];
            if (!first || !last) continue;
            const span = new Date(last.ts).getTime() - new Date(first.ts).getTime();
            if (span < FIVE_MIN_MS) {
                alerts.push({
                    id: `chain-validation-${artisanId}-${first.id}`,
                    severity: 'warn',
                    title: `4 validations en chaîne pour ${artisanId} (< 5 min)`,
                    detail: 'Suspicion de validation expéditive - repasser les passeports en revue.',
                    relatedIds: window.map((e) => e.id),
                });
                break;
            }
        }
    }

    return alerts;
}
