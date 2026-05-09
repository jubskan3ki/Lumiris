'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { computeScore } from '@lumiris/core/scoring';
import { mockCertificates, mockPassportById } from '@lumiris/mock-data';
import {
    IrisGrade,
    MissingFieldsBadge,
    ScoreBreakdown,
    ScoreCapWarning,
    ScoreReasonsList,
    AtelierStatusBadge,
} from '@lumiris/scoring-ui';
import { Button } from '@lumiris/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@lumiris/ui/components/card';
import { currentArtisan } from '@/lib/current-artisan';
import { draftToPassport, useDraftStore } from '@/lib/draft-store';

export function PassportDetail({ passportId }: { passportId: string }) {
    const draft = useDraftStore((s) => s.drafts[passportId]);
    const fixed = useMemo(() => mockPassportById(passportId), [passportId]);
    const passport = useMemo(() => (draft ? draftToPassport(draft) : (fixed ?? null)), [draft, fixed]);

    if (!passport) {
        return (
            <div className="p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Passeport introuvable</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline">
                            <Link href="/passports">
                                <ArrowLeft className="mr-1.5 h-4 w-4" /> Retour à la liste
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const score = computeScore(passport, {
        artisan: currentArtisan,
        certificates: mockCertificates,
        now: new Date(),
    });

    return (
        <div className="grid gap-6 p-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/passports">
                            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Liste
                        </Link>
                    </Button>
                    <AtelierStatusBadge status={passport.status} />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{passport.garment.reference || 'Sans référence'}</CardTitle>
                        <p className="text-muted-foreground text-sm capitalize">
                            {passport.garment.kind} · modifié le{' '}
                            {new Date(passport.updatedAt).toLocaleDateString('fr-FR')}
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {passport.garment.mainPhotoUrl && (
                            <Image
                                src={passport.garment.mainPhotoUrl}
                                alt={`Visuel principal du passeport ${passport.garment.reference}`}
                                width={640}
                                height={288}
                                unoptimized
                                className="border-border max-h-72 w-auto rounded-xl border object-contain"
                            />
                        )}
                        <p className="text-muted-foreground break-all font-mono text-xs">
                            {passport.gs1.verificationUrl}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Composition</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm">
                        {passport.materials.length === 0 && <p className="text-muted-foreground">-</p>}
                        {passport.materials.map((m, i) => (
                            <p key={i} className="text-foreground">
                                <span className="font-mono">{m.percentage}%</span> {m.fiber} · {m.originCountry} ·{' '}
                                {m.supplierId || 'fournisseur manquant'}
                            </p>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Étapes ({passport.steps.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm">
                        {passport.steps.length === 0 && <p className="text-muted-foreground">-</p>}
                        {passport.steps.map((s) => (
                            <p key={s.id} className="text-foreground">
                                {s.kind} - {s.label || '(sans libellé)'} · {s.locationCity}
                            </p>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                <Card>
                    <CardHeader>
                        <p className="text-muted-foreground text-[11px] uppercase tracking-wider">Score Iris</p>
                        <div className="mt-2 flex items-center gap-3">
                            <IrisGrade grade={score.grade} size="lg" />
                            <p className="text-foreground font-mono text-2xl font-semibold">
                                {score.total.toFixed(1)}
                                <span className="text-muted-foreground/70 ml-0.5 text-sm font-normal">/ 100</span>
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ScoreBreakdown breakdown={score.breakdown} weights={score.weights} />
                        {score.cap?.applied && <ScoreCapWarning cap={score.cap} />}
                        <div className="flex items-center justify-between border-t pt-3">
                            <span className="text-muted-foreground text-xs">Champs ESPR/AGEC</span>
                            <MissingFieldsBadge passport={passport} showWhenComplete />
                        </div>
                        <Button asChild variant="outline" className="w-full">
                            <Link href={`/print/${passport.id}`} target="_blank">
                                <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Imprimer étiquette
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">Motifs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScoreReasonsList reasons={score.reasons} limit={6} />
                    </CardContent>
                </Card>
            </aside>
        </div>
    );
}
