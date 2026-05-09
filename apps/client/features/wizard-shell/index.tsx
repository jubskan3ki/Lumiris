'use client';

import Link from 'next/link';
import { Check, Circle } from 'lucide-react';
import { computeScore } from '@lumiris/core/scoring';
import { mockCertificates } from '@lumiris/mock-data';
import { IrisGrade, ScoreBreakdown, MissingFieldsBadge, ScoreCapWarning } from '@lumiris/scoring-ui';
import { Button } from '@lumiris/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@lumiris/ui/components/card';
import { cn } from '@lumiris/ui/lib/cn';
import { currentArtisan } from '@/lib/current-artisan';
import { draftToPassport, useDraftStore, WIZARD_STEPS, type WizardStep } from '@/lib/draft-store';

const STEP_LABELS: Record<WizardStep, string> = {
    identification: 'Identification',
    composition: 'Composition',
    invoice: 'Factures (OCR)',
    manufacturing: 'Étapes de fabrication',
    certifications: 'Certifications',
    publish: 'Publication',
};

interface WizardShellProps {
    draftId: string;
    step: WizardStep;
    children: React.ReactNode;
    onPrev?: () => void;
    onNext?: () => void;
    nextLabel?: string;
    nextDisabled?: boolean;
}

export function WizardShell({
    draftId,
    step,
    children,
    onPrev,
    onNext,
    nextLabel = 'Suivant',
    nextDisabled = false,
}: WizardShellProps) {
    const draft = useDraftStore((s) => s.drafts[draftId]);

    if (!draft) {
        return (
            <div className="p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Brouillon introuvable</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-muted-foreground text-sm">
                            Ce brouillon n’existe pas ou a été supprimé. Vous pouvez en démarrer un nouveau.
                        </p>
                        <Button asChild>
                            <Link href="/create">Créer un nouveau passeport</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const passport = draftToPassport(draft);
    const score = computeScore(passport, {
        artisan: currentArtisan,
        certificates: mockCertificates,
        now: new Date(),
    });

    return (
        <div className="grid gap-6 p-8 lg:grid-cols-[1fr_320px]">
            <div className="min-w-0 space-y-6">
                <Stepper currentStep={step} draftId={draftId} />
                <div>{children}</div>

                <div className="flex items-center justify-between gap-3 pt-2">
                    {onPrev ? (
                        <Button variant="outline" onClick={onPrev}>
                            Étape précédente
                        </Button>
                    ) : (
                        <span />
                    )}
                    {onNext && (
                        <Button
                            onClick={onNext}
                            disabled={nextDisabled}
                            className="bg-lumiris-emerald hover:bg-lumiris-emerald/90 text-white"
                        >
                            {nextLabel}
                        </Button>
                    )}
                </div>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                <Card>
                    <CardHeader>
                        <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
                            Score Iris provisoire
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                            <IrisGrade grade={score.grade} size="lg" />
                            <div>
                                <p className="text-foreground font-mono text-2xl font-semibold">
                                    {score.total.toFixed(1)}
                                    <span className="text-muted-foreground/70 ml-0.5 text-sm font-normal">/ 100</span>
                                </p>
                                <p className="text-muted-foreground text-xs">Recalculé en direct</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ScoreBreakdown breakdown={score.breakdown} weights={score.weights} />
                        {score.cap?.applied && <ScoreCapWarning cap={score.cap} />}
                        <div className="flex items-center justify-between border-t pt-3">
                            <span className="text-muted-foreground text-xs">Champs ESPR/AGEC</span>
                            <MissingFieldsBadge passport={passport} showWhenComplete />
                        </div>
                    </CardContent>
                </Card>
            </aside>
        </div>
    );
}

function Stepper({ currentStep, draftId }: { currentStep: WizardStep; draftId: string }) {
    const currentIndex = WIZARD_STEPS.indexOf(currentStep);
    return (
        <ol className="border-border bg-card flex w-full flex-wrap items-center gap-2 rounded-xl border p-3 text-xs sm:gap-1">
            {WIZARD_STEPS.map((s, i) => {
                const done = i < currentIndex;
                const active = i === currentIndex;
                return (
                    <li key={s} className="flex flex-1 items-center gap-2">
                        <Link
                            href={`/create/${draftId}/${s}`}
                            className={cn(
                                'flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 transition-colors',
                                active && 'bg-lumiris-emerald/10 text-lumiris-emerald font-medium',
                                done && 'text-muted-foreground hover:bg-muted',
                                !active && !done && 'text-muted-foreground hover:bg-muted',
                            )}
                        >
                            <span
                                className={cn(
                                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px]',
                                    done && 'bg-lumiris-emerald text-white',
                                    active && 'bg-lumiris-emerald/20 text-lumiris-emerald',
                                    !done && !active && 'bg-muted text-muted-foreground',
                                )}
                            >
                                {done ? <Check className="h-3 w-3" /> : i + 1}
                            </span>
                            <span className="truncate">{STEP_LABELS[s]}</span>
                        </Link>
                        {i < WIZARD_STEPS.length - 1 && (
                            <Circle className="text-muted-foreground/30 hidden h-1.5 w-1.5 shrink-0 fill-current sm:inline" />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}
