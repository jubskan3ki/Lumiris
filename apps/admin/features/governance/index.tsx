'use client';

import { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Download, Filter, History, Search } from 'lucide-react';
import type { AdminAction, AdminAuditLogEntry, AdminUserRole } from '@lumiris/types';
import { Badge } from '@lumiris/ui/components/badge';
import { Button } from '@lumiris/ui/components/button';
import { Input } from '@lumiris/ui/components/input';
import { ScrollArea } from '@lumiris/ui/components/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@lumiris/ui/components/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@lumiris/ui/components/sheet';
import { cn } from '@lumiris/ui/lib/cn';
import { RequirePermission, useAdminAuditLog, useLogAction, usePermission } from '@/lib/auth';

const ACTION_TONE: Record<AdminAction, string> = {
    'passport.read': 'text-muted-foreground',
    'passport.curate': 'text-lumiris-cyan',
    'passport.flag': 'text-lumiris-rose',
    'passport.request_changes': 'text-lumiris-amber',
    'passport.override_score': 'text-lumiris-orange',
    'artisan.read': 'text-muted-foreground',
    'artisan.suspend': 'text-lumiris-rose',
    'artisan.contact': 'text-lumiris-cyan',
    'retoucheur.read': 'text-muted-foreground',
    'retoucheur.verify_kyc': 'text-lumiris-emerald',
    'retoucheur.suspend': 'text-lumiris-rose',
    'retoucheur.review_moderate': 'text-lumiris-amber',
    'vision_user.read': 'text-lumiris-cyan',
    'vision_user.export_rgpd': 'text-lumiris-amber',
    'vision_user.erase_rgpd': 'text-lumiris-rose',
    'billing.read': 'text-muted-foreground',
    'billing.dunning': 'text-lumiris-amber',
    'billing.export': 'text-muted-foreground',
    'affiliation.read': 'text-muted-foreground',
    'affiliation.prepare_payout': 'text-lumiris-orange',
    'blog.read': 'text-muted-foreground',
    'blog.publish': 'text-lumiris-emerald',
    'blog.archive': 'text-muted-foreground',
    'governance.read_audit_log': 'text-muted-foreground',
    'governance.export_audit_log': 'text-lumiris-amber',
};

const ROLE_TONE: Record<AdminUserRole, string> = {
    platform_admin: 'text-lumiris-emerald',
    lead_curator: 'text-lumiris-emerald',
    curator: 'text-lumiris-cyan',
    content_manager: 'text-lumiris-amber',
    billing_ops: 'text-lumiris-orange',
    dpo: 'text-lumiris-rose',
};

type Category = 'passport' | 'artisan' | 'repairer' | 'vision_user' | 'billing' | 'affiliation' | 'blog' | 'governance';

function actionCategory(action: AdminAction): Category {
    return action.split('.')[0] as Category;
}

const SENSITIVE_ACTIONS = new Set<AdminAction>([
    'passport.override_score',
    'passport.flag',
    'artisan.suspend',
    'retoucheur.suspend',
    'vision_user.export_rgpd',
    'vision_user.erase_rgpd',
    'billing.dunning',
]);

interface AnomalyAlert {
    id: string;
    severity: 'warn' | 'error';
    title: string;
    detail: string;
    relatedIds: readonly string[];
}

function GovernanceComponent() {
    return (
        <RequirePermission action="governance.read_audit_log">
            <GovernanceBody />
        </RequirePermission>
    );
}

