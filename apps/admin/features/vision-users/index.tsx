'use client';

import { memo, useMemo, useState } from 'react';
import { Download, ScanLine, Search, ShieldAlert, Trash2 } from 'lucide-react';
import { computeScore } from '@lumiris/core/scoring';
import {
    mockArtisans,
    mockPassportById,
    mockRepairers,
    mockVisionUsers,
    type MockVisionUser,
} from '@lumiris/mock-data';
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
import { Avatar, AvatarFallback } from '@lumiris/ui/components/avatar';
import { Badge } from '@lumiris/ui/components/badge';
import { Button } from '@lumiris/ui/components/button';
import { Input } from '@lumiris/ui/components/input';
import { ScrollArea } from '@lumiris/ui/components/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@lumiris/ui/components/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@lumiris/ui/components/table';
import { Textarea } from '@lumiris/ui/components/textarea';
import { cn } from '@lumiris/ui/lib/cn';
import { RequirePermission, useAdminAuditLog, useLogAction, usePermission } from '@/lib/auth';

const SCORING_NOW = new Date('2026-04-30T08:00:00Z');

function VisionUsersComponent() {
    return (
        <div className="space-y-5">
            <Header />
            <KpiPanel />
            <RequirePermission action="vision_user.read">
                <UserList />
            </RequirePermission>
        </div>
    );
}

function Header() {
    return (
        <div>
            <h2 className="text-foreground text-xl font-semibold">Vision Users</h2>
            <p className="text-muted-foreground mt-1 text-sm">
                Vue agrégée toujours visible · liste détaillée gated sur{' '}
                <code className="font-mono">vision_user.read</code>. Anonymes jamais listés individuellement.
            </p>
        </div>
    );
}

