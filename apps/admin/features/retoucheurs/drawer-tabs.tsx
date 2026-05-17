'use client';

import { ShieldCheck, ShieldX, Star } from 'lucide-react';
import type { Repairer, RepairerSpecialty } from '@lumiris/types';
import { Badge } from '@lumiris/ui/components/badge';
import { Button } from '@lumiris/ui/components/button';
import { TabsContent } from '@lumiris/ui/components/tabs';
import { cn } from '@lumiris/ui/lib/cn';
import { useLogAction } from '@/lib/auth';
import type { RepairerOverlay } from './types';

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="text-muted-foreground text-[10px] uppercase tracking-wider">{label}</p>
            <div className="text-foreground mt-0.5">{children}</div>
        </div>
    );
}

export function ProfileTab({ retoucheur }: { retoucheur: Repairer }) {
    return (
        <TabsContent value="profile" className="m-0 space-y-3">
            <div className="border-border bg-card grid grid-cols-2 gap-3 rounded-xl border p-3">
                <Field label="Adresse">
                    {retoucheur.atelierName ?? '-'}, {retoucheur.city}
                </Field>
                <Field label="Note moyenne">
                    <span className="font-mono">
                        {retoucheur.avgRating} / 5 ({retoucheur.reviewCount} avis)
                    </span>
                </Field>
                <Field label="Délai moyen">
                    <span className="font-mono">{retoucheur.avgDelayDays} j</span>
                </Field>
                <Field label="Fourchette tarif">
                    <span className="font-mono">
                        {retoucheur.priceRange.min}–{retoucheur.priceRange.max} €
                    </span>
                </Field>
            </div>
            <Field label="Spécialités">
                <div className="flex flex-wrap gap-1.5">
                    {retoucheur.specialities.map((s) => (
                        <Badge key={s} variant="outline" className="text-[10px]">
                            {SPECIALITY_LABEL[s]}
                        </Badge>
                    ))}
                </div>
            </Field>
            <Field label="Abonnement Local">
                <Badge
                    variant="outline"
                    className={cn(
                        'font-mono text-[10px]',
                        retoucheur.localSubscribed
                            ? 'border-lumiris-emerald/40 text-lumiris-emerald'
                            : 'border-muted-foreground/40 text-muted-foreground',
                    )}
                >
                    {retoucheur.localSubscribed ? 'Abonné' : 'Non abonné'}
                </Badge>
            </Field>
        </TabsContent>
    );
}

interface KycTabProps {
    overlay: RepairerOverlay | undefined;
    canVerify: boolean;
    onOpenVerify: () => void;
    onOpenReject: () => void;
}

export function KycTab({ overlay, canVerify, onOpenVerify, onOpenReject }: KycTabProps) {
    return (
        <TabsContent value="kyc" className="m-0 space-y-3">
            <p className="text-muted-foreground">Documents joints lors de la candidature (mock) :</p>
            <ul className="border-border bg-card divide-border divide-y rounded-xl border">
                <li className="flex items-center justify-between px-3 py-2">
                    <span>Pièce d&apos;identité</span>
                    <Badge variant="outline" className="font-mono text-[10px]">
                        OK
                    </Badge>
                </li>
                <li className="flex items-center justify-between px-3 py-2">
                    <span>K-bis ou attestation CMA</span>
                    <Badge variant="outline" className="font-mono text-[10px]">
                        OK
                    </Badge>
                </li>
                <li className="flex items-center justify-between px-3 py-2">
                    <span>Photos atelier</span>
                    <Badge variant="outline" className="font-mono text-[10px]">
                        OK
                    </Badge>
                </li>
            </ul>
            {overlay?.rejectReason ? (
                <div className="border-lumiris-rose/30 bg-lumiris-rose/5 rounded-xl border p-3">
                    <p className="text-lumiris-rose font-medium">Candidature rejetée</p>
                    <p className="text-foreground mt-1">{overlay.rejectReason}</p>
                </div>
            ) : null}
            <div className="flex flex-wrap gap-2 pt-2">
                <Button
                    size="sm"
                    onClick={onOpenVerify}
                    disabled={!canVerify}
                    className="bg-lumiris-emerald hover:bg-lumiris-emerald/90 gap-1.5"
                >
                    <ShieldCheck className="h-3.5 w-3.5" /> Vérifier KYC
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onOpenReject}
                    disabled={!canVerify}
                    className="border-lumiris-rose/40 text-lumiris-rose hover:bg-lumiris-rose/10 gap-1.5"
                >
                    <ShieldX className="h-3.5 w-3.5" /> Rejeter
                </Button>
            </div>
        </TabsContent>
    );
}

