'use client';

import { useMemo, useState } from 'react';
import { Award, Mail, PauseCircle } from 'lucide-react';
import { computeScore } from '@lumiris/core/scoring';
import { mockAdminAuditLog, mockPassports, mockRepairers } from '@lumiris/mock-data';
import { type Artisan } from '@lumiris/types';
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
import { ScrollArea } from '@lumiris/ui/components/scroll-area';
import { SheetHeader, SheetTitle } from '@lumiris/ui/components/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@lumiris/ui/components/tabs';
import { Textarea } from '@lumiris/ui/components/textarea';
import { useAdminAuditLog, useLogAction, usePermission } from '@/lib/auth';
import { PLUS_ADDON, TIER_MRR } from '@/lib/artisan-analytics';

const SCORING_NOW = new Date('2026-04-30T08:00:00Z');

function InfoCard({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="border-border bg-card rounded-xl border p-3">
            <p className="text-muted-foreground mb-1 text-[10px] uppercase tracking-wider">{label}</p>
            <div className="text-foreground">{children}</div>
        </div>
    );
}

function fmtDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function ArtisanDrawerBody({ artisan, onClose }: { artisan: Artisan; onClose: () => void }) {
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
                            <InfoCard label="SIRET (vérification CMA mockée)">
                                <p className="font-mono text-[11px]">FR-{artisan.id.toUpperCase()}-PROXY</p>
                            </InfoCard>
                            <InfoCard label="Atelier">
                                <p>
                                    {artisan.atelierName} - {artisan.city}, {artisan.region}
                                </p>
                            </InfoCard>
                            <InfoCard label="Spécialités">
                                <ul className="flex flex-wrap gap-1.5">
                                    {artisan.specialities.map((s) => (
                                        <Badge key={s} variant="outline" className="text-[10px]">
                                            {s}
                                        </Badge>
                                    ))}
                                </ul>
                            </InfoCard>
                            <InfoCard label="Labels">
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
                            </InfoCard>
                            <InfoCard label="Bio">
                                <p>{artisan.story}</p>
                            </InfoCard>
                        </TabsContent>

                        <TabsContent value="passports" className="m-0">
                            {wardrobeItems.length === 0 ? (
                                <p className="text-muted-foreground text-xs italic">Aucun passeport publié.</p>
                            ) : (
                                <Wardrobe items={wardrobeItems} density="cozy" />
                            )}
                        </TabsContent>

                        <TabsContent value="subscription" className="m-0 space-y-3 text-xs">
                            <InfoCard label="Plan actif">
                                <div className="flex items-baseline justify-between">
                                    <p className="text-foreground font-medium">
                                        ATELIER {artisan.tier}{' '}
                                        {artisan.plus ? <span className="text-lumiris-cyan">+ ATELIER+</span> : null}
                                    </p>
                                    <p className="font-mono">
                                        {TIER_MRR[artisan.tier] + (artisan.plus ? PLUS_ADDON : 0)} €/mois
                                    </p>
                                </div>
                            </InfoCard>
                            <InfoCard label="Méthode de paiement (mock)">
                                <p className="font-mono text-[11px]">Visa · last4 4242 · expire 12/29</p>
                            </InfoCard>
                            <InfoCard label="Prochain prélèvement">
                                <p className="font-mono text-[11px]">2026-05-15</p>
                            </InfoCard>
                            <InfoCard label="Historique tier">
                                <ol className="relative space-y-2 border-l border-dashed pl-4">
                                    <li>
                                        <span className="bg-foreground -left-1.25 absolute mt-1 block h-2 w-2 rounded-full" />
                                        <p>
                                            {fmtDate(artisan.joinedAt)} - création compte ({artisan.tier})
                                        </p>
                                    </li>
                                </ol>
                            </InfoCard>
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
                                            <p className="text-muted-foreground text-[10px]">{fmtDate(entry.ts)}</p>
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
                            Le message sera envoyé par email (mock) - l&apos;action sera tracée.
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
