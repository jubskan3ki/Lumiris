'use client';

import { memo, useMemo, useState } from 'react';
import { AlertTriangle, Filter, Search } from 'lucide-react';
import { mockArtisans, mockPassports, mockRepairers } from '@lumiris/mock-data';
import { type Artisan, type ArtisanTier, type IrisGrade } from '@lumiris/types';
import { Avatar, AvatarFallback, AvatarImage } from '@lumiris/ui/components/avatar';
import { Badge } from '@lumiris/ui/components/badge';
import { Button } from '@lumiris/ui/components/button';
import { Input } from '@lumiris/ui/components/input';
import { Progress } from '@lumiris/ui/components/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@lumiris/ui/components/select';
import { Sheet, SheetContent } from '@lumiris/ui/components/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@lumiris/ui/components/table';
import { RequirePermission } from '@/lib/auth';
import { buildArtisanRows, type ArtisanRow } from '@/lib/artisan-analytics';
import { ArtisanDrawerBody } from './drawer-body';

const SCORING_NOW = new Date('2026-04-30T08:00:00Z');

function ArtisansComponent() {
    return (
        <RequirePermission action="artisan.read">
            <ArtisansInner />
        </RequirePermission>
    );
}

function ArtisansInner() {
    const [search, setSearch] = useState('');
    const [tierFilter, setTierFilter] = useState<ArtisanTier | 'all'>('all');
    const [labelFilter, setLabelFilter] = useState<'all' | 'epv' | 'ofg'>('all');
    const [plusFilter, setPlusFilter] = useState<'all' | 'on' | 'off'>('all');
    const [selected, setSelected] = useState<Artisan | null>(null);

    const rows: readonly ArtisanRow[] = useMemo(
        () => buildArtisanRows(mockArtisans, mockPassports, mockRepairers, SCORING_NOW),
        [],
    );

    const filtered = useMemo(() => {
        return rows.filter((r) => {
            if (tierFilter !== 'all' && r.artisan.tier !== tierFilter) return false;
            if (labelFilter === 'epv' && !r.artisan.epvLabeled) return false;
            if (labelFilter === 'ofg' && !r.artisan.ofgLabeled) return false;
            if (plusFilter === 'on' && !r.artisan.plus) return false;
            if (plusFilter === 'off' && r.artisan.plus) return false;
            if (search.trim().length > 0) {
                const needle = search.toLowerCase();
                const haystack =
                    `${r.artisan.atelierName} ${r.artisan.displayName} ${r.artisan.city} ${r.artisan.id}`.toLowerCase();
                if (!haystack.includes(needle)) return false;
            }
            return true;
        });
    }, [rows, search, tierFilter, labelFilter, plusFilter]);

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-foreground text-xl font-semibold">Artisans</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                    {mockArtisans.length} ateliers - Solo / Studio / Maison · ATELIER+ flag visible sans privilège de
                    file.
                </p>
            </div>

            <div className="border-border bg-card flex flex-wrap items-center gap-2 rounded-xl border p-3">
                <div className="min-w-55 relative flex-1">
                    <Search className="text-muted-foreground/60 absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Atelier, nom, ville…"
                        className="pl-8"
                    />
                </div>
                <Select value={tierFilter} onValueChange={(v) => setTierFilter(v as ArtisanTier | 'all')}>
                    <SelectTrigger className="w-35">
                        <Filter className="mr-1 h-3.5 w-3.5" /> <SelectValue />
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
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous labels</SelectItem>
                        <SelectItem value="epv">EPV</SelectItem>
                        <SelectItem value="ofg">OFG</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={plusFilter} onValueChange={(v) => setPlusFilter(v as 'all' | 'on' | 'off')}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">ATELIER+ (tous)</SelectItem>
                        <SelectItem value="on">ATELIER+ activé</SelectItem>
                        <SelectItem value="off">Sans ATELIER+</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <ArtisanTable rows={filtered} onSelect={setSelected} />

            <ArtisanDrawer artisan={selected} onClose={() => setSelected(null)} />
        </div>
    );
}

