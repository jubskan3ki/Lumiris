'use client';

import { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    BadgeCheck,
    Bell,
    Coins,
    CreditCard,
    Download,
    Filter,
    Search,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { mockMrrTrajectory, mockPaymentHistory, mockSubscriptions } from '@lumiris/mock-data';
import type { ArtisanTier, PaymentEvent, Subscription, SubscriptionStatus } from '@lumiris/types';
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
import { GovernanceBanner } from '../_shared/governance-banner';

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
    active: 'Actif',
    trialing: 'Essai',
    past_due: 'Impayé',
    canceled: 'Annulé',
};

const STATUS_TONE: Record<SubscriptionStatus, string> = {
    active: 'border-lumiris-emerald/40 bg-lumiris-emerald/10 text-lumiris-emerald',
    trialing: 'border-lumiris-cyan/40 bg-lumiris-cyan/10 text-lumiris-cyan',
    past_due: 'border-lumiris-rose/40 bg-lumiris-rose/10 text-lumiris-rose',
    canceled: 'border-muted-foreground/40 bg-muted text-muted-foreground',
};

const PAYMENT_STATUS_TONE: Record<PaymentEvent['status'], string> = {
    succeeded: 'border-lumiris-emerald/40 bg-lumiris-emerald/10 text-lumiris-emerald',
    failed: 'border-lumiris-rose/40 bg-lumiris-rose/10 text-lumiris-rose',
    refunded: 'border-lumiris-amber/40 bg-lumiris-amber/10 text-lumiris-amber',
};

const PAYMENT_STATUS_LABEL: Record<PaymentEvent['status'], string> = {
    succeeded: 'Réussi',
    failed: 'Échoué',
    refunded: 'Remboursé',
};

function BillingComponent() {
    return (
        <RequirePermission action="billing.read">
            <BillingInner />
        </RequirePermission>
    );
}

function BillingInner() {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="space-y-5">
            <div className="flex items-baseline justify-between gap-3">
                <div>
                    <h2 className="text-foreground text-xl font-semibold">Billing</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        MRR consolidé · {mockSubscriptions.length} abonnés · paiements 12 mois.
                    </p>
                </div>
            </div>

            <GovernanceBanner />

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
                    <TabsTrigger value="history">Historique paiements</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-5 pt-2">
                    <OverviewTab />
                </TabsContent>
                <TabsContent value="subscriptions" className="space-y-5 pt-2">
                    <SubscriptionsTab />
                </TabsContent>
                <TabsContent value="history" className="space-y-5 pt-2">
                    <HistoryTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}

// ─── Overview ───────────────────────────────────────────────────────────────

