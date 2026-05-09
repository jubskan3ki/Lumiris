'use client';

import { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownUp, Filter, Flag, Info, Search, Sparkles } from 'lucide-react';
import { mockArtisans, mockPassports } from '@lumiris/mock-data';
import type { Passport, ArtisanTier, IrisGrade as IrisGradeLetter } from '@lumiris/types';
import { IrisGrade as IrisGradeBadge } from '@lumiris/scoring-ui';
import { Avatar, AvatarFallback, AvatarImage } from '@lumiris/ui/components/avatar';
import { Badge } from '@lumiris/ui/components/badge';
import { Button } from '@lumiris/ui/components/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@lumiris/ui/components/hover-card';
import { Input } from '@lumiris/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@lumiris/ui/components/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@lumiris/ui/components/table';
import { cn } from '@lumiris/ui/lib/cn';
import { RequirePermission } from '@/lib/auth';
import { CurationStoreProvider } from './curation-store';
import { PassportDrawer } from './drawer';
import { useIrisScore, usePassportRows } from './hooks';
import type { EffectiveStatus, PassportRow } from './types';

const STATUS_LABEL: Record<EffectiveStatus, string> = {
    pending: 'À examiner',
    validated: 'Validé',
    changes_requested: 'Changements demandés',
    flagged: 'Flaggé',
    archived: 'Archivé',
};

const STATUS_TONE: Record<EffectiveStatus, string> = {
    pending: 'border-lumiris-cyan/40 bg-lumiris-cyan/10 text-lumiris-cyan',
    validated: 'border-lumiris-emerald/40 bg-lumiris-emerald/10 text-lumiris-emerald',
    changes_requested: 'border-lumiris-amber/40 bg-lumiris-amber/10 text-lumiris-amber',
    flagged: 'border-lumiris-rose/40 bg-lumiris-rose/10 text-lumiris-rose',
    archived: 'border-muted-foreground/40 bg-muted text-muted-foreground',
};

type SortKey = 'fifo' | 'grade' | 'artisan';

function PassportsComponent() {
    return (
        <RequirePermission action="passport.read">
            <CurationStoreProvider>
                <PassportsInner />
            </CurationStoreProvider>
        </RequirePermission>
    );
}

