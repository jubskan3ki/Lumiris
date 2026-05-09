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
import { DetailBody } from './detail-body';

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
                                                    {user.name ?? '-'} · {user.city ?? '-'}
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
                                            <span className="text-muted-foreground/50 font-mono text-[10px]">-</span>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="text-muted-foreground text-[10px] uppercase tracking-wider">{label}</p>
            <div className="text-foreground mt-0.5">{children}</div>
        </div>
    );
}

function maskEmail(email?: string): string {
    if (!email) return '-';
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