function ArtisanTable({ rows, onSelect }: { rows: readonly ArtisanRow[]; onSelect: (a: Artisan) => void }) {
    if (rows.length === 0) {
        return (
            <div className="border-border bg-card text-muted-foreground rounded-xl border p-12 text-center text-sm">
                Aucun artisan ne correspond aux filtres.
            </div>
        );
    }
    return (
        <div className="border-border bg-card overflow-hidden rounded-xl border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Atelier</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Passeports</TableHead>
                        <TableHead>Score moyen</TableHead>
                        <TableHead>MRR</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => {
                        const ratio =
                            row.artisan.passportLimit === Number.POSITIVE_INFINITY
                                ? 0
                                : Math.min(100, (row.publishedCount / row.artisan.passportLimit) * 100);
                        return (
                            <TableRow
                                key={row.artisan.id}
                                className="cursor-pointer"
                                onClick={() => onSelect(row.artisan)}
                            >
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={row.artisan.photoUrl} alt="" />
                                            <AvatarFallback className="text-[10px]">
                                                {row.artisan.displayName.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="text-foreground truncate text-sm">
                                                {row.artisan.atelierName}
                                            </p>
                                            <p className="text-muted-foreground truncate text-[11px]">
                                                {row.artisan.displayName} · {row.artisan.city}
                                            </p>
                                            {row.qualityRisk ? (
                                                <Badge
                                                    variant="outline"
                                                    className="border-lumiris-orange/40 bg-lumiris-orange/10 text-lumiris-orange mt-1 gap-1 font-mono text-[10px]"
                                                >
                                                    <AlertTriangle className="h-3 w-3" /> Risque qualité
                                                </Badge>
                                            ) : null}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5">
                                        <Badge variant="outline" className="font-mono text-[10px]">
                                            {row.artisan.tier}
                                        </Badge>
                                        {row.artisan.plus ? (
                                            <Badge
                                                variant="outline"
                                                className="border-lumiris-cyan/40 text-lumiris-cyan font-mono text-[10px]"
                                            >
                                                ATELIER+
                                            </Badge>
                                        ) : null}
                                        {row.artisan.epvLabeled ? (
                                            <Badge
                                                variant="outline"
                                                className="border-lumiris-emerald/40 text-lumiris-emerald font-mono text-[10px]"
                                            >
                                                EPV
                                            </Badge>
                                        ) : null}
                                        {row.artisan.ofgLabeled ? (
                                            <Badge
                                                variant="outline"
                                                className="border-lumiris-amber/40 text-lumiris-amber font-mono text-[10px]"
                                            >
                                                OFG
                                            </Badge>
                                        ) : null}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <span className="font-mono text-xs">
                                            {row.publishedCount}
                                            <span className="text-muted-foreground">
                                                {' '}
                                                /{' '}
                                                {row.artisan.passportLimit === Number.POSITIVE_INFINITY
                                                    ? '∞'
                                                    : row.artisan.passportLimit}
                                            </span>
                                        </span>
                                        {ratio > 0 ? <Progress value={ratio} className="h-1" /> : null}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="font-mono text-xs">
                                        {row.avgScore === 0 ? '-' : row.avgScore.toFixed(1)}
                                        {row.avgGrade !== '-' ? (
                                            <span className="text-muted-foreground"> · {row.avgGrade}</span>
                                        ) : null}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="font-mono text-xs">{row.mrr}€</span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelect(row.artisan);
                                        }}
                                    >
                                        Détail
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

function ArtisanDrawer({ artisan, onClose }: { artisan: Artisan | null; onClose: () => void }) {
    return (
        <Sheet open={artisan !== null} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="bg-background w-full overflow-hidden p-0 sm:max-w-2xl">
                {artisan ? <ArtisanDrawerBody artisan={artisan} onClose={onClose} /> : null}
            </SheetContent>
        </Sheet>
    );
}

export const Artisans = memo(ArtisansComponent);