function PassportsInner() {
    const rows = usePassportRows(mockPassports);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<EffectiveStatus | 'all'>('all');
    const [tierFilter, setTierFilter] = useState<ArtisanTier | 'all'>('all');
    const [labelFilter, setLabelFilter] = useState<'all' | 'epv' | 'ofg'>('all');
    const [sortKey, setSortKey] = useState<SortKey>('fifo');
    const [selected, setSelected] = useState<Passport | null>(null);

    const filtered = useMemo(() => {
        return rows.filter((row) => {
            if (statusFilter !== 'all' && row.status !== statusFilter) return false;
            const artisan = mockArtisans.find((a) => a.id === row.passport.artisanId);
            if (tierFilter !== 'all' && artisan?.tier !== tierFilter) return false;
            if (labelFilter === 'epv' && !artisan?.epvLabeled) return false;
            if (labelFilter === 'ofg' && !artisan?.ofgLabeled) return false;
            if (search.trim().length > 0) {
                const needle = search.toLowerCase();
                const haystack = [
                    row.passport.id,
                    row.passport.garment.reference,
                    artisan?.atelierName ?? '',
                    artisan?.displayName ?? '',
                    artisan?.city ?? '',
                ]
                    .join(' ')
                    .toLowerCase();
                if (!haystack.includes(needle)) return false;
            }
            return true;
        });
    }, [rows, search, statusFilter, tierFilter, labelFilter]);

    const kpis = useMemo(() => {
        const pending = rows.filter((r) => r.status === 'pending').length;
        const flagged = rows.filter((r) => r.status === 'flagged').length;
        const validatedLast7d = rows.filter(
            (r) => r.status === 'validated' && Date.now() - new Date(r.passport.updatedAt).getTime() < 7 * 86_400_000,
        ).length;
        const pendingRows = rows.filter((r) => r.status === 'pending');
        const avgDelayHours =
            pendingRows.length === 0
                ? 0
                : Math.round(pendingRows.reduce((sum, r) => sum + r.ageHours, 0) / pendingRows.length);
        return { pending, flagged, validatedLast7d, avgDelayHours };
    }, [rows]);

    return (
        <div className="space-y-5">
            <div className="flex items-baseline justify-between gap-3">
                <div>
                    <h2 className="text-foreground text-xl font-semibold">File de curation</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {mockPassports.length} passeports — calculé en direct via{' '}
                        <span className="font-mono">computeScore()</span>.
                    </p>
                </div>
            </div>

            <Kpis {...kpis} />

            <FairnessBanner />

            <div className="border-border bg-card flex flex-wrap items-center gap-2 rounded-xl border p-3">
                <div className="min-w-55 relative flex-1">
                    <Search className="text-muted-foreground/60 absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Référence, artisan, ville…"
                        className="pl-8"
                    />
                </div>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as EffectiveStatus | 'all')}>
                    <SelectTrigger className="w-45">
                        <Filter className="mr-1 h-3.5 w-3.5" /> <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous statuts</SelectItem>
                        <SelectItem value="pending">À examiner</SelectItem>
                        <SelectItem value="validated">Validé</SelectItem>
                        <SelectItem value="changes_requested">Changements demandés</SelectItem>
                        <SelectItem value="flagged">Flaggé</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={tierFilter} onValueChange={(v) => setTierFilter(v as ArtisanTier | 'all')}>
                    <SelectTrigger className="w-35">
                        <SelectValue placeholder="Tier" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous tiers</SelectItem>
                        <SelectItem value="Solo">Solo</SelectItem>
                        <SelectItem value="Studio">Studio</SelectItem>
                        <SelectItem value="Maison">Maison</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={labelFilter} onValueChange={(v) => setLabelFilter(v as 'all' | 'epv' | 'ofg')}>
                    <SelectTrigger className="w-35">
                        <SelectValue placeholder="Label" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous labels</SelectItem>
                        <SelectItem value="epv">EPV</SelectItem>
                        <SelectItem value="ofg">OFG</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                    <SelectTrigger className="w-40">
                        <ArrowDownUp className="mr-1 h-3.5 w-3.5" /> <SelectValue placeholder="Tri" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="fifo">FIFO (équitable)</SelectItem>
                        <SelectItem value="grade">Par grade</SelectItem>
                        <SelectItem value="artisan">Par artisan</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <PassportTable rows={filtered} sortKey={sortKey} onSelect={setSelected} />

            <PassportDrawer passport={selected} onClose={() => setSelected(null)} />
        </div>
    );
}

function FairnessBanner() {
    return (
        <HoverCard openDelay={120}>
            <HoverCardTrigger asChild>
                <button
                    type="button"
                    className="border-lumiris-emerald/30 bg-lumiris-emerald/5 text-lumiris-emerald hover:bg-lumiris-emerald/10 flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs transition-colors"
                >
                    <Info className="h-3.5 w-3.5 shrink-0" />
                    <span>
                        <strong>Tri équitable</strong> — ATELIER+ n&apos;influence pas l&apos;ordre. Le tri par défaut
                        est FIFO sur date de soumission. Cliquez pour voir la règle.
                    </span>
                </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
                <div className="space-y-2 text-xs">
                    <p className="text-foreground font-semibold">Personne n&apos;achète sa place dans la file.</p>
                    <p className="text-muted-foreground">
                        ATELIER+ donne accès au dépôt-vente, à la facturation OCR et à l&apos;analytics — jamais à un
                        coupe-file ni à un boost de score. La file de curation est strictement FIFO sur la date de
                        soumission. Une route indique le flag <code className="bg-muted rounded px-1">addonPlus</code>{' '}
                        sur les profils, mais le scoring l&apos;ignore.
                    </p>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}

function Kpis({
    pending,
    flagged,
    validatedLast7d,
    avgDelayHours,
}: {
    pending: number;
    flagged: number;
    validatedLast7d: number;
    avgDelayHours: number;
}) {
    const kpis = [
        { label: 'À examiner', value: pending.toString(), tone: 'text-lumiris-cyan' },
        {
            label: 'Délai moyen',
            value: `${avgDelayHours} h`,
            tone: 'text-lumiris-amber',
        },
        {
            label: 'Validés 7j',
            value: validatedLast7d.toString(),
            tone: 'text-lumiris-emerald',
        },
        { label: 'Flags actifs', value: flagged.toString(), tone: 'text-lumiris-rose' },
    ];
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
            {kpis.map((kpi) => (
                <div key={kpi.label} className="border-border bg-card flex flex-col rounded-xl border p-4">
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wider">{kpi.label}</p>
                    <p className={cn('mt-1 font-mono text-2xl font-bold', kpi.tone)}>{kpi.value}</p>
                </div>
            ))}
        </motion.div>
    );
}

