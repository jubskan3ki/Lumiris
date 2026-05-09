'use client';

import { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowDownToLine,
    BadgeCheck,
    Coins,
    Filter,
    Flag,
    ShieldOff,
    TrendingUp,
    Users,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
    mockAffiliationEvents,
    mockAffiliationTrajectory,
    mockArtisans,
    mockPayouts,
    mockRepairers,
} from '@lumiris/mock-data';
import type { AffiliationEvent, AffiliationKind, AffiliationPayoutStatus, Payout } from '@lumiris/types';
import { Badge } from '@lumiris/ui/components/badge';
import { Button } from '@lumiris/ui/components/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@lumiris/ui/components/alert-dialog';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@lumiris/ui/components/chart';
import { Input } from '@lumiris/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@lumiris/ui/components/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@lumiris/ui/components/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@lumiris/ui/components/table';
import { cn } from '@lumiris/ui/lib/cn';
import { RequirePermission, useLogAction, usePermission } from '@/lib/auth';
import {
    ANONYMISATION_THRESHOLD_DAYS,
    NOW_REF,
    anonymiseUserId,
    buildSuspicionMap,
    type SuspiciousFlag,
} from '@/lib/affiliation-fraud';
import { KpiCard } from '@/components/kpi-card';
import { GovernanceBanner } from '../_shared/governance-banner';

function AffiliationComponent() {
    return (
        <RequirePermission action="affiliation.read">
            <AffiliationInner />
        </RequirePermission>
    );
}