function OverviewTab() {
    const kpi = useMemo(() => {
        const active = mockSubscriptions.filter((s) => s.status === 'active' || s.status === 'past_due');
        const mrr = active.reduce((sum, s) => sum + s.mrrEur, 0);
        const lastMonth = mockMrrTrajectory[mockMrrTrajectory.length - 2];
        const thisMonth = mockMrrTrajectory[mockMrrTrajectory.length - 1];
        const lastTotal = lastMonth
            ? lastMonth.solo + lastMonth.studio + lastMonth.maison + lastMonth.plus + lastMonth.local
            : 0;
        const thisTotal = thisMonth
            ? thisMonth.solo + thisMonth.studio + thisMonth.maison + thisMonth.plus + thisMonth.local
            : mrr;
        const netNew = thisTotal - lastTotal;
        const canceled = mockSubscriptions.filter((s) => s.status === 'canceled');
        const churnEur = canceled.length === 0 ? 0 : canceled.length * 79;
        const churnPct = active.length === 0 ? 0 : (canceled.length / (active.length + canceled.length)) * 100;
        const arr = mrr * 12;

        const split = thisMonth ?? { solo: 0, studio: 0, maison: 0, plus: 0, local: 0 };

        return { mrr, arr, churnPct, churnEur, netNew, split };
    }, []);

    const mrrConfig = {
        solo: { label: 'Solo', color: 'var(--lumiris-cyan)' },
        studio: { label: 'Studio', color: 'var(--lumiris-emerald)' },
        maison: { label: 'Maison', color: 'var(--lumiris-amber)' },
        plus: { label: 'ATELIER+', color: 'var(--lumiris-orange)' },
        local: { label: 'Local', color: 'var(--lumiris-rose)' },
    } satisfies ChartConfig;

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-3 lg:grid-cols-4"
            >
                <KpiCard
                    label="MRR consolidé"
                    value={`${kpi.mrr.toLocaleString('fr-FR')} €`}
                    icon={<Coins className="h-4 w-4" />}
                    tone="text-lumiris-emerald"
                />
                <KpiCard
                    label="ARR projeté"
                    value={`${(kpi.arr / 1000).toFixed(1)} k€`}
                    icon={<TrendingUp className="h-4 w-4" />}
                    tone="text-lumiris-cyan"
                />
                <KpiCard
                    label="Net new MRR 30j"
                    value={`${kpi.netNew >= 0 ? '+' : ''}${kpi.netNew} €`}
                    icon={kpi.netNew >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    tone={kpi.netNew >= 0 ? 'text-lumiris-emerald' : 'text-lumiris-rose'}
                />
                <KpiCard
                    label="Churn 30j"
                    value={`${kpi.churnPct.toFixed(1)} %`}
                    sub={`${kpi.churnEur} €`}
                    icon={<TrendingDown className="h-4 w-4" />}
                    tone="text-lumiris-rose"
                />
            </motion.div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="border-border bg-card rounded-xl border p-4 lg:col-span-2">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-foreground text-sm font-medium">Trajectoire MRR — 6 mois</p>
                        <Badge variant="outline" className="font-mono text-[10px]">
                            empilé par ligne
                        </Badge>
                    </div>
                    <ChartContainer config={mrrConfig} className="h-56 w-full">
                        <BarChart data={mockMrrTrajectory.map((p) => ({ ...p }))}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={10} />
                            <YAxis tickLine={false} axisLine={false} fontSize={10} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="solo" stackId="m" fill="var(--color-solo)" />
                            <Bar dataKey="studio" stackId="m" fill="var(--color-studio)" />
                            <Bar dataKey="maison" stackId="m" fill="var(--color-maison)" />
                            <Bar dataKey="plus" stackId="m" fill="var(--color-plus)" />
                            <Bar dataKey="local" stackId="m" fill="var(--color-local)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </div>

                <div className="border-border bg-card rounded-xl border p-4">
                    <p className="text-foreground mb-3 text-sm font-medium">Split mois courant</p>
                    <ul className="space-y-2 text-xs">
                        <SplitRow label="ATELIER Solo" value={kpi.split.solo} tone="bg-lumiris-cyan" />
                        <SplitRow label="ATELIER Studio" value={kpi.split.studio} tone="bg-lumiris-emerald" />
                        <SplitRow label="ATELIER Maison" value={kpi.split.maison} tone="bg-lumiris-amber" />
                        <SplitRow label="ATELIER+" value={kpi.split.plus} tone="bg-lumiris-orange" />
                        <SplitRow label="LOCAL retoucheurs" value={kpi.split.local} tone="bg-lumiris-rose" />
                    </ul>
                </div>
            </div>
        </>
    );
}

function KpiCard({
    label,
    value,
    sub,
    icon,
    tone,
}: {
    label: string;
    value: string;
    sub?: string;
    icon: React.ReactNode;
    tone: string;
}) {
    return (
        <div className="border-border bg-card flex flex-col rounded-xl border p-4">
            <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-[10px] uppercase tracking-wider">{label}</p>
                <span className={cn('opacity-70', tone)}>{icon}</span>
            </div>
            <p className={cn('mt-1 font-mono text-2xl font-bold', tone)}>{value}</p>
            {sub ? <p className="text-muted-foreground mt-0.5 text-[11px]">{sub}</p> : null}
        </div>
    );
}

function SplitRow({ label, value, tone }: { label: string; value: number; tone: string }) {
    const max = 350;
    return (
        <li>
            <div className="flex items-center justify-between text-[11px]">
                <span className="text-foreground">{label}</span>
                <span className="text-muted-foreground font-mono">{value} €</span>
            </div>
            <div className="bg-muted mt-1 h-1.5 overflow-hidden rounded-full">
                <div
                    className={cn('h-full rounded-full', tone)}
                    style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
                />
            </div>
        </li>
    );
}