function PassportTable({
    rows,
    sortKey,
    onSelect,
}: {
    rows: readonly PassportRow[];
    sortKey: SortKey;
    onSelect: (p: Passport) => void;
}) {
    const sorted = useMemo(() => {
        const copy = [...rows];
        if (sortKey === 'fifo') {
            copy.sort((a, b) => new Date(a.passport.createdAt).getTime() - new Date(b.passport.createdAt).getTime());
        } else if (sortKey === 'artisan') {
            copy.sort((a, b) => a.passport.artisanId.localeCompare(b.passport.artisanId));
        }
        return copy;
    }, [rows, sortKey]);

    if (sorted.length === 0) {
        return (
            <div className="border-border bg-card text-muted-foreground rounded-xl border p-12 text-center text-sm">
                Aucun passeport ne correspond aux filtres.
            </div>
        );
    }

    return (
        <div className="border-border bg-card overflow-hidden rounded-xl border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Passeport</TableHead>
                        <TableHead>Artisan</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Délai</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sorted.map((row) => (
                        <PassportRowItem key={row.passport.id} row={row} sortKey={sortKey} onSelect={onSelect} />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function PassportRowItem({
    row,
    sortKey,
    onSelect,
}: {
    row: PassportRow;
    sortKey: SortKey;
    onSelect: (p: Passport) => void;
}) {
    const score = useIrisScore(row.passport);
    const artisan = mockArtisans.find((a) => a.id === row.passport.artisanId);
    const grade: IrisGradeLetter = score.grade;

    if (sortKey === 'grade') {
        // re-sort guard handled by parent — placeholder.
    }

    return (
        <TableRow className="cursor-pointer transition-colors" onClick={() => onSelect(row.passport)}>
            <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                    <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md">
                        {row.passport.garment.mainPhotoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={row.passport.garment.mainPhotoUrl}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <Sparkles className="text-muted-foreground/40 h-3 w-3" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-foreground truncate text-sm">{row.passport.garment.reference}</p>
                        <p className="text-muted-foreground truncate text-[10px]">
                            {row.passport.garment.kind} · {row.passport.id}
                        </p>
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                        {artisan?.photoUrl ? <AvatarImage src={artisan.photoUrl} alt="" /> : null}
                        <AvatarFallback className="text-[10px]">
                            {artisan?.displayName.slice(0, 2).toUpperCase() ?? '—'}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-foreground text-xs">{artisan?.atelierName ?? '—'}</p>
                        <div className="mt-0.5 flex items-center gap-1">
                            <Badge variant="outline" className="font-mono text-[10px]">
                                {artisan?.tier}
                            </Badge>
                            {artisan?.plus ? (
                                <Badge
                                    variant="outline"
                                    className="border-lumiris-cyan/40 text-lumiris-cyan font-mono text-[10px]"
                                >
                                    ATELIER+
                                </Badge>
                            ) : null}
                        </div>
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <IrisGradeBadge grade={grade} size="sm" />
                    {score.cap?.applied ? <Flag className="text-lumiris-rose h-3 w-3" /> : null}
                </div>
            </TableCell>
            <TableCell>
                <Badge variant="outline" className={cn('font-mono text-[10px]', STATUS_TONE[row.status])}>
                    {STATUS_LABEL[row.status]}
                </Badge>
            </TableCell>
            <TableCell className="text-right">
                <span className="font-mono text-[11px]">{row.ageHours} h</span>
            </TableCell>
            <TableCell className="text-right">
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(row.passport);
                    }}
                >
                    Examiner
                </Button>
            </TableCell>
        </TableRow>
    );
}

export const Passports = memo(PassportsComponent);
