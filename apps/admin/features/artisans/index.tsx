'use client';

import { memo, useMemo, useState } from 'react';
import { AlertTriangle, Award, Filter, Mail, PauseCircle, Search } from 'lucide-react';
import { computeScore } from '@lumiris/core/scoring';
import { mockAdminAuditLog, mockArtisans, mockPassports, mockRepairers } from '@lumiris/mock-data';
import type { Artisan, ArtisanTier, IrisGrade } from '@lumiris/types';
import { Wardrobe, type WardrobeCardItem } from '@lumiris/scoring-ui';
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
import { Avatar, AvatarFallback, AvatarImage } from '@lumiris/ui/components/avatar';
import { Badge } from '@lumiris/ui/components/badge';
import { Button } from '@lumiris/ui/components/button';
import { Input } from '@lumiris/ui/components/input';
import { Progress } from '@lumiris/ui/components/progress';
import { ScrollArea } from '@lumiris/ui/components/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@lumiris/ui/components/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@lumiris/ui/components/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@lumiris/ui/components/tabs';
import { Textarea } from '@lumiris/ui/components/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@lumiris/ui/components/table';
import { RequirePermission, useAdminAuditLog, useLogAction, usePermission } from '@/lib/auth';

const SCORING_NOW = new Date('2026-04-30T08:00:00Z');

const TIER_MRR: Record<ArtisanTier, number> = { Solo: 29, Studio: 79, Maison: 149 };
const PLUS_ADDON = 19;

