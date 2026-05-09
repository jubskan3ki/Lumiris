'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Download, Eye, Printer, Sparkles } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { ESPR_REQUIRED_FIELDS, AGEC_REQUIRED_FIELDS, computeScore } from '@lumiris/core/scoring';
import { mockCertificates } from '@lumiris/mock-data';
import { buildGS1Identifier } from '@lumiris/types';
import type { Passport, IrisGrade as IrisGradeLetter, ScoreResult } from '@lumiris/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@lumiris/ui/components/accordion';
import { Button } from '@lumiris/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@lumiris/ui/components/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@lumiris/ui/components/dialog';
import { IrisGrade, MissingFieldsBadge, ScoreBreakdown, ScoreCapWarning, ScoreReasonsList } from '@lumiris/scoring-ui';
import { WizardShell } from '@/features/wizard-shell';
import { useStepNavigation } from '@/features/wizard-shell/use-step-navigation';
import { currentArtisan } from '@/lib/current-artisan';
import { draftToPassport, useDraftStore } from '@/lib/draft-store';

export function CreateStepPublish({ draftId }: { draftId: string }) {
    const draft = useDraftStore((s) => s.drafts[draftId]);
    const publish = useDraftStore((s) => s.publish);
    const { goTo } = useStepNavigation(draftId);

    const [open, setOpen] = useState(false);
    const [published, setPublished] = useState<{
        passport: Passport;
        score: ScoreResult;
        gs1: string;
    } | null>(null);

    const passport = useMemo(() => (draft ? draftToPassport(draft) : null), [draft]);
    const score = useMemo(() => {
        if (!passport) return null;
        return computeScore(passport, {
            artisan: currentArtisan,
            certificates: mockCertificates,
            now: new Date(),
        });
    }, [passport]);

    if (!passport || !score) {
        return (
            <WizardShell draftId={draftId} step="publish">
                {null}
            </WizardShell>
        );
    }

    const missing = listMissingFields(passport);
    const willBeIncomplete = missing.length > 0;

    const handlePublish = () => {
        const gtin = randomGtin13();
        const serial = randomSerial(8);
        const gs1 = buildGS1Identifier(gtin, serial, draftId);
        const status: 'Published' | 'InCompletion' = willBeIncomplete ? 'InCompletion' : 'Published';
        publish(draftId, { gs1, status });
        setPublished({ passport: { ...passport, gs1, status }, score, gs1: gs1.verificationUrl });
        setOpen(true);
    };

    return (
        <WizardShell draftId={draftId} step="publish" onPrev={() => goTo('certifications')}>
            <div className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="text-lumiris-emerald h-5 w-5" /> Publication
                            </CardTitle>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Récap final, score Iris officiel et génération du QR.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
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
                            <span className="text-muted-foreground text-xs">Champs ESPR/AGEC obligatoires</span>
                            <MissingFieldsBadge passport={passport} showWhenComplete />
                        </div>
                        {missing.length > 0 && (
                            <div className="border-lumiris-orange/30 bg-lumiris-orange/5 rounded-lg border p-3 text-sm">
                                <p className="text-lumiris-orange mb-1.5 font-semibold">Champs manquants</p>
                                <ul className="text-foreground/80 list-disc space-y-0.5 pl-5 text-xs">
                                    {missing.map((m) => (
                                        <li key={m}>{m}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Récap du DPP</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="multiple" className="w-full">
                            <Section value="prod" title="Produit">
                                <Field label="Type" value={passport.garment.kind} />
                                <Field label="Référence" value={passport.garment.reference || '-'} />
                                <Field
                                    label="Prix"
                                    value={`${passport.garment.retailPrice} ${passport.garment.currency}`}
                                />
                                <Field label="Poids" value={`${passport.garment.dimensions.weightG ?? '?'} g`} />
                            </Section>
                            <Section value="comp" title={`Composition (${passport.materials.length})`}>
                                {passport.materials.length === 0 && <Empty />}
                                {passport.materials.map((m, i) => (
                                    <p key={i} className="text-foreground text-xs">
                                        {m.percentage}% {m.fiber} - {m.originCountry} ·{' '}
                                        {m.supplierId || 'fournisseur manquant'} · {m.certifications.length} certif(s)
                                    </p>
                                ))}
                            </Section>
                            <Section value="steps" title={`Étapes (${passport.steps.length})`}>
                                {passport.steps.length === 0 && <Empty />}
                                {passport.steps.map((s) => (
                                    <p key={s.id} className="text-foreground text-xs">
                                        {s.kind} - {s.label || '(sans libellé)'} · {s.performedBy} ({s.locationCity},{' '}
                                        {s.locationCountry}) · {s.photos.length} photo(s)
                                    </p>
                                ))}
                            </Section>
                            <Section value="certs" title={`Certifications (${passport.certifications.length})`}>
                                {passport.certifications.length === 0 && <Empty />}
                                {passport.certifications.map((c) => (
                                    <p key={c.id} className="text-foreground text-xs">
                                        {c.kind} - {c.issuer || c.customName || '(organisme inconnu)'}{' '}
                                        {c.verified ? '· vérifiée' : '· non vérifiée'}
                                    </p>
                                ))}
                            </Section>
                            <Section value="warranty" title="Garantie">
                                <Field label="Durée" value={`${passport.warranty.durationMonths} mois`} />
                                <Field label="Termes" value={passport.warranty.terms || '-'} />
                            </Section>
                            <Section value="reasons" title="Motifs de score">
                                <ScoreReasonsList reasons={score.reasons} />
                            </Section>
                        </Accordion>
                    </CardContent>
                </Card>

                <div className="flex items-center justify-between gap-4">
                    <p className="text-muted-foreground text-xs">
                        {willBeIncomplete
                            ? 'Le passeport sera publié en statut "En complétion" - vous pourrez compléter les champs manquants plus tard.'
                            : "Aucun champ obligatoire manquant - publication en statut 'Publié'."}
                    </p>
                    <Button
                        onClick={handlePublish}
                        size="lg"
                        className="bg-lumiris-emerald hover:bg-lumiris-emerald/90 text-white"
                    >
                        Publier le passeport
                    </Button>
                </div>
            </div>

            {published && (
                <SuccessDialog
                    open={open}
                    onOpenChange={setOpen}
                    passportId={draftId}
                    gs1={published.gs1}
                    grade={published.score.grade}
                />
            )}
        </WizardShell>
    );
}

function Section({ value, title, children }: { value: string; title: string; children: React.ReactNode }) {
    return (
        <AccordionItem value={value}>
            <AccordionTrigger className="text-sm">{title}</AccordionTrigger>
            <AccordionContent className="space-y-1">{children}</AccordionContent>
        </AccordionItem>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-foreground">{value}</span>
        </div>
    );
}

function Empty() {
    return <p className="text-muted-foreground text-xs italic">Aucun élément.</p>;
}

interface SuccessDialogProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    passportId: string;
    gs1: string;
    grade: IrisGradeLetter;
}

function SuccessDialog({ open, onOpenChange, passportId, gs1, grade }: SuccessDialogProps) {
    const downloadPng = () => {
        const canvas = document.querySelector<HTMLCanvasElement>(`#publish-qr-${passportId} canvas`);
        if (!canvas) return;
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `lumiris-${passportId}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="text-lumiris-emerald h-4 w-4" /> Passeport publié
                    </DialogTitle>
                    <DialogDescription>
                        Grade Iris {grade}. QR généré, prêt à imprimer ou coller en doublure.
                    </DialogDescription>
                </DialogHeader>

                <div id={`publish-qr-${passportId}`} className="flex flex-col items-center gap-3 py-2">
                    <div className="border-border rounded-xl border bg-white p-4">
                        <QRCodeCanvas value={gs1} size={240} includeMargin level="M" />
                    </div>
                    <p className="text-muted-foreground max-w-full break-all font-mono text-[11px]">{gs1}</p>
                </div>

                <DialogFooter className="flex-col gap-2 sm:flex-row">
                    <Button variant="outline" onClick={downloadPng}>
                        <Download className="mr-1.5 h-3.5 w-3.5" /> Télécharger PNG
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={`/print/${passportId}`} target="_blank">
                            <Printer className="mr-1.5 h-3.5 w-3.5" /> Imprimer étiquette
                        </Link>
                    </Button>
                    <Button asChild className="bg-lumiris-emerald hover:bg-lumiris-emerald/90 text-white">
                        <Link href={`/passports/${passportId}`}>
                            <Eye className="mr-1.5 h-3.5 w-3.5" /> Voir le passeport
                        </Link>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function listMissingFields(p: Passport): string[] {
    const missing: string[] = [];
    for (const f of ESPR_REQUIRED_FIELDS) {
        if (!f.isPresent(p)) missing.push(`ESPR · ${f.path}`);
    }
    for (const f of AGEC_REQUIRED_FIELDS) {
        if (!f.isPresent(p)) missing.push(`AGEC · ${f.path}`);
    }
    return missing;
}

function randomGtin13(): string {
    let s = '';
    for (let i = 0; i < 13; i++) s += Math.floor(Math.random() * 10).toString();
    return s;
}

function randomSerial(len: number): string {
    const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let s = '';
    for (let i = 0; i < len; i++) s += alpha[Math.floor(Math.random() * alpha.length)];
    return s;
}