function GovernanceBody() {
    const auditLog = useAdminAuditLog();
    const log = useLogAction();
    const canExport = usePermission('governance.export_audit_log');

    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<AdminUserRole | 'all'>('all');
    const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
    const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');
    const [selected, setSelected] = useState<AdminAuditLogEntry | null>(null);

    const targetTypes = useMemo(() => {
        const set = new Set(auditLog.map((e) => e.targetType));
        return Array.from(set).sort();
    }, [auditLog]);

    const filtered = useMemo(() => {
        return auditLog.filter((e) => {
            if (roleFilter !== 'all' && e.actorRole !== roleFilter) return false;
            if (categoryFilter !== 'all' && actionCategory(e.action) !== categoryFilter) return false;
            if (targetTypeFilter !== 'all' && e.targetType !== targetTypeFilter) return false;
            if (search.trim().length > 0) {
                const needle = search.toLowerCase();
                const haystack = `${e.actorId} ${e.targetId} ${e.action} ${JSON.stringify(e.payload)}`.toLowerCase();
                if (!haystack.includes(needle)) return false;
            }
            return true;
        });
    }, [auditLog, roleFilter, categoryFilter, targetTypeFilter, search]);

    const anomalies = useMemo(() => detectAnomalies(auditLog), [auditLog]);

    const handleExport = () => {
        const header = ['ts', 'actorId', 'actorRole', 'action', 'targetType', 'targetId', 'payload'].join(',');
        const rows = filtered.map((e) =>
            [
                e.ts,
                e.actorId,
                e.actorRole,
                e.action,
                e.targetType,
                e.targetId,
                JSON.stringify(e.payload).replace(/,/g, ';'),
            ].join(','),
        );
        const csv = `${header}\n${rows.join('\n')}`;
        log({
            action: 'governance.export_audit_log',
            targetType: 'period',
            targetId: `filter-${Date.now()}`,
            payload: { count: filtered.length, format: 'csv' },
        });
        if (typeof window !== 'undefined') {
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lumiris-audit-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-baseline justify-between gap-3">
                <div>
                    <h2 className="text-foreground text-xl font-semibold">Governance</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Audit log live · {auditLog.length} entrées · anomalies détectées en temps réel.
                    </p>
                </div>
                <Button size="sm" variant="outline" onClick={handleExport} disabled={!canExport} className="gap-1.5">
                    <Download className="h-3.5 w-3.5" /> Export CSV
                </Button>
            </div>

            {anomalies.length > 0 ? <AnomaliesPanel anomalies={anomalies} /> : null}

            <div className="border-border bg-card flex flex-wrap items-center gap-2 rounded-xl border p-3">
                <div className="min-w-55 relative flex-1">
                    <Search className="text-muted-foreground/60 absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="actorId, targetId, payload…"
                        className="pl-8"
                    />
                </div>
                <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as AdminUserRole | 'all')}>
                    <SelectTrigger className="w-45">
                        <Filter className="mr-1 h-3.5 w-3.5" /> <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous rôles</SelectItem>
                        <SelectItem value="platform_admin">Platform Admin</SelectItem>
                        <SelectItem value="lead_curator">Lead Curator</SelectItem>
                        <SelectItem value="curator">Curator</SelectItem>
                        <SelectItem value="content_manager">Content Manager</SelectItem>
                        <SelectItem value="billing_ops">Billing Ops</SelectItem>
                        <SelectItem value="dpo">DPO</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as Category | 'all')}>
                    <SelectTrigger className="w-45">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes catégories</SelectItem>
                        <SelectItem value="passport">passport</SelectItem>
                        <SelectItem value="artisan">artisan</SelectItem>
                        <SelectItem value="retoucheur">retoucheur</SelectItem>
                        <SelectItem value="vision_user">vision_user</SelectItem>
                        <SelectItem value="billing">billing</SelectItem>
                        <SelectItem value="affiliation">affiliation</SelectItem>
                        <SelectItem value="blog">blog</SelectItem>
                        <SelectItem value="governance">governance</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous targets</SelectItem>
                        {targetTypes.map((t) => (
                            <SelectItem key={t} value={t}>
                                {t}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="border-border bg-card rounded-xl border">
                <div className="border-border border-b px-4 py-2">
                    <p className="text-muted-foreground text-xs">
                        {filtered.length} / {auditLog.length} entrées
                    </p>
                </div>
                <div className="divide-border max-h-[640px] divide-y overflow-y-auto">
                    {filtered.map((entry) => (
                        <button
                            type="button"
                            key={entry.id}
                            onClick={() => setSelected(entry)}
                            className="hover:bg-muted/30 flex w-full items-start gap-3 px-4 py-2.5 text-left"
                        >
                            <span
                                className={cn(
                                    'mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-semibold',
                                    'bg-muted',
                                    ROLE_TONE[entry.actorRole],
                                )}
                            >
                                {entry.actorRole.slice(0, 2).toUpperCase()}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-foreground text-xs">
                                    <span className="font-medium">{entry.actorId}</span>{' '}
                                    <span className={cn('font-mono', ACTION_TONE[entry.action])}>{entry.action}</span>{' '}
                                    <span className="text-muted-foreground">
                                        on {entry.targetType}/{entry.targetId}
                                    </span>
                                </p>
                                {Object.keys(entry.payload).length > 0 ? (
                                    <p className="text-muted-foreground/80 truncate font-mono text-[10px]">
                                        {JSON.stringify(entry.payload)}
                                    </p>
                                ) : null}
                            </div>
                            <span className="text-muted-foreground/60 shrink-0 font-mono text-[10px]">
                                {new Date(entry.ts).toLocaleString('fr-FR', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </button>
                    ))}
                    {filtered.length === 0 ? (
                        <p className="text-muted-foreground p-6 text-center text-xs">
                            Aucune entrée ne correspond aux filtres.
                        </p>
                    ) : null}
                </div>
            </div>

            <EntryDetail entry={selected} onClose={() => setSelected(null)} />
        </div>
    );
}

function AnomaliesPanel({ anomalies }: { anomalies: readonly AnomalyAlert[] }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-lumiris-rose/30 bg-lumiris-rose/5 space-y-2 rounded-xl border p-4"
        >
            <div className="text-lumiris-rose inline-flex items-center gap-2 text-sm font-semibold">
                <AlertTriangle className="h-4 w-4" /> Anomalies de gouvernance ({anomalies.length})
            </div>
            <ul className="space-y-2">
                {anomalies.map((a) => (
                    <li key={a.id} className="border-border bg-background rounded-lg border p-3 text-xs">
                        <div className="flex items-baseline justify-between gap-3">
                            <p className="text-foreground font-medium">{a.title}</p>
                            <Badge
                                variant="outline"
                                className={cn(
                                    'font-mono text-[10px]',
                                    a.severity === 'error'
                                        ? 'border-lumiris-rose/40 text-lumiris-rose'
                                        : 'border-lumiris-amber/40 text-lumiris-amber',
                                )}
                            >
                                {a.severity}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">{a.detail}</p>
                        {a.relatedIds.length > 0 ? (
                            <p className="text-muted-foreground/70 mt-1 font-mono text-[10px]">
                                ids: {a.relatedIds.slice(0, 6).join(', ')}
                                {a.relatedIds.length > 6 ? '…' : ''}
                            </p>
                        ) : null}
                    </li>
                ))}
            </ul>
        </motion.div>
    );
}

function EntryDetail({ entry, onClose }: { entry: AdminAuditLogEntry | null; onClose: () => void }) {
    return (
        <Sheet open={entry !== null} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="bg-background w-full overflow-hidden p-0 sm:max-w-lg">
                {entry ? (
                    <>
                        <SheetHeader className="border-border border-b p-5">
                            <SheetTitle className="font-mono text-sm">{entry.action}</SheetTitle>
                            <p className="text-muted-foreground text-xs">
                                {new Date(entry.ts).toLocaleString('fr-FR')}
                            </p>
                        </SheetHeader>
                        <ScrollArea className="flex-1">
                            <div className="space-y-3 p-5 text-xs">
                                <Section label="Acteur">
                                    <p className="text-foreground">
                                        {entry.actorId}{' '}
                                        <span className={cn('font-mono', ROLE_TONE[entry.actorRole])}>
                                            ({entry.actorRole})
                                        </span>
                                    </p>
                                </Section>
                                <Section label="Cible">
                                    <p className="text-foreground font-mono">
                                        {entry.targetType} / {entry.targetId}
                                    </p>
                                </Section>
                                <Section label="IP (mock)">
                                    <p className="text-foreground font-mono">{entry.ipMock ?? '—'}</p>
                                </Section>
                                <Section label="Payload">
                                    <pre className="text-foreground bg-muted/40 overflow-x-auto rounded-lg p-3 font-mono text-[11px]">
                                        {JSON.stringify(entry.payload, null, 2)}
                                    </pre>
                                </Section>
                                <p className="text-muted-foreground/70 inline-flex items-center gap-1 font-mono text-[10px]">
                                    <History className="h-3 w-3" /> id {entry.id}
                                </p>
                            </div>
                        </ScrollArea>
                    </>
                ) : null}
            </SheetContent>
        </Sheet>
    );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="text-muted-foreground text-[10px] uppercase tracking-wider">{label}</p>
            <div className="text-foreground mt-1">{children}</div>
        </div>
    );
}

/**
 * Détecte les patterns anormaux dans l'audit log :
 *  1. > 10 actions sensibles d'un même actor sur la dernière heure
 *  2. override de score qui remonte un grade (ex C → A)
 *  3. > 3 validations du même artisan en < 5 min
 */
function detectAnomalies(auditLog: readonly AdminAuditLogEntry[]): readonly AnomalyAlert[] {
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
                detail: "Velocity excessive — vérifier que le compte n'est pas compromis.",
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
                    detail: 'Suspicion de validation expéditive — repasser les passeports en revue.',
                    relatedIds: window.map((e) => e.id),
                });
                break;
            }
        }
    }

    return alerts;
}

export const Governance = memo(GovernanceComponent);