interface ArtisanRow {
    artisan: Artisan;
    publishedCount: number;
    avgGrade: IrisGrade | '—';
    avgScore: number;
    cappedShare: number;
    flaggedShare: number;
    qualityRisk: boolean;
    mrr: number;
}

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

    const rows: readonly ArtisanRow[] = useMemo(() => {
        return mockArtisans.map((artisan) => {
            const passports = mockPassports.filter((p) => p.artisanId === artisan.id);
            const published = passports.filter((p) => p.status === 'Published');
            const scores = published.map((p) =>
                computeScore(p, {
                    certificates: p.materials.flatMap((m) => m.certifications),
                    artisan,
                    retoucheurs: mockRepairers,
                    now: SCORING_NOW,
                }),
            );
            const cappedShare =
                scores.length === 0
                    ? 0
                    : scores.filter((s) => s.cap?.applied || s.grade === 'D').length / scores.length;
            const avgScore = scores.length === 0 ? 0 : scores.reduce((sum, s) => sum + s.total, 0) / scores.length;
            const gradeCounts: Record<IrisGrade, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
            scores.forEach((s) => {
                gradeCounts[s.grade] += 1;
            });
            const dominantGrade =
                scores.length === 0
                    ? '—'
                    : (Object.keys(gradeCounts) as IrisGrade[]).reduce(
                          (best, g) => (gradeCounts[g] > gradeCounts[best] ? g : best),
                          'A',
                      );
            return {
                artisan,
                publishedCount: published.length,
                avgGrade: dominantGrade as IrisGrade | '—',
                avgScore,
                cappedShare,
                flaggedShare: 0,
                qualityRisk: cappedShare > 0.3,
                mrr: TIER_MRR[artisan.tier] + (artisan.plus ? PLUS_ADDON : 0),
            } satisfies ArtisanRow;
        });
    }, []);

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
                    {mockArtisans.length} ateliers — Solo / Studio / Maison · ATELIER+ flag visible sans privilège de
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
                                        {row.avgScore === 0 ? '—' : row.avgScore.toFixed(1)}
                                        {row.avgGrade !== '—' ? (
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

function ArtisanDrawerBody({ artisan, onClose }: { artisan: Artisan; onClose: () => void }) {
    const log = useLogAction();
    const auditLog = useAdminAuditLog();
    const canSuspend = usePermission('artisan.suspend');
    const canContact = usePermission('artisan.contact');
    const canDunning = usePermission('billing.dunning');
    const [suspendOpen, setSuspendOpen] = useState(false);
    const [suspendReason, setSuspendReason] = useState('');
    const [contactOpen, setContactOpen] = useState(false);
    const [contactMessage, setContactMessage] = useState(
        `Bonjour ${artisan.displayName}, l'équipe LUMIRIS souhaite faire un point avec vous concernant votre atelier.`,
    );
    const [suspended, setSuspended] = useState(false);

    const passports = mockPassports.filter((p) => p.artisanId === artisan.id);
    const wardrobeItems: WardrobeCardItem[] = passports
        .filter((p) => p.status === 'Published')
        .map((p) => {
            const score = computeScore(p, {
                certificates: p.materials.flatMap((m) => m.certifications),
                artisan,
                retoucheurs: mockRepairers,
                now: SCORING_NOW,
            });
            return {
                id: p.id,
                name: p.garment.reference,
                brand: artisan.atelierName,
                grade: score.grade,
                score: score.total,
                price: p.garment.retailPrice,
                passportId: p.id,
            } satisfies WardrobeCardItem;
        });

    const localActivity = useMemo(
        () =>
            [...auditLog, ...mockAdminAuditLog].filter(
                (entry) => entry.targetId === artisan.id || entry.payload?.artisanId === artisan.id,
            ),
        [auditLog, artisan.id],
    );

    const handleSuspend = () => {
        if (suspendReason.trim().length === 0) return;
        log({
            action: 'artisan.suspend',
            targetType: 'artisan',
            targetId: artisan.id,
            payload: { reason: suspendReason },
        });
        setSuspended(true);
        setSuspendOpen(false);
        setSuspendReason('');
    };

    const handleContact = () => {
        log({
            action: 'artisan.contact',
            targetType: 'artisan',
            targetId: artisan.id,
            payload: { channel: 'email', message: contactMessage.slice(0, 240) },
        });
        setContactOpen(false);
    };

    const handleDunning = () => {
        log({
            action: 'billing.dunning',
            targetType: 'artisan',
            targetId: artisan.id,
            payload: { stage: 'reminder-1', triggeredFrom: 'artisans-module' },
        });
    };

    return (
        <div className="flex h-full flex-col">
            <SheetHeader className="border-border border-b p-5">
                <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={artisan.photoUrl} alt="" />
                        <AvatarFallback>{artisan.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <SheetTitle className="truncate">{artisan.atelierName}</SheetTitle>
                        <p className="text-muted-foreground truncate text-xs">
                            {artisan.displayName} · {artisan.city} · {artisan.region}
                        </p>
                    </div>
                    {suspended ? (
                        <Badge
                            variant="outline"
                            className="border-lumiris-rose/40 bg-lumiris-rose/10 text-lumiris-rose font-mono text-[10px]"
                        >
                            Suspendu
                        </Badge>
                    ) : null}
                </div>
            </SheetHeader>

            <Tabs defaultValue="profile" className="flex flex-1 flex-col overflow-hidden">
                <TabsList className="border-border w-full justify-start gap-1 rounded-none border-b bg-transparent px-3">
                    <TabsTrigger value="profile">Profil</TabsTrigger>
                    <TabsTrigger value="passports">Passeports ({passports.length})</TabsTrigger>
                    <TabsTrigger value="subscription">Abonnement</TabsTrigger>
                    <TabsTrigger value="activity">Activité</TabsTrigger>
                </TabsList>
                <ScrollArea className="flex-1">
                    <div className="p-5">
                        <TabsContent value="profile" className="m-0 space-y-3 text-xs">
                            <Card label="SIRET (vérification CMA mockée)">
                                <p className="font-mono text-[11px]">FR-{artisan.id.toUpperCase()}-PROXY</p>
                            </Card>
                            <Card label="Atelier">
                                <p>
                                    {artisan.atelierName} — {artisan.city}, {artisan.region}
                                </p>
                            </Card>
                            <Card label="Spécialités">
                                <ul className="flex flex-wrap gap-1.5">
                                    {artisan.specialities.map((s) => (
                                        <Badge key={s} variant="outline" className="text-[10px]">
                                            {s}
                                        </Badge>
                                    ))}
                                </ul>
                            </Card>
                            <Card label="Labels">
                                <div className="flex flex-wrap gap-1.5">
                                    {artisan.epvLabeled ? (
                                        <Badge
                                            variant="outline"
                                            className="border-lumiris-emerald/40 text-lumiris-emerald gap-1 text-[10px]"
                                        >
                                            <Award className="h-3 w-3" /> EPV depuis 2018
                                        </Badge>
                                    ) : null}
                                    {artisan.ofgLabeled ? (
                                        <Badge
                                            variant="outline"
                                            className="border-lumiris-amber/40 text-lumiris-amber gap-1 text-[10px]"
                                        >
                                            <Award className="h-3 w-3" /> OFG (Origine France)
                                        </Badge>
                                    ) : null}
                                    {!artisan.epvLabeled && !artisan.ofgLabeled ? (
                                        <p className="text-muted-foreground italic">Aucun label métier.</p>
                                    ) : null}
                                </div>
                            </Card>
                            <Card label="Bio">
                                <p>{artisan.story}</p>
                            </Card>
                        </TabsContent>

                        <TabsContent value="passports" className="m-0">
                            {wardrobeItems.length === 0 ? (
                                <p className="text-muted-foreground text-xs italic">Aucun passeport publié.</p>
                            ) : (
                                <Wardrobe items={wardrobeItems} density="cozy" />
                            )}
                        </TabsContent>

                        <TabsContent value="subscription" className="m-0 space-y-3 text-xs">
                            <Card label="Plan actif">
                                <div className="flex items-baseline justify-between">
                                    <p className="text-foreground font-medium">
                                        ATELIER {artisan.tier}{' '}
                                        {artisan.plus ? <span className="text-lumiris-cyan">+ ATELIER+</span> : null}
                                    </p>
                                    <p className="font-mono">
                                        {TIER_MRR[artisan.tier] + (artisan.plus ? PLUS_ADDON : 0)} €/mois
                                    </p>
                                </div>
                            </Card>
                            <Card label="Méthode de paiement (mock)">
                                <p className="font-mono text-[11px]">Visa · last4 4242 · expire 12/29</p>
                            </Card>
                            <Card label="Prochain prélèvement">
                                <p className="font-mono text-[11px]">2026-05-15</p>
                            </Card>
                            <Card label="Historique tier">
                                <ol className="relative space-y-2 border-l border-dashed pl-4">
                                    <li>
                                        <span className="bg-foreground -left-1.25 absolute mt-1 block h-2 w-2 rounded-full" />
                                        <p>
                                            {fmt(artisan.joinedAt)} — création compte ({artisan.tier})
                                        </p>
                                    </li>
                                </ol>
                            </Card>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleDunning}
                                disabled={!canDunning}
                                className="gap-1.5"
                            >
                                Relancer dunning
                            </Button>
                            {!canDunning ? (
                                <p className="text-muted-foreground text-[10px]">
                                    Permission <code>billing.dunning</code> requise.
                                </p>
                            ) : null}
                        </TabsContent>

                        <TabsContent value="activity" className="m-0">
                            {localActivity.length === 0 ? (
                                <p className="text-muted-foreground text-xs italic">
                                    Aucune action admin sur ce profil.
                                </p>
                            ) : (
                                <ol className="relative space-y-2 border-l border-dashed pl-4 text-xs">
                                    {localActivity.slice(0, 30).map((entry) => (
                                        <li key={entry.id} className="relative">
                                            <span className="bg-foreground -left-1.25 absolute mt-1 block h-2 w-2 rounded-full" />
                                            <p className="text-foreground">
                                                <span className="font-mono">{entry.action}</span> par{' '}
                                                <strong>{entry.actorId}</strong>
                                            </p>
                                            <p className="text-muted-foreground text-[10px]">{fmt(entry.ts)}</p>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </TabsContent>
                    </div>
                </ScrollArea>
            </Tabs>

            <div className="border-border bg-card flex flex-wrap gap-2 border-t p-4">
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setContactOpen(true)}
                    disabled={!canContact}
                    className="gap-1.5"
                >
                    <Mail className="h-3.5 w-3.5" /> Contacter
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSuspendOpen(true)}
                    disabled={!canSuspend}
                    className="border-lumiris-rose/40 text-lumiris-rose hover:bg-lumiris-rose/10 gap-1.5"
                >
                    <PauseCircle className="h-3.5 w-3.5" /> Suspendre
                </Button>
                <Button size="sm" variant="ghost" onClick={onClose} className="ml-auto">
                    Fermer
                </Button>
            </div>

            <AlertDialog open={suspendOpen} onOpenChange={setSuspendOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Suspendre {artisan.atelierName} ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tous les passeports actifs passeront en archived côté file de curation. Action tracée.
                            Précisez la raison (obligatoire).
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Textarea
                        value={suspendReason}
                        onChange={(e) => setSuspendReason(e.target.value)}
                        placeholder="Raison de la suspension"
                        className="min-h-20"
                    />
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleSuspend}
                            disabled={suspendReason.trim().length === 0}
                            className="bg-lumiris-rose hover:bg-lumiris-rose/90"
                        >
                            Suspendre
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={contactOpen} onOpenChange={setContactOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Contacter {artisan.displayName}</AlertDialogTitle>
                        <AlertDialogDescription>
                            Le message sera envoyé par email (mock) — l&apos;action sera tracée.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Textarea
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        className="min-h-32"
                    />
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleContact}>Envoyer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="border-border bg-card rounded-xl border p-3">
            <p className="text-muted-foreground mb-1 text-[10px] uppercase tracking-wider">{label}</p>
            <div className="text-foreground">{children}</div>
        </div>
    );
}

function fmt(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export const Artisans = memo(ArtisansComponent);
