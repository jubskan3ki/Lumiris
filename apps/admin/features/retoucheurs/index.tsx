'use client';

import { memo, useMemo, useState } from 'react';
import { Filter, MapPin, Search, Star } from 'lucide-react';
import { mockRepairers } from '@lumiris/mock-data';
import type { Repairer, RepairerSpecialty } from '@lumiris/types';
import { ActivityTab, KycTab, ProfileTab, ReviewsTab } from './drawer-tabs';
import type { CandidatureStatus, RepairerOverlay } from './types';
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
import { Avatar, AvatarFallback } from '@lumiris/ui/components/avatar';
import { Badge } from '@lumiris/ui/components/badge';
import { Button } from '@lumiris/ui/components/button';
import { Input } from '@lumiris/ui/components/input';
import { ScrollArea } from '@lumiris/ui/components/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@lumiris/ui/components/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@lumiris/ui/components/sheet';
import { Slider } from '@lumiris/ui/components/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@lumiris/ui/components/tabs';
import { Textarea } from '@lumiris/ui/components/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@lumiris/ui/components/table';
import { cn } from '@lumiris/ui/lib/cn';
import { RequirePermission, useLogAction, usePermission } from '@/lib/auth';

// Mock candidatures locales - pas dans les types canoniques. On enrichit Repairer avec un overlay
// `candidatureStatus` géré en mémoire, comme pour les passeports.

const SPECIALITY_LABEL: Record<RepairerSpecialty, string> = {
    alteration: 'Retouche',
    embroidery: 'Broderie',
    'shoe-repair': 'Cordonnerie',
    leather: 'Cuir',
    lining: 'Doublure',
    'electronics-repair': 'Électronique',
    'phone-repair': 'Téléphonie',
    'computer-repair': 'Informatique',
    cabinetmaking: 'Ébénisterie',
    upholstery: 'Tapisserie',
    'appliance-repair': 'Électroménager',
};

function RepairersComponent() {
    return (
        <RequirePermission action="retoucheur.read">
            <RepairersInner />
        </RequirePermission>
    );
}

function RepairersInner() {
    const [overlays, setOverlays] = useState<Map<string, RepairerOverlay>>(() => new Map());
    const [search, setSearch] = useState('');
    const [cityFilter, setCityFilter] = useState<string>('all');
    const [specialityFilter, setSpecialityFilter] = useState<RepairerSpecialty | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<CandidatureStatus | 'all'>('all');
    const [minRating, setMinRating] = useState(0);
    const [selected, setSelected] = useState<Repairer | null>(null);

    const cities = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const r of mockRepairers) {
            counts[r.city] = (counts[r.city] ?? 0) + 1;
        }
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, []);

    const filtered = useMemo(() => {
        return mockRepairers.filter((r) => {
            if (cityFilter !== 'all' && r.city !== cityFilter) return false;
            if (specialityFilter !== 'all' && !r.specialities.includes(specialityFilter)) return false;
            const status = overlays.get(r.id)?.candidatureStatus ?? 'verified';
            if (statusFilter !== 'all' && status !== statusFilter) return false;
            if (r.avgRating < minRating) return false;
            if (search.trim().length > 0) {
                const needle = search.toLowerCase();
                const haystack = `${r.displayName} ${r.atelierName ?? ''} ${r.city}`.toLowerCase();
                if (!haystack.includes(needle)) return false;
            }
            return true;
        });
    }, [overlays, search, cityFilter, specialityFilter, statusFilter, minRating]);

    const pendingCount = useMemo(
        () => mockRepairers.filter((r) => (overlays.get(r.id)?.candidatureStatus ?? 'verified') === 'pending').length,
        [overlays],
    );

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-foreground text-xl font-semibold">Repairers (LUMIRIS Local)</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                    {mockRepairers.length} retoucheurs référencés -{' '}
                    {mockRepairers.filter((r) => r.localSubscribed).length} abonnés Local.
                </p>
            </div>

            {pendingCount > 5 ? (
                <div className="border-lumiris-amber/30 bg-lumiris-amber/5 text-lumiris-amber rounded-xl border px-3 py-2 text-xs">
                    <strong>{pendingCount} candidatures à vérifier.</strong> Filtrer
                    <code className="bg-muted text-foreground mx-1 rounded px-1 py-0.5">candidatureStatus=pending</code>
                    pour traiter en lot.
                </div>
            ) : null}

            <CityHeatmap cities={cities} active={cityFilter} onSelect={setCityFilter} />

            <div className="border-border bg-card flex flex-wrap items-center gap-2 rounded-xl border p-3">
                <div className="min-w-55 relative flex-1">
                    <Search className="text-muted-foreground/60 absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Nom, atelier, ville…"
                        className="pl-8"
                    />
                </div>
                <Select
                    value={specialityFilter}
                    onValueChange={(v) => setSpecialityFilter(v as RepairerSpecialty | 'all')}
                >
                    <SelectTrigger className="w-40">
                        <Filter className="mr-1 h-3.5 w-3.5" /> <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes spécialités</SelectItem>
                        {Object.entries(SPECIALITY_LABEL).map(([k, v]) => (
                            <SelectItem key={k} value={k}>
                                {v}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CandidatureStatus | 'all')}>
                    <SelectTrigger className="w-45">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous statuts KYC</SelectItem>
                        <SelectItem value="pending">À vérifier</SelectItem>
                        <SelectItem value="verified">Vérifié</SelectItem>
                        <SelectItem value="rejected">Rejeté</SelectItem>
                    </SelectContent>
                </Select>
                <div className="min-w-55 flex flex-1 items-center gap-2">
                    <span className="text-muted-foreground shrink-0 font-mono text-[10px]">
                        Note min. {minRating.toFixed(1)}
                    </span>
                    <Slider
                        value={[minRating]}
                        max={5}
                        step={0.1}
                        onValueChange={(v) => setMinRating(v[0] ?? 0)}
                        className="flex-1"
                    />
                </div>
            </div>

            <RepairerTable rows={filtered} overlays={overlays} onSelect={setSelected} />

            <RepairerDrawer
                retoucheur={selected}
                overlay={selected ? overlays.get(selected.id) : undefined}
                onClose={() => setSelected(null)}
                onPatchOverlay={(id, patch) =>
                    setOverlays((prev) => {
                        const next = new Map(prev);
                        next.set(id, { ...(next.get(id) ?? {}), ...patch });
                        return next;
                    })
                }
            />
        </div>
    );
}