function AffiliationInner() {
    const [activeTab, setActiveTab] = useState('overview');
    const [extraFlagged, setExtraFlagged] = useState<Set<string>>(new Set());
    const [paidEventIds, setPaidEventIds] = useState<Set<string>>(new Set());

    const events = useMemo(() => {
        return mockAffiliationEvents.map((e) => ({
            ...e,
            flaggedAsFraud: e.flaggedAsFraud || extraFlagged.has(e.id),
            payoutStatus: paidEventIds.has(e.id) ? ('paid' as const) : e.payoutStatus,
        }));
    }, [extraFlagged, paidEventIds]);

    const suspicions = useMemo(() => buildSuspicionMap(events), [events]);

    return (
        <div className="space-y-5">
            <div className="flex items-baseline justify-between gap-3">
                <div>
                    <h2 className="text-foreground text-xl font-semibold">Affiliation</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {events.length} conversions sur 90 j · {mockPayouts.length} payouts · anti-fraude actif.
                    </p>
                </div>
            </div>

            <GovernanceBanner />

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="events">Événements</TabsTrigger>
                    <TabsTrigger value="payouts">Payouts</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-5 pt-2">
                    <OverviewTab events={events} />
                </TabsContent>
                <TabsContent value="events" className="space-y-5 pt-2">
                    <EventsTab
                        events={events}
                        suspicions={suspicions}
                        onFlagFraud={(id) => setExtraFlagged((prev) => new Set(prev).add(id))}
                    />
                </TabsContent>
                <TabsContent value="payouts" className="space-y-5 pt-2">
                    <PayoutsTab
                        events={events}
                        suspicions={suspicions}
                        onPreparePayout={(eventIds) =>
                            setPaidEventIds((prev) => {
                                const next = new Set(prev);
                                for (const id of eventIds) next.add(id);
                                return next;
                            })
                        }
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}

// ─── Overview ───────────────────────────────────────────────────────────────

function OverviewTab({ events }: { events: readonly AffiliationEvent[] }) {
    const stats = useMemo(() => {
        const last30 = events.filter((e) => NOW_REF - new Date(e.occurredAt).getTime() < 30 * 86_400_000);
        const purchases = last30.filter((e) => e.kind === 'purchase');
        const repairs = last30.filter((e) => e.kind === 'repair_booking');
        const purchaseEur = purchases.reduce((s, e) => s + e.commission.amountEur, 0);
        const repairEur = repairs.reduce((s, e) => s + e.commission.amountEur, 0);
        const conversions = last30.length;
        // Mock scans 30j - taux de transformation = conversions / scans
        const mockScans = 1200;
        const transformPct = (conversions / mockScans) * 100;

        const byArtisan = new Map<string, number>();
        for (const e of events) {
            if (e.beneficiaryKind !== 'artisan') continue;
            byArtisan.set(e.beneficiaryId, (byArtisan.get(e.beneficiaryId) ?? 0) + e.commission.amountEur);
        }
        const topArtisans = Array.from(byArtisan.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const byRepairer = new Map<string, number>();
        for (const e of events) {
            if (e.beneficiaryKind !== 'repairer') continue;
            byRepairer.set(e.beneficiaryId, (byRepairer.get(e.beneficiaryId) ?? 0) + e.commission.amountEur);
        }
        const topRepairers = Array.from(byRepairer.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        return {
            purchaseEur,
            repairEur,
            totalEur: purchaseEur + repairEur,
            conversions,
            transformPct,
            mockScans,
            topArtisans,
            topRepairers,
        };
    }, [events]);

    const config = {
        purchaseEur: { label: 'Achats', color: 'var(--lumiris-emerald)' },
        repairEur: { label: 'Retouches', color: 'var(--lumiris-cyan)' },
    } satisfies ChartConfig;

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-3 lg:grid-cols-4"
            >
                <KpiCard
                    label="Commissions 30j"
                    value={`${stats.totalEur.toFixed(1)} €`}
                    sub={`achats ${stats.purchaseEur.toFixed(1)} · retouches ${stats.repairEur.toFixed(1)}`}
                    icon={<Coins className="h-4 w-4" />}
                    tone="text-lumiris-emerald"
                />
                <KpiCard
                    label="Conversions 30j"
                    value={stats.conversions.toString()}
                    icon={<BadgeCheck className="h-4 w-4" />}
                    tone="text-lumiris-cyan"
                />
                <KpiCard
                    label="Taux transformation"
                    value={`${stats.transformPct.toFixed(2)} %`}
                    sub={`${stats.mockScans} scans / 30j`}
                    icon={<TrendingUp className="h-4 w-4" />}
                    tone="text-lumiris-amber"
                />
                <KpiCard
                    label="Bénéficiaires actifs"
                    value={`${stats.topArtisans.length + stats.topRepairers.length}`}
                    icon={<Users className="h-4 w-4" />}
                    tone="text-lumiris-rose"
                />
            </motion.div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="border-border bg-card rounded-xl border p-4 lg:col-span-2">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-foreground text-sm font-medium">Commissions par mois - 6 mois</p>
                        <Badge variant="outline" className="font-mono text-[10px]">
                            empilé achat / retouche
                        </Badge>
                    </div>
                    <ChartContainer config={config} className="h-56 w-full">
                        <BarChart data={mockAffiliationTrajectory.map((p) => ({ ...p }))}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={10} />
                            <YAxis tickLine={false} axisLine={false} fontSize={10} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="purchaseEur" stackId="a" fill="var(--color-purchaseEur)" />
                            <Bar dataKey="repairEur" stackId="a" fill="var(--color-repairEur)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </div>

                <div className="border-border bg-card space-y-4 rounded-xl border p-4">
                    <div>
                        <p className="text-foreground mb-2 text-xs font-semibold">Top 5 artisans</p>
                        <ul className="space-y-1.5 text-[11px]">
                            {stats.topArtisans.map(([id, eur]) => {
                                const artisan = mockArtisans.find((a) => a.id === id);
                                return (
                                    <li key={id} className="flex items-center justify-between">
                                        <span className="text-foreground truncate">{artisan?.atelierName ?? id}</span>
                                        <span className="text-muted-foreground font-mono">{eur.toFixed(1)} €</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <div className="border-border border-t pt-3">
                        <p className="text-foreground mb-2 text-xs font-semibold">Top 5 retoucheurs</p>
                        <ul className="space-y-1.5 text-[11px]">
                            {stats.topRepairers.map(([id, eur]) => {
                                const r = mockRepairers.find((rt) => rt.id === id);
                                return (
                                    <li key={id} className="flex items-center justify-between">
                                        <span className="text-foreground truncate">
                                            {r?.atelierName ?? r?.displayName ?? id}
                                        </span>
                                        <span className="text-muted-foreground font-mono">{eur.toFixed(1)} €</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Events ─────────────────────────────────────────────────────────────────

function EventsTab({
    events,
    suspicions,
    onFlagFraud,
}: {
    events: readonly AffiliationEvent[];
    suspicions: Map<string, SuspiciousFlag>;
    onFlagFraud: (id: string) => void;
}) {
    const log = useLogAction();
    const canAuditLog = usePermission('governance.read_audit_log');

    const [kindFilter, setKindFilter] = useState<AffiliationKind | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<AffiliationPayoutStatus | 'all'>('all');
    const [beneficiaryFilter, setBeneficiaryFilter] = useState<string>('all');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [target, setTarget] = useState<AffiliationEvent | null>(null);
    const [reason, setReason] = useState('');

    const beneficiaries = useMemo(() => {
        const set = new Set<string>();
        for (const e of events) set.add(e.beneficiaryId);
        return Array.from(set).sort();
    }, [events]);

    const filtered = useMemo(() => {
        const min = minAmount ? Number(minAmount) : undefined;
        const max = maxAmount ? Number(maxAmount) : undefined;
        return events.filter((e) => {
            if (kindFilter !== 'all' && e.kind !== kindFilter) return false;
            if (statusFilter !== 'all' && e.payoutStatus !== statusFilter) return false;
            if (beneficiaryFilter !== 'all' && e.beneficiaryId !== beneficiaryFilter) return false;
            if (min !== undefined && e.commission.amountEur < min) return false;
            if (max !== undefined && e.commission.amountEur > max) return false;
            return true;
        });
    }, [events, kindFilter, statusFilter, beneficiaryFilter, minAmount, maxAmount]);

    const suspiciousEvents = useMemo(
        () => events.filter((e) => suspicions.has(e.id) && !e.flaggedAsFraud),
        [events, suspicions],
    );

    const handleConfirmFraud = () => {
        if (!target) return;
        const flag = suspicions.get(target.id);
        log({
            action: 'governance.read_audit_log',
            targetType: 'affiliation_event',
            targetId: target.id,
            payload: {
                decision: 'flagged_as_fraud',
                reason: reason || 'manual review',
                kind: target.kind,
                beneficiary: target.beneficiaryId,
                amount: target.commission.amountEur,
                pattern: flag?.burst ? 'burst' : flag?.selfBooking ? 'self_booking' : 'manual',
            },
        });
        onFlagFraud(target.id);
        setTarget(null);
        setReason('');
    };

    return (
        <>
            {suspiciousEvents.length > 0 ? <SuspiciousPanel events={suspiciousEvents} suspicions={suspicions} /> : null}

            <div className="border-border bg-card flex flex-wrap items-center gap-2 rounded-xl border p-3">
                <Select value={kindFilter} onValueChange={(v) => setKindFilter(v as typeof kindFilter)}>
                    <SelectTrigger className="w-40">
                        <Filter className="mr-1 h-3.5 w-3.5" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous types</SelectItem>
                        <SelectItem value="purchase">Achat</SelectItem>
                        <SelectItem value="repair_booking">Retouche</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                    <SelectTrigger className="w-36">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous payouts</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="paid">Payé</SelectItem>
                        <SelectItem value="cancelled">Annulé</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={beneficiaryFilter} onValueChange={setBeneficiaryFilter}>
                    <SelectTrigger className="w-44">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous bénéficiaires</SelectItem>
                        {beneficiaries.map((b) => (
                            <SelectItem key={b} value={b}>
                                {b}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input
                    placeholder="Min €"
                    type="number"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="w-24"
                />
                <Input
                    placeholder="Max €"
                    type="number"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    className="w-24"
                />
                <p className="text-muted-foreground ml-auto text-[10px]">
                    Anonymisation auto · {ANONYMISATION_THRESHOLD_DAYS} jours
                </p>
            </div>

            <div className="border-border bg-card overflow-hidden rounded-xl border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Utilisateur</TableHead>
                            <TableHead>Bénéficiaire</TableHead>
                            <TableHead className="text-right">Transaction</TableHead>
                            <TableHead className="text-right">Commission</TableHead>
                            <TableHead>Payout</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((e) => {
                            const flag = suspicions.get(e.id);
                            const userLabel = anonymiseUserId(e.userId, e.occurredAt);
                            return (
                                <TableRow
                                    key={e.id}
                                    className={cn(
                                        flag?.selfBooking ? 'bg-lumiris-rose/5' : '',
                                        flag?.burst ? 'bg-lumiris-amber/5' : '',
                                        e.flaggedAsFraud ? 'opacity-50' : '',
                                    )}
                                >
                                    <TableCell className="font-mono text-[11px]">
                                        {new Date(e.occurredAt).toLocaleDateString('fr-FR')}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono text-[10px]">
                                            {e.kind === 'purchase' ? 'Achat' : 'Retouche'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-[11px]">{userLabel}</TableCell>
                                    <TableCell>
                                        <p className="text-foreground text-sm">{e.beneficiaryDisplayName}</p>
                                        <p className="text-muted-foreground text-[10px]">{e.beneficiaryId}</p>
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-sm">
                                        {e.transactionAmountEur} €
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="text-foreground font-mono text-sm">
                                            {e.commission.amountEur.toFixed(2)} €
                                        </span>
                                        <span className="text-muted-foreground/70 ml-1 text-[10px]">
                                            {e.commission.type === 'pct' ? `${e.commission.percent}%` : 'forfait'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {e.flaggedAsFraud ? (
                                            <Badge
                                                variant="outline"
                                                className="border-lumiris-rose/40 text-lumiris-rose font-mono text-[10px]"
                                            >
                                                <ShieldOff className="mr-1 h-2.5 w-2.5" /> Annulé
                                            </Badge>
                                        ) : (
                                            <PayoutBadge status={e.payoutStatus} />
                                        )}
                                        {flag?.burst ? (
                                            <Badge
                                                variant="outline"
                                                className="border-lumiris-amber/40 text-lumiris-amber ml-1 font-mono text-[10px]"
                                            >
                                                {flag.burst.count}/jour
                                            </Badge>
                                        ) : null}
                                        {flag?.selfBooking ? (
                                            <Badge
                                                variant="outline"
                                                className="border-lumiris-rose/40 text-lumiris-rose ml-1 font-mono text-[10px]"
                                            >
                                                auto-RDV
                                            </Badge>
                                        ) : null}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {!e.flaggedAsFraud && canAuditLog ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setTarget(e)}
                                                className="gap-1.5"
                                            >
                                                <Flag className="h-3 w-3" /> Frauduleux
                                            </Button>
                                        ) : null}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-muted-foreground py-8 text-center text-xs">
                                    Aucun événement ne correspond aux filtres.
                                </TableCell>
                            </TableRow>
                        ) : null}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={target !== null} onOpenChange={(o) => !o && setTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Annuler la commission ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            La commission de {target?.commission.amountEur.toFixed(2)} € pour{' '}
                            <strong>{target?.beneficiaryDisplayName}</strong> sera annulée. L&apos;action est tracée -
                            précisez la raison ci-dessous.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Raison (ex. user_anon générant 6 conversions/jour)"
                        className="mt-2"
                    />
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmFraud}>Marquer frauduleux</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function PayoutBadge({ status }: { status: AffiliationPayoutStatus }) {
    const tone =
        status === 'paid'
            ? 'border-lumiris-emerald/40 text-lumiris-emerald'
            : status === 'cancelled'
              ? 'border-lumiris-rose/40 text-lumiris-rose'
              : 'border-lumiris-cyan/40 text-lumiris-cyan';
    const label = status === 'paid' ? 'Payé' : status === 'cancelled' ? 'Annulé' : 'En attente';
    return (
        <Badge variant="outline" className={cn('font-mono text-[10px]', tone)}>
            {label}
        </Badge>
    );
}

function SuspiciousPanel({
    events,
    suspicions,
}: {
    events: readonly AffiliationEvent[];
    suspicions: Map<string, SuspiciousFlag>;
}) {
    const burst = events.filter((e) => suspicions.get(e.id)?.burst);
    const selfBooking = events.filter((e) => suspicions.get(e.id)?.selfBooking);
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-lumiris-amber/30 bg-lumiris-amber/5 space-y-2 rounded-xl border p-4"
        >
            <div className="text-lumiris-amber inline-flex items-center gap-2 text-sm font-semibold">
                <AlertTriangle className="h-4 w-4" /> Patterns suspects à investiguer
            </div>
            {burst.length > 0 ? (
                <p className="text-muted-foreground text-xs">
                    <strong className="text-foreground">{burst.length} événements</strong> où le même utilisateur génère
                    plus de 5 conversions sur la même journée.
                </p>
            ) : null}
            {selfBooking.length > 0 ? (
                <p className="text-muted-foreground text-xs">
                    <strong className="text-foreground">{selfBooking.length} auto-RDV détectés</strong> - le retoucheur
                    est identique à l&apos;utilisateur.
                </p>
            ) : null}
        </motion.div>
    );
}

// ─── Payouts ────────────────────────────────────────────────────────────────

function PayoutsTab({
    events,
    suspicions,
    onPreparePayout,
}: {
    events: readonly AffiliationEvent[];
    suspicions: Map<string, SuspiciousFlag>;
    onPreparePayout: (eventIds: readonly string[]) => void;
}) {
    const log = useLogAction();
    const canPrepare = usePermission('affiliation.prepare_payout');

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [openPayout, setOpenPayout] = useState<Payout | null>(null);

    const currentPeriodEvents = useMemo(() => {
        return events.filter((e) => e.payoutStatus === 'pending');
    }, [events]);

    const stats = useMemo(() => {
        const eligible = currentPeriodEvents.filter((e) => !e.flaggedAsFraud && !suspicions.has(e.id));
        const excluded = currentPeriodEvents.filter((e) => e.flaggedAsFraud || suspicions.has(e.id));
        const total = eligible.reduce((s, e) => s + e.commission.amountEur, 0);
        const beneficiaries = new Set(eligible.map((e) => e.beneficiaryId));
        return {
            eligible,
            excluded,
            total,
            beneficiaryCount: beneficiaries.size,
        };
    }, [currentPeriodEvents, suspicions]);

    const handleConfirm = () => {
        const month = '2026-04';
        log({
            action: 'affiliation.prepare_payout',
            targetType: 'period',
            targetId: month,
            payload: {
                mois: month,
                totalEuros: +stats.total.toFixed(2),
                nbBeneficiaires: stats.beneficiaryCount,
                exclusions: stats.excluded.map((e) => e.id),
            },
        });

        // Génère le CSV
        if (typeof window !== 'undefined') {
            const header = ['eventId', 'beneficiaryId', 'beneficiaryName', 'kind', 'amountEur'].join(',');
            const lines = stats.eligible.map((e) =>
                [e.id, e.beneficiaryId, e.beneficiaryDisplayName, e.kind, e.commission.amountEur.toFixed(2)]
                    .map((v) => String(v).replace(/,/g, ';'))
                    .join(','),
            );
            const csv = `${header}\n${lines.join('\n')}`;
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lumiris-payout-${month}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }

        onPreparePayout(stats.eligible.map((e) => e.id));
        setConfirmOpen(false);
    };

    const beneficiariesForPayout = useMemo(() => {
        if (!openPayout) return [];
        const periodEvents = events.filter(
            (e) => new Date(e.occurredAt).toISOString().slice(0, 7) === openPayout.period,
        );
        const map = new Map<string, { name: string; total: number; count: number }>();
        for (const e of periodEvents) {
            const cur = map.get(e.beneficiaryId) ?? { name: e.beneficiaryDisplayName, total: 0, count: 0 };
            cur.total += e.commission.amountEur;
            cur.count += 1;
            map.set(e.beneficiaryId, cur);
        }
        return Array.from(map.entries()).sort((a, b) => b[1].total - a[1].total);
    }, [openPayout, events]);

    return (
        <>
            <div className="border-border bg-card rounded-xl border p-5">
                <div className="flex items-baseline justify-between gap-3">
                    <div>
                        <p className="text-foreground text-sm font-semibold">Mois en cours - avril 2026</p>
                        <p className="text-muted-foreground mt-1 text-xs">
                            {stats.beneficiaryCount} bénéficiaires · {stats.eligible.length} événements éligibles ·{' '}
                            {stats.excluded.length} exclusions suspectes.
                        </p>
                    </div>
                    <Button
                        size="sm"
                        disabled={!canPrepare || stats.eligible.length === 0}
                        onClick={() => setConfirmOpen(true)}
                        className="gap-1.5"
                    >
                        <ArrowDownToLine className="h-3.5 w-3.5" /> Préparer le payout
                    </Button>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                    <Stat label="À payer" value={`${stats.total.toFixed(2)} €`} tone="text-lumiris-emerald" />
                    <Stat label="Bénéficiaires" value={stats.beneficiaryCount.toString()} tone="text-lumiris-cyan" />
                    <Stat
                        label="Exclus"
                        value={`${stats.excluded.length}`}
                        sub={`${stats.excluded.reduce((s, e) => s + e.commission.amountEur, 0).toFixed(2)} €`}
                        tone="text-lumiris-rose"
                    />
                </div>
            </div>

            <div className="border-border bg-card overflow-hidden rounded-xl border">
                <div className="border-border border-b px-4 py-2.5">
                    <p className="text-muted-foreground text-xs">Historique des payouts</p>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Période</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Montant</TableHead>
                            <TableHead className="text-right">Bénéficiaires</TableHead>
                            <TableHead>Préparé le</TableHead>
                            <TableHead>Payé le</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockPayouts.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell className="font-mono text-sm">{p.period}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            'font-mono text-[10px]',
                                            p.status === 'paid'
                                                ? 'border-lumiris-emerald/40 text-lumiris-emerald'
                                                : p.status === 'prepared'
                                                  ? 'border-lumiris-cyan/40 text-lumiris-cyan'
                                                  : 'border-lumiris-amber/40 text-lumiris-amber',
                                        )}
                                    >
                                        {p.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-mono text-sm">
                                    {p.totalEur.toFixed(2)} €
                                </TableCell>
                                <TableCell className="text-right font-mono text-sm">{p.beneficiaryCount}</TableCell>
                                <TableCell className="font-mono text-[11px]">
                                    {p.preparedAt ? new Date(p.preparedAt).toLocaleDateString('fr-FR') : '-'}
                                </TableCell>
                                <TableCell className="font-mono text-[11px]">
                                    {p.paidAt ? new Date(p.paidAt).toLocaleDateString('fr-FR') : '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                    {p.status === 'paid' ? (
                                        <Button size="sm" variant="ghost" onClick={() => setOpenPayout(p)}>
                                            Détail
                                        </Button>
                                    ) : null}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Préparer le payout - avril 2026</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                            <p>
                                <strong>{stats.beneficiaryCount} bénéficiaires</strong> ·{' '}
                                <strong>{stats.total.toFixed(2)} €</strong> à payer.
                            </p>
                            <p>
                                {stats.excluded.length} événement(s) seront <strong>exclus</strong> pour patterns
                                suspects ou flag manuel.
                            </p>
                            <p className="text-xs">
                                Les événements éligibles passeront en{' '}
                                <code className="bg-muted rounded px-1">paid</code> et un CSV sera téléchargé.
                                L&apos;action est tracée dans l&apos;audit log.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirm}>Confirmer & télécharger CSV</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={openPayout !== null} onOpenChange={(o) => !o && setOpenPayout(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Détail payout {openPayout?.period}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {openPayout?.totalEur.toFixed(2)} € versés à {openPayout?.beneficiaryCount} bénéficiaires.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="max-h-72 overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Bénéficiaire</TableHead>
                                    <TableHead className="text-right">Conversions</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {beneficiariesForPayout.map(([id, info]) => (
                                    <TableRow key={id}>
                                        <TableCell>
                                            <p className="text-foreground text-sm">{info.name}</p>
                                            <p className="text-muted-foreground text-[10px]">{id}</p>
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-sm">{info.count}</TableCell>
                                        <TableCell className="text-right font-mono text-sm">
                                            {info.total.toFixed(2)} €
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {beneficiariesForPayout.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={3}
                                            className="text-muted-foreground py-4 text-center text-xs"
                                        >
                                            Aucun bénéficiaire pour cette période.
                                        </TableCell>
                                    </TableRow>
                                ) : null}
                            </TableBody>
                        </Table>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setOpenPayout(null)}>Fermer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone: string }) {
    return (
        <div className="border-border bg-background rounded-lg border p-3">
            <p className="text-muted-foreground text-[10px] uppercase tracking-wider">{label}</p>
            <p className={cn('mt-0.5 font-mono text-lg font-bold', tone)}>{value}</p>
            {sub ? <p className="text-muted-foreground text-[10px]">{sub}</p> : null}
        </div>
    );
}

export const Affiliation = memo(AffiliationComponent);