// ─── Subscriptions ──────────────────────────────────────────────────────────

function SubscriptionsTab() {
    const log = useLogAction();
    const canDun = usePermission('billing.dunning');
    const canExport = usePermission('billing.export');

    const [search, setSearch] = useState('');
    const [kindFilter, setKindFilter] = useState<'all' | 'artisan' | 'repairer'>('all');
    const [tierFilter, setTierFilter] = useState<ArtisanTier | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | 'all'>('all');
    const [plusFilter, setPlusFilter] = useState<'all' | 'on' | 'off'>('all');
    const [cityFilter, setCityFilter] = useState<string>('all');
    const [recentlyDunned, setRecentlyDunned] = useState<Set<string>>(new Set());
    const [dunningTarget, setDunningTarget] = useState<Subscription | null>(null);

    const cities = useMemo(() => Array.from(new Set(mockSubscriptions.map((s) => s.city))).sort(), []);

    const rows = useMemo(() => {
        return mockSubscriptions.filter((s) => {
            if (kindFilter !== 'all' && s.subscriberKind !== kindFilter) return false;
            if (tierFilter !== 'all' && s.artisanTier !== tierFilter) return false;
            if (statusFilter !== 'all' && s.status !== statusFilter) return false;
            if (plusFilter === 'on' && !s.plus) return false;
            if (plusFilter === 'off' && s.plus) return false;
            if (cityFilter !== 'all' && s.city !== cityFilter) return false;
            if (search.trim().length > 0) {
                if (!s.displayName.toLowerCase().includes(search.toLowerCase())) return false;
            }
            return true;
        });
    }, [search, kindFilter, tierFilter, statusFilter, plusFilter, cityFilter]);

    const handleConfirmDunning = (sub: Subscription) => {
        const attemptNumber = (sub.dunningAttempts ?? 0) + 1;
        log({
            action: 'billing.dunning',
            targetType: 'subscription',
            targetId: sub.id,
            payload: {
                tier: sub.tier,
                mrr: sub.mrrEur,
                attemptNumber,
                channel: 'email_mock',
            },
        });
        setRecentlyDunned((prev) => new Set(prev).add(sub.id));
        setDunningTarget(null);
    };

    const handleExport = () => {
        const header = ['id', 'displayName', 'kind', 'tier', 'plus', 'mrr', 'status', 'nextBillingAt', 'city'].join(
            ',',
        );
        const lines = rows.map((s) =>
            [
                s.id,
                s.displayName,
                s.subscriberKind,
                s.tier,
                s.plus ? 'yes' : 'no',
                s.mrrEur,
                s.status,
                s.nextBillingAt,
                s.city,
            ]
                .map((v) => String(v).replace(/,/g, ';'))
                .join(','),
        );
        const csv = `${header}\n${lines.join('\n')}`;
        log({
            action: 'billing.export',
            targetType: 'period',
            targetId: `subs-${new Date().toISOString().slice(0, 10)}`,
            payload: { count: rows.length, format: 'csv' },
        });
        if (typeof window !== 'undefined') {
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lumiris-subs-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    return (
        <>
            <div className="border-border bg-card flex flex-wrap items-center gap-2 rounded-xl border p-3">
                <div className="min-w-55 relative flex-1">
                    <Search className="text-muted-foreground/60 absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Raison sociale…"
                        className="pl-8"
                    />
                </div>
                <Select value={kindFilter} onValueChange={(v) => setKindFilter(v as typeof kindFilter)}>
                    <SelectTrigger className="w-40">
                        <Filter className="mr-1 h-3.5 w-3.5" /> <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous acteurs</SelectItem>
                        <SelectItem value="artisan">Artisans</SelectItem>
                        <SelectItem value="retoucheur">Repairers</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={tierFilter} onValueChange={(v) => setTierFilter(v as ArtisanTier | 'all')}>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Tier" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous tiers</SelectItem>
                        <SelectItem value="Solo">Solo</SelectItem>
                        <SelectItem value="Studio">Studio</SelectItem>
                        <SelectItem value="Maison">Maison</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SubscriptionStatus | 'all')}>
                    <SelectTrigger className="w-36">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous statuts</SelectItem>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="trialing">Essai</SelectItem>
                        <SelectItem value="past_due">Impayé</SelectItem>
                        <SelectItem value="canceled">Annulé</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={plusFilter} onValueChange={(v) => setPlusFilter(v as typeof plusFilter)}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">ATELIER+</SelectItem>
                        <SelectItem value="on">Activé</SelectItem>
                        <SelectItem value="off">Inactif</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={cityFilter} onValueChange={setCityFilter}>
                    <SelectTrigger className="w-36">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes villes</SelectItem>
                        {cities.map((c) => (
                            <SelectItem key={c} value={c}>
                                {c}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={handleExport} disabled={!canExport}>
                    <Download className="h-3.5 w-3.5" /> Exporter CSV
                </Button>
            </div>

            <div className="border-border bg-card overflow-hidden rounded-xl border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Compte</TableHead>
                            <TableHead>Tier</TableHead>
                            <TableHead className="text-right">MRR</TableHead>
                            <TableHead>Prochaine échéance</TableHead>
                            <TableHead>Méthode</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((sub) => {
                            const dunned = recentlyDunned.has(sub.id);
                            return (
                                <TableRow key={sub.id}>
                                    <TableCell>
                                        <div>
                                            <p className="text-foreground text-sm font-medium">{sub.displayName}</p>
                                            <p className="text-muted-foreground text-[10px]">
                                                {sub.subscriberKind === 'artisan' ? 'Artisan' : 'Repairer'} · {sub.city}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Badge variant="outline" className="font-mono text-[10px] capitalize">
                                                {sub.artisanTier ?? sub.tier}
                                            </Badge>
                                            {sub.plus ? (
                                                <Badge
                                                    variant="outline"
                                                    className="border-lumiris-cyan/40 text-lumiris-cyan font-mono text-[10px]"
                                                >
                                                    ATELIER+
                                                </Badge>
                                            ) : null}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-sm">{sub.mrrEur} €</TableCell>
                                    <TableCell className="font-mono text-[11px]">
                                        {new Date(sub.nextBillingAt).toLocaleDateString('fr-FR')}
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-muted-foreground inline-flex items-center gap-1.5 font-mono text-[11px]">
                                            <CreditCard className="h-3 w-3" />
                                            {sub.paymentMethod.brand.toUpperCase()} ····{sub.paymentMethod.last4}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={cn('font-mono text-[10px]', STATUS_TONE[sub.status])}
                                        >
                                            {STATUS_LABEL[sub.status]}
                                        </Badge>
                                        {dunned ? (
                                            <Badge
                                                variant="outline"
                                                className="border-lumiris-amber/40 text-lumiris-amber ml-1.5 font-mono text-[10px]"
                                            >
                                                <Bell className="mr-1 h-2.5 w-2.5" /> Relance envoyée
                                            </Badge>
                                        ) : null}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {sub.status === 'past_due' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={!canDun || dunned}
                                                onClick={() => setDunningTarget(sub)}
                                                className="gap-1.5"
                                            >
                                                <Bell className="h-3 w-3" />
                                                {dunned ? 'Relancé' : 'Relancer'}
                                            </Button>
                                        ) : null}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-muted-foreground py-8 text-center text-xs">
                                    Aucun abonnement ne correspond aux filtres.
                                </TableCell>
                            </TableRow>
                        ) : null}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={dunningTarget !== null} onOpenChange={(o) => !o && setDunningTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Relancer {dunningTarget?.displayName} ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Un email automatique sera envoyé au compte{' '}
                            <code className="bg-muted rounded px-1 font-mono">{dunningTarget?.id}</code>. Tentative n°
                            {(dunningTarget?.dunningAttempts ?? 0) + 1}. L&apos;action est tracée dans le journal
                            d&apos;audit.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => dunningTarget && handleConfirmDunning(dunningTarget)}>
                            Envoyer la relance
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

// ─── Payment history ────────────────────────────────────────────────────────

function HistoryTab() {
    const [statusFilter, setStatusFilter] = useState<PaymentEvent['status'] | 'all'>('all');
    const [kindFilter, setKindFilter] = useState<'all' | 'artisan' | 'repairer'>('all');
    const [periodFilter, setPeriodFilter] = useState<'30d' | '90d' | '12m' | 'all'>('12m');

    const rows = useMemo(() => {
        const now = Date.now();
        const cutoffMs =
            periodFilter === '30d'
                ? 30 * 86_400_000
                : periodFilter === '90d'
                  ? 90 * 86_400_000
                  : periodFilter === '12m'
                    ? 365 * 86_400_000
                    : Number.POSITIVE_INFINITY;
        return mockPaymentHistory.filter((p) => {
            if (statusFilter !== 'all' && p.status !== statusFilter) return false;
            if (kindFilter !== 'all' && p.subscriberKind !== kindFilter) return false;
            if (now - new Date(p.chargedAt).getTime() > cutoffMs) return false;
            return true;
        });
    }, [statusFilter, kindFilter, periodFilter]);

    const summary = useMemo(() => {
        const succeeded = rows.filter((r) => r.status === 'succeeded');
        const failed = rows.filter((r) => r.status === 'failed');
        const succeededAmount = succeeded.reduce((sum, r) => sum + r.amountEur, 0);
        const failedAmount = failed.reduce((sum, r) => sum + r.amountEur, 0);
        return {
            count: rows.length,
            succeeded: succeeded.length,
            failed: failed.length,
            succeededAmount,
            failedAmount,
        };
    }, [rows]);

    return (
        <>
            <div className="border-border bg-card flex flex-wrap items-center gap-2 rounded-xl border p-3">
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                    <SelectTrigger className="w-36">
                        <Filter className="mr-1 h-3.5 w-3.5" /> <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous statuts</SelectItem>
                        <SelectItem value="succeeded">Réussis</SelectItem>
                        <SelectItem value="failed">Échoués</SelectItem>
                        <SelectItem value="refunded">Remboursés</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={kindFilter} onValueChange={(v) => setKindFilter(v as typeof kindFilter)}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous acteurs</SelectItem>
                        <SelectItem value="artisan">Artisans</SelectItem>
                        <SelectItem value="retoucheur">Repairers</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as typeof periodFilter)}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="30d">30 jours</SelectItem>
                        <SelectItem value="90d">90 jours</SelectItem>
                        <SelectItem value="12m">12 mois</SelectItem>
                        <SelectItem value="all">Tout</SelectItem>
                    </SelectContent>
                </Select>
                <div className="text-muted-foreground ml-auto flex items-center gap-3 text-[11px]">
                    <span className="text-lumiris-emerald inline-flex items-center gap-1">
                        <BadgeCheck className="h-3 w-3" /> {summary.succeeded} réussis · {summary.succeededAmount} €
                    </span>
                    <span className="text-lumiris-rose inline-flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {summary.failed} échoués · {summary.failedAmount} €
                    </span>
                </div>
            </div>

            <div className="border-border bg-card overflow-hidden rounded-xl border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Compte</TableHead>
                            <TableHead className="text-right">Montant</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Détail</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.slice(0, 100).map((p) => (
                            <TableRow key={p.id}>
                                <TableCell className="font-mono text-[11px]">
                                    {new Date(p.chargedAt).toLocaleDateString('fr-FR')}
                                </TableCell>
                                <TableCell>
                                    <p className="text-foreground text-sm">{p.displayName}</p>
                                    <p className="text-muted-foreground text-[10px]">
                                        {p.subscriberKind} · {p.subscriberId}
                                    </p>
                                </TableCell>
                                <TableCell className="text-right font-mono text-sm">{p.amountEur} €</TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={cn('font-mono text-[10px]', PAYMENT_STATUS_TONE[p.status])}
                                    >
                                        {PAYMENT_STATUS_LABEL[p.status]}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <span className="text-muted-foreground font-mono text-[11px]">
                                        {p.failureReason ?? '—'}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                        {rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-muted-foreground py-8 text-center text-xs">
                                    Aucun paiement ne correspond aux filtres.
                                </TableCell>
                            </TableRow>
                        ) : null}
                    </TableBody>
                </Table>
                {rows.length > 100 ? (
                    <div className="border-border text-muted-foreground border-t px-4 py-2 text-center text-[11px]">
                        Affichage limité à 100 lignes — affinez les filtres pour voir le reste ({rows.length} au total).
                    </div>
                ) : null}
            </div>
        </>
    );
}

export const Billing = memo(BillingComponent);