function CityHeatmap({
    cities,
    active,
    onSelect,
}: {
    cities: ReadonlyArray<[string, number]>;
    active: string;
    onSelect: (city: string) => void;
}) {
    return (
        <div className="border-border bg-card rounded-xl border p-3">
            <p className="text-muted-foreground mb-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider">
                <MapPin className="h-3 w-3" /> Implantations
            </p>
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => onSelect('all')}
                    className={cn(
                        'rounded-full border px-2 py-1 font-mono text-[11px]',
                        active === 'all'
                            ? 'border-lumiris-emerald/40 bg-lumiris-emerald/10 text-lumiris-emerald'
                            : 'border-border text-muted-foreground hover:border-lumiris-emerald/40',
                    )}
                >
                    Toutes les villes
                </button>
                {cities.map(([city, count]) => (
                    <button
                        key={city}
                        type="button"
                        onClick={() => onSelect(city)}
                        className={cn(
                            'inline-flex items-center gap-1 rounded-full border px-2 py-1 font-mono text-[11px]',
                            active === city
                                ? 'border-lumiris-emerald/40 bg-lumiris-emerald/10 text-lumiris-emerald'
                                : 'border-border text-muted-foreground hover:border-lumiris-emerald/40',
                        )}
                    >
                        <MapPin className="h-2.5 w-2.5" /> {city}
                        <span className="text-muted-foreground/60">·{count}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

function RepairerTable({
    rows,
    overlays,
    onSelect,
}: {
    rows: readonly Repairer[];
    overlays: Map<string, RepairerOverlay>;
    onSelect: (r: Repairer) => void;
}) {
    if (rows.length === 0) {
        return (
            <div className="border-border bg-card text-muted-foreground rounded-xl border p-12 text-center text-sm">
                Aucun retoucheur ne correspond aux filtres.
            </div>
        );
    }
    return (
        <div className="border-border bg-card overflow-hidden rounded-xl border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Repairer</TableHead>
                        <TableHead>Spécialités</TableHead>
                        <TableHead>Note</TableHead>
                        <TableHead>Délai</TableHead>
                        <TableHead>Tarif</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((r) => {
                        const status = overlays.get(r.id)?.candidatureStatus ?? 'verified';
                        return (
                            <TableRow key={r.id} className="cursor-pointer" onClick={() => onSelect(r)}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-[10px]">
                                                {r.displayName.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-foreground text-sm">{r.displayName}</p>
                                            <p className="text-muted-foreground text-[10px]">
                                                {r.atelierName ?? ''} · {r.city}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {r.specialities.map((s) => (
                                            <Badge key={s} variant="outline" className="text-[10px]">
                                                {SPECIALITY_LABEL[s]}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 font-mono text-xs">
                                        <Star className="text-lumiris-amber h-3 w-3 fill-current" />
                                        {r.avgRating.toFixed(1)}
                                        <span className="text-muted-foreground">({r.reviewCount})</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="font-mono text-xs">{r.avgDelayDays} j</span>
                                </TableCell>
                                <TableCell>
                                    <span className="font-mono text-xs">
                                        {r.priceRange.min}–{r.priceRange.max} €
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <CandidatureBadge status={status} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelect(r);
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

function CandidatureBadge({ status }: { status: CandidatureStatus }) {
    const tone =
        status === 'verified'
            ? 'border-lumiris-emerald/40 bg-lumiris-emerald/10 text-lumiris-emerald'
            : status === 'pending'
              ? 'border-lumiris-amber/40 bg-lumiris-amber/10 text-lumiris-amber'
              : 'border-lumiris-rose/40 bg-lumiris-rose/10 text-lumiris-rose';
    return (
        <Badge variant="outline" className={cn('font-mono text-[10px]', tone)}>
            {status}
        </Badge>
    );
}

interface RepairerDrawerProps {
    retoucheur: Repairer | null;
    overlay: RepairerOverlay | undefined;
    onClose: () => void;
    onPatchOverlay: (id: string, patch: Partial<RepairerOverlay>) => void;
}

function RepairerDrawer({ retoucheur, overlay, onClose, onPatchOverlay }: RepairerDrawerProps) {
    return (
        <Sheet open={retoucheur !== null} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="bg-background w-full overflow-hidden p-0 sm:max-w-2xl">
                {retoucheur ? (
                    <DrawerBody
                        retoucheur={retoucheur}
                        overlay={overlay}
                        onClose={onClose}
                        onPatchOverlay={onPatchOverlay}
                    />
                ) : null}
            </SheetContent>
        </Sheet>
    );
}

function DrawerBody({
    retoucheur,
    overlay,
    onClose,
    onPatchOverlay,
}: {
    retoucheur: Repairer;
    overlay: RepairerOverlay | undefined;
    onClose: () => void;
    onPatchOverlay: (id: string, patch: Partial<RepairerOverlay>) => void;
}) {
    const log = useLogAction();
    const canVerify = usePermission('retoucheur.verify_kyc');
    const canModerate = usePermission('retoucheur.review_moderate');
    const status = overlay?.candidatureStatus ?? 'verified';

    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [verifyOpen, setVerifyOpen] = useState(false);

    const handleVerify = () => {
        onPatchOverlay(retoucheur.id, { candidatureStatus: 'verified' });
        log({
            action: 'retoucheur.verify_kyc',
            targetType: 'repairer',
            targetId: retoucheur.id,
            payload: { decision: 'verified' },
        });
        setVerifyOpen(false);
    };

    const handleReject = () => {
        if (rejectReason.trim().length === 0) return;
        onPatchOverlay(retoucheur.id, {
            candidatureStatus: 'rejected',
            rejectReason,
        });
        log({
            action: 'retoucheur.verify_kyc',
            targetType: 'repairer',
            targetId: retoucheur.id,
            payload: { decision: 'rejected', reason: rejectReason },
        });
        setRejectReason('');
        setRejectOpen(false);
    };

    return (
        <div className="flex h-full flex-col">
            <SheetHeader className="border-border border-b p-5">
                <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                        <AvatarFallback>{retoucheur.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <SheetTitle className="truncate">{retoucheur.displayName}</SheetTitle>
                        <p className="text-muted-foreground truncate text-xs">
                            {retoucheur.atelierName ?? ''} · {retoucheur.city}
                        </p>
                    </div>
                    <CandidatureBadge status={status} />
                </div>
            </SheetHeader>

            <Tabs defaultValue="profile" className="flex flex-1 flex-col overflow-hidden">
                <TabsList className="border-border w-full justify-start gap-1 rounded-none border-b bg-transparent px-3">
                    <TabsTrigger value="profile">Profil</TabsTrigger>
                    <TabsTrigger value="kyc">KYC</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    <TabsTrigger value="activity">Activité</TabsTrigger>
                </TabsList>
                <ScrollArea className="flex-1">
                    <div className="space-y-3 p-5 text-xs">
                        <ProfileTab retoucheur={retoucheur} />
                        <KycTab
                            overlay={overlay}
                            canVerify={canVerify}
                            onOpenVerify={() => setVerifyOpen(true)}
                            onOpenReject={() => setRejectOpen(true)}
                        />
                        <ReviewsTab
                            retoucheur={retoucheur}
                            overlay={overlay}
                            canModerate={canModerate}
                            onPatchOverlay={onPatchOverlay}
                        />
                        <ActivityTab />
                    </div>
                </ScrollArea>
            </Tabs>

            <div className="border-border bg-card flex justify-end gap-2 border-t p-4">
                <Button size="sm" variant="ghost" onClick={onClose}>
                    Fermer
                </Button>
            </div>

            <AlertDialog open={verifyOpen} onOpenChange={setVerifyOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Vérifier le KYC ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Le retoucheur passera en <strong>verified</strong> et apparaîtra sur la carte consumer.
                            Action tracée.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleVerify}
                            className="bg-lumiris-emerald hover:bg-lumiris-emerald/90"
                        >
                            Confirmer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Rejeter la candidature ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Précisez la raison (obligatoire). Le retoucheur sera notifié et l&apos;action tracée.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Raison du rejet"
                        className="min-h-20"
                    />
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReject}
                            disabled={rejectReason.trim().length === 0}
                            className="bg-lumiris-rose hover:bg-lumiris-rose/90"
                        >
                            Rejeter
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export const Repairers = memo(RepairersComponent);
