'use client';

import { useMemo, useState } from 'react';
import { Download, ShieldAlert, Trash2 } from 'lucide-react';
import { computeScore } from '@lumiris/core/scoring';
import { mockArtisans, mockPassportById, mockRepairers, type MockVisionUser } from '@lumiris/mock-data';
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
import { ScrollArea } from '@lumiris/ui/components/scroll-area';
import { SheetHeader, SheetTitle } from '@lumiris/ui/components/sheet';
import { Textarea } from '@lumiris/ui/components/textarea';
import { cn } from '@lumiris/ui/lib/cn';
import { useLogAction, usePermission } from '@/lib/auth';

const SCORING_NOW = new Date('2026-04-30T08:00:00Z');

function fmt(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="text-muted-foreground text-[10px] uppercase tracking-wider">{label}</p>
            <div className="text-foreground mt-0.5">{children}</div>
        </div>
    );
}

interface DetailBodyProps {
    user: MockVisionUser;
    onClose: () => void;
    lastAccessAt?: string | undefined;
}

export function DetailBody({ user, onClose, lastAccessAt }: DetailBodyProps) {
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
                    brand: artisan?.atelierName ?? '-',
                    grade: score.grade,
                    score: score.total,
                    price: passport.garment.retailPrice,
                    passportId: passport.id,
                };
            });
    }, [user]);

    const handleExport = () => {
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
                        <Field label="Email">{user.email ?? '-'}</Field>
                        <Field label="Prénom">{user.name ?? '-'}</Field>
                        <Field label="Ville">{user.city ?? '-'}</Field>
                        <Field label="Inscription">{fmt(user.createdAt)}</Field>
                        <Field label="Dernière activité">{user.lastSeenAt ? fmt(user.lastSeenAt) : '-'}</Field>
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
                                            {req.kind === 'export' ? 'Export' : 'Effacement'} - {fmt(req.requestedAt)}
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