interface ReviewsTabProps {
    retoucheur: Repairer;
    overlay: RepairerOverlay | undefined;
    canModerate: boolean;
    onPatchOverlay: (id: string, patch: Partial<RepairerOverlay>) => void;
}

export function ReviewsTab({ retoucheur, overlay, canModerate, onPatchOverlay }: ReviewsTabProps) {
    const log = useLogAction();
    const fakeReviews = [
        {
            id: `${retoucheur.id}-rev-1`,
            author: 'Camille B.',
            rating: 5,
            ts: '2026-04-12',
            text: 'Travail soigné, délai respecté.',
        },
        {
            id: `${retoucheur.id}-rev-2`,
            author: 'Antoine D.',
            rating: 4,
            ts: '2026-03-20',
            text: 'Bon contact, atelier sympathique.',
        },
        {
            id: `${retoucheur.id}-rev-3`,
            author: 'Anonyme',
            rating: 1,
            ts: '2026-02-04',
            text: 'Spam - texte abusif.',
        },
    ];

    return (
        <TabsContent value="reviews" className="m-0 space-y-2">
            {fakeReviews.map((rev) => {
                const hidden = overlay?.hiddenReviewIds?.includes(rev.id);
                return (
                    <div
                        key={rev.id}
                        className={cn('border-border bg-card rounded-xl border p-3', hidden && 'opacity-50')}
                    >
                        <div className="flex items-baseline justify-between">
                            <p className="text-foreground font-medium">{rev.author}</p>
                            <span className="font-mono text-[10px]">
                                <Star className="text-lumiris-amber inline h-3 w-3 fill-current" /> {rev.rating}/5 ·{' '}
                                {rev.ts}
                            </span>
                        </div>
                        <p className="text-foreground mt-1.5">{rev.text}</p>
                        {hidden ? (
                            <p className="text-muted-foreground mt-1 italic">Review masquée.</p>
                        ) : (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    onPatchOverlay(retoucheur.id, {
                                        hiddenReviewIds: [...(overlay?.hiddenReviewIds ?? []), rev.id],
                                    });
                                    log({
                                        action: 'retoucheur.review_moderate',
                                        targetType: 'repairer',
                                        targetId: retoucheur.id,
                                        payload: { reviewId: rev.id, decision: 'hidden' },
                                    });
                                }}
                                disabled={!canModerate}
                                className="text-lumiris-rose mt-2 h-7 text-[11px]"
                            >
                                Masquer
                            </Button>
                        )}
                    </div>
                );
            })}
        </TabsContent>
    );
}

export function ActivityTab() {
    return (
        <TabsContent value="activity" className="m-0">
            <p className="text-muted-foreground italic">
                RDV récents (mock) - alimentés par les events repair_booking.
            </p>
            <ul className="border-border bg-card divide-border mt-2 divide-y rounded-xl border">
                <li className="flex items-baseline justify-between px-3 py-2">
                    <span>RDV avec Anaïs · ourlet jean</span>
                    <span className="font-mono text-[10px]">2026-04-22</span>
                </li>
                <li className="flex items-baseline justify-between px-3 py-2">
                    <span>RDV avec Hugo · ressemelage</span>
                    <span className="font-mono text-[10px]">2026-04-15</span>
                </li>
            </ul>
        </TabsContent>
    );
}