function KpiPanel() {
    const kpis = useMemo(() => {
        const total = mockVisionUsers.length;
        const withAccount = mockVisionUsers.filter((u) => !u.anon).length;
        const withAccountShare = total === 0 ? 0 : (withAccount / total) * 100;
        const wardrobeAvg =
            withAccount === 0
                ? 0
                : mockVisionUsers.filter((u) => !u.anon).reduce((sum, u) => sum + u.wardrobePassportIds.length, 0) /
                  withAccount;
        const consentAffiliation = mockVisionUsers.filter((u) => !u.anon && u.consentAffiliation).length;
        const rgpdPending = mockVisionUsers.reduce(
            (sum, u) => sum + (u.rgpdRequests?.filter((r) => r.status === 'pending').length ?? 0),
            0,
        );

        const brandCounts: Record<string, number> = {};
        mockVisionUsers.forEach((u) => {
            u.wardrobePassportIds.forEach((id) => {
                const passport = mockPassportById(id);
                if (!passport) return;
                const artisan = mockArtisans.find((a) => a.id === passport.artisanId);
                if (!artisan) return;
                brandCounts[artisan.atelierName] = (brandCounts[artisan.atelierName] ?? 0) + 1;
            });
        });
        const topBrands = Object.entries(brandCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        return {
            mau: total,
            withAccount,
            withAccountShare,
            wardrobeAvg,
            consentAffiliation,
            rgpdPending,
            topBrands,
        };
    }, []);

    const tiles = [
        { label: 'MAU', value: kpis.mau.toString(), tone: 'text-lumiris-cyan' },
        {
            label: 'Avec compte',
            value: `${kpis.withAccount}`,
            sub: `${kpis.withAccountShare.toFixed(0)}%`,
            tone: 'text-lumiris-emerald',
        },
        {
            label: 'Garde-robe moyenne',
            value: kpis.wardrobeAvg.toFixed(1),
            tone: 'text-lumiris-amber',
        },
        {
            label: 'Consent affiliation',
            value: `${kpis.consentAffiliation}`,
            tone: 'text-lumiris-emerald',
        },
        {
            label: 'RGPD en cours',
            value: kpis.rgpdPending.toString(),
            tone: 'text-lumiris-rose',
        },
    ];

    return (
        <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                {tiles.map((t) => (
                    <div key={t.label} className="border-border bg-card flex flex-col rounded-xl border p-4">
                        <p className="text-muted-foreground text-[10px] uppercase tracking-wider">{t.label}</p>
                        <p className={cn('mt-1 font-mono text-2xl font-bold', t.tone)}>{t.value}</p>
                        {t.sub ? <p className="text-muted-foreground mt-0.5 text-[10px]">{t.sub}</p> : null}
                    </div>
                ))}
            </div>

            <div className="border-border bg-card rounded-xl border p-4">
                <p className="text-muted-foreground inline-flex items-center gap-1 text-[10px] uppercase tracking-wider">
                    <ScanLine className="h-3 w-3" /> Top scans (sans userId)
                </p>
                <ul className="mt-2 grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
                    {kpis.topBrands.map(([brand, count]) => (
                        <li
                            key={brand}
                            className="bg-muted/30 flex items-baseline justify-between rounded-md px-2 py-1"
                        >
                            <span className="text-foreground truncate">{brand}</span>
                            <span className="font-mono">{count}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}

function UserList() {
    const auditLog = useAdminAuditLog();
    const log = useLogAction();
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<MockVisionUser | null>(null);
    const [reasonModalOpen, setReasonModalOpen] = useState(false);
    const [pendingUser, setPendingUser] = useState<MockVisionUser | null>(null);
    const [readReason, setReadReason] = useState('');

    const accountUsers = useMemo(() => mockVisionUsers.filter((u) => !u.anon), []);
    const filtered = useMemo(() => {
        if (search.trim().length === 0) return accountUsers;
        const needle = search.toLowerCase();
        return accountUsers.filter(
            (u) =>
                u.email?.toLowerCase().includes(needle) ||
                u.name?.toLowerCase().includes(needle) ||
                u.id.toLowerCase().includes(needle),
        );
    }, [accountUsers, search]);

    const requestRead = (user: MockVisionUser) => {
        setPendingUser(user);
        setReasonModalOpen(true);
    };

    const confirmRead = () => {
        if (!pendingUser || readReason.trim().length === 0) return;
        log({
            action: 'vision_user.read',
            targetType: 'vision_user',
            targetId: pendingUser.id,
            payload: { reason: readReason },
        });
        setSelected(pendingUser);
        setPendingUser(null);
        setReadReason('');
        setReasonModalOpen(false);
    };

    const lastAccessByUser = useMemo(() => {
        const map = new Map<string, string>();
        for (const entry of auditLog) {
            if (entry.action !== 'vision_user.read') continue;
            const prev = map.get(entry.targetId);
            if (!prev || entry.ts > prev) map.set(entry.targetId, entry.ts);
        }
        return map;
    }, [auditLog]);

    return (
        <div className="space-y-3">
            <div className="border-border bg-card flex flex-wrap items-center gap-2 rounded-xl border p-3">
                <div className="min-w-55 relative flex-1">
                    <Search className="text-muted-foreground/60 absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Email, prénom, ID…"
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="border-border bg-card overflow-hidden rounded-xl border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Inscription</TableHead>
                            <TableHead>Garde-robe</TableHead>
                            <TableHead>Consents</TableHead>
                            <TableHead>RGPD</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((user) => {
                            const rgpdPending = user.rgpdRequests?.some((r) => r.status === 'pending');
                            return (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="text-[10px]">
                                                    {user.name?.slice(0, 2).toUpperCase() ?? 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-foreground text-xs">{maskEmail(user.email)}</p>
                                                <p className="text-muted-foreground text-[10px]">
                                                    {user.name ?? '—'} · {user.city ?? '—'}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-mono text-[11px]">{fmt(user.createdAt)}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-mono text-xs">{user.wardrobePassportIds.length}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {user.consentAffiliation ? (
                                                <Badge
                                                    variant="outline"
                                                    className="border-lumiris-emerald/40 text-lumiris-emerald font-mono text-[10px]"
                                                >
                                                    affil
                                                </Badge>
                                            ) : null}
                                            {user.consentNewsletter ? (
                                                <Badge
                                                    variant="outline"
                                                    className="border-lumiris-cyan/40 text-lumiris-cyan font-mono text-[10px]"
                                                >
                                                    news
                                                </Badge>
                                            ) : null}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {rgpdPending ? (
                                            <Badge
                                                variant="outline"
                                                className="border-lumiris-rose/40 bg-lumiris-rose/10 text-lumiris-rose gap-1 font-mono text-[10px]"
                                            >
                                                <ShieldAlert className="h-3 w-3" /> pending
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground/50 font-mono text-[10px]">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => requestRead(user)}
                                            className="gap-1.5"
                                        >
                                            Ouvrir
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <UserDetail
                user={selected}
                onClose={() => setSelected(null)}
                lastAccessAt={selected ? lastAccessByUser.get(selected.id) : undefined}
            />

            <AlertDialog
                open={reasonModalOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setPendingUser(null);
                        setReadReason('');
                    }
                    setReasonModalOpen(open);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Justification d&apos;accès</AlertDialogTitle>
                        <AlertDialogDescription>
                            L&apos;ouverture d&apos;une fiche user est tracée avec le motif. Précisez pourquoi vous
                            accédez aux données personnelles de <strong>{maskEmail(pendingUser?.email)}</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Textarea
                        value={readReason}
                        onChange={(e) => setReadReason(e.target.value)}
                        placeholder="Exemple : demande support · ticket #4231"
                        className="min-h-20"
                    />
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmRead} disabled={readReason.trim().length === 0}>
                            Justifier et ouvrir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function UserDetail({
    user,
    onClose,
    lastAccessAt,
}: {
    user: MockVisionUser | null;
    onClose: () => void;
    lastAccessAt?: string | undefined;
}) {
    return (
        <Sheet open={user !== null} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="bg-background w-full overflow-hidden p-0 sm:max-w-2xl">
                {user ? <DetailBody user={user} onClose={onClose} lastAccessAt={lastAccessAt} /> : null}
            </SheetContent>
        </Sheet>
    );
}

function DetailBody({
    user,
    onClose,
    lastAccessAt,
}: {
    user: MockVisionUser;
    onClose: () => void;
    lastAccessAt?: string | undefined;
}) {
    const log = useLogAction();
    const canExport = usePermission('vision_user.export_rgpd');
    const canErase = usePermission('vision_user.erase_rgpd');
    const [eraseOpen, setEraseOpen] = useState(false);
    const [eraseConfirm, setEraseConfirm] = useState('');
    const [erased, setErased] = useState(user.erased ?? false);

    const wardrobeItems: WardrobeCardItem[] = useMemo(() => {
        return user.wardrobePassportIds
            .map((id) => mockPassportById(id))
            .filter((p): p is NonNullable<typeof p> => !!p)
            .map((passport) => {
                const artisan = mockArtisans.find((a) => a.id === passport.artisanId);
                const score = computeScore(passport, {
                    certificates: passport.materials.flatMap((m) => m.certifications),
                    ...(artisan ? { artisan } : {}),
                    retoucheurs: mockRepairers,
                    now: SCORING_NOW,
                });
                return {
                    id: passport.id,
                    name: passport.garment.reference,
                    brand: artisan?.atelierName ?? '—',
                    grade: score.grade,
                    score: score.total,
                    price: passport.garment.retailPrice,
                    passportId: passport.id,
                };
            });
    }, [user]);

    const handleExport = () => {
        // mock — fabriquer un blob JSON, hash via JSON length pour la traçabilité.
        const data = JSON.stringify(user, null, 2);
        const hash = `len-${data.length}`;
        log({
            action: 'vision_user.export_rgpd',
            targetType: 'vision_user',
            targetId: user.id,
            payload: { hash, format: 'json' },
        });
        if (typeof window !== 'undefined') {
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lumiris-rgpd-${user.id}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const handleErase = () => {
        if (!user.email || eraseConfirm.trim() !== user.email) return;
        log({
            action: 'vision_user.erase_rgpd',
            targetType: 'vision_user',
            targetId: user.id,
            payload: { email_at_erasure: user.email },
        });
        setErased(true);
        setEraseOpen(false);
    };

    return (
        <div className="flex h-full flex-col">
            <SheetHeader className="border-border border-b p-5">
                <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                        <AvatarFallback>{user.name?.slice(0, 2).toUpperCase() ?? 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <SheetTitle className="truncate">{user.name ?? user.id}</SheetTitle>
                        <p className="text-muted-foreground truncate text-xs">
                            {erased ? '(profil anonymisé)' : user.email}
                        </p>
                    </div>
                    {erased ? (
                        <Badge
                            variant="outline"
                            className="border-lumiris-rose/40 bg-lumiris-rose/10 text-lumiris-rose font-mono text-[10px]"
                        >
                            anonymisé
                        </Badge>
                    ) : null}
                </div>
                {lastAccessAt ? (
                    <p className="text-muted-foreground mt-1 inline-flex items-center gap-1 font-mono text-[10px]">
                        <ShieldAlert className="h-3 w-3" /> Dernier accès admin :{' '}
                        {new Date(lastAccessAt).toLocaleString('fr-FR')}
                    </p>
                ) : null}
            </SheetHeader>

            <ScrollArea className="flex-1">
                <div className="space-y-4 p-5 text-xs">
                    <section className="border-border bg-card grid grid-cols-2 gap-3 rounded-xl border p-3">
                        <Field label="Email">{user.email ?? '—'}</Field>
                        <Field label="Prénom">{user.name ?? '—'}</Field>
                        <Field label="Ville">{user.city ?? '—'}</Field>
                        <Field label="Inscription">{fmt(user.createdAt)}</Field>
                        <Field label="Dernière activité">{user.lastSeenAt ? fmt(user.lastSeenAt) : '—'}</Field>
                        <Field label="Scans">
                            <span className="font-mono">{user.scansCount}</span>
                        </Field>
                    </section>

                    <section>
                        <h3 className="text-foreground mb-2 text-sm font-semibold">Garde-robe</h3>
                        {wardrobeItems.length === 0 ? (
                            <p className="text-muted-foreground italic">Garde-robe vide.</p>
                        ) : (
                            <Wardrobe items={wardrobeItems} density="cozy" />
                        )}
                    </section>

                    <section className="border-lumiris-rose/30 bg-lumiris-rose/5 space-y-3 rounded-xl border p-4">
                        <h3 className="text-lumiris-rose inline-flex items-center gap-1 text-sm font-semibold">
                            <ShieldAlert className="h-4 w-4" /> RGPD
                        </h3>
                        <p className="text-foreground">
                            Les actions ci-dessous sont tracées et engagent la plateforme.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleExport}
                                disabled={!canExport || erased}
                                className="gap-1.5"
                            >
                                <Download className="h-3.5 w-3.5" /> Export RGPD
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEraseOpen(true)}
                                disabled={!canErase || erased}
                                className="border-lumiris-rose/40 text-lumiris-rose hover:bg-lumiris-rose/10 gap-1.5"
                            >
                                <Trash2 className="h-3.5 w-3.5" /> Effacement RGPD
                            </Button>
                        </div>
                        {user.rgpdRequests && user.rgpdRequests.length > 0 ? (
                            <ul className="border-border bg-background divide-border divide-y rounded-xl border">
                                {user.rgpdRequests.map((req, i) => (
                                    <li key={i} className="flex items-baseline justify-between px-3 py-2">
                                        <span>
                                            {req.kind === 'export' ? 'Export' : 'Effacement'} — {fmt(req.requestedAt)}
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                'font-mono text-[10px]',
                                                req.status === 'pending'
                                                    ? 'border-lumiris-amber/40 text-lumiris-amber'
                                                    : 'border-lumiris-emerald/40 text-lumiris-emerald',
                                            )}
                                        >
                                            {req.status}
                                        </Badge>
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </section>
                </div>
            </ScrollArea>

            <div className="border-border bg-card flex justify-end gap-2 border-t p-4">
                <Button size="sm" variant="ghost" onClick={onClose}>
                    Fermer
                </Button>
            </div>

            <AlertDialog open={eraseOpen} onOpenChange={setEraseOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lumiris-rose">Effacement RGPD irréversible</AlertDialogTitle>
                        <AlertDialogDescription>
                            Toutes les données personnelles de cet utilisateur seront anonymisées en base. Pour
                            confirmer, saisissez son email exact :{' '}
                            <code className="bg-muted text-foreground rounded px-1 font-mono text-[11px]">
                                {user.email}
                            </code>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Textarea
                        value={eraseConfirm}
                        onChange={(e) => setEraseConfirm(e.target.value)}
                        placeholder="email@exemple.com"
                        className="min-h-12"
                    />
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleErase}
                            disabled={eraseConfirm.trim() !== user.email}
                            className="bg-lumiris-rose hover:bg-lumiris-rose/90"
                        >
                            Effacer définitivement
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="text-muted-foreground text-[10px] uppercase tracking-wider">{label}</p>
            <div className="text-foreground mt-0.5">{children}</div>
        </div>
    );
}

function maskEmail(email?: string): string {
    if (!email) return '—';
    const [user, domain] = email.split('@');
    if (!user || !domain) return email;
    const masked = user.length <= 2 ? `${user[0]}*` : `${user[0]}***${user[user.length - 1]}`;
    return `${masked}@${domain}`;
}

function fmt(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export const VisionUsers = memo(VisionUsersComponent);
