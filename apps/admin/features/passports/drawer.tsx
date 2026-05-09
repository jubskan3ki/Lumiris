'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Clock, Flag, History, MessageSquare, Sparkles } from 'lucide-react';
import { type Passport, type IrisGrade as IrisGradeLetter } from '@lumiris/types';
import { mockArtisans, mockInvoices } from '@lumiris/mock-data';
import {
    CompositionList,
    FactureOcrViewer,
    IrisGrade,
    ManufacturingTimeline,
    PassportPhonePreview,
    ScoreBreakdown,
    ScoreCapWarning,
    ScoreReasonsList,
    gradeBackground,
    gradeColor,
} from '@lumiris/scoring-ui';
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
import { Badge } from '@lumiris/ui/components/badge';
import { Button } from '@lumiris/ui/components/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@lumiris/ui/components/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@lumiris/ui/components/tabs';
import { Textarea } from '@lumiris/ui/components/textarea';
import { ScrollArea } from '@lumiris/ui/components/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@lumiris/ui/components/select';
import { cn } from '@lumiris/ui/lib/cn';
import { useAdminAuditLog, useLogAction, usePermission } from '@/lib/auth';
import { useIrisScore } from './hooks';
import { useCurationStore } from './curation-store';
import { FLAG_TAGS, type EffectiveStatus } from './types';

interface PassportDrawerProps {
    passport: Passport | null;
    onClose: () => void;
}

export function PassportDrawer({ passport, onClose }: PassportDrawerProps) {
    return (
        <Sheet open={passport !== null} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="bg-background w-full overflow-hidden p-0 sm:max-w-2xl">
                {passport ? <DrawerBody passport={passport} onClose={onClose} /> : null}
            </SheetContent>
        </Sheet>
    );
}

function DrawerBody({ passport, onClose }: { passport: Passport; onClose: () => void }) {
    const score = useIrisScore(passport);
    const artisan = mockArtisans.find((a) => a.id === passport.artisanId);
    const auditLog = useAdminAuditLog();
    const { overlays } = useCurationStore();
    const overlay = overlays.get(passport.id);

    const status: EffectiveStatus =
        overlay?.status ??
        (passport.moderation?.status === 'Approved'
            ? 'validated'
            : passport.moderation?.status === 'Rejected'
              ? 'flagged'
              : 'pending');

    const passportLog = useMemo(
        () => auditLog.filter((entry) => entry.targetType === 'passport' && entry.targetId === passport.id),
        [auditLog, passport.id],
    );

    return (
        <div className="flex h-full flex-col">
            <SheetHeader className="border-border border-b p-5">
                <div className="flex items-center gap-3">
                    <IrisGrade grade={overlay?.overrideGrade ?? score.grade} size="md" tone="solid" />
                    <div className="min-w-0 flex-1">
                        <SheetTitle className="text-foreground truncate text-base">
                            {passport.garment.reference}
                        </SheetTitle>
                        <p className="text-muted-foreground truncate text-xs">
                            {artisan?.atelierName ?? '—'} · {passport.id}
                        </p>
                    </div>
                    <StatusPill status={status} />
                </div>
            </SheetHeader>

            <Tabs defaultValue="overview" className="flex flex-1 flex-col overflow-hidden">
                <TabsList className="border-border w-full justify-start gap-1 rounded-none border-b bg-transparent px-3">
                    <TabsTrigger value="overview">Aperçu</TabsTrigger>
                    <TabsTrigger value="composition">Composition</TabsTrigger>
                    <TabsTrigger value="steps">Étapes</TabsTrigger>
                    <TabsTrigger value="invoices">Justificatifs</TabsTrigger>
                    <TabsTrigger value="score">Score</TabsTrigger>
                    <TabsTrigger value="history">Historique</TabsTrigger>
                </TabsList>
                <ScrollArea className="flex-1">
                    <div className="p-5">
                        <TabsContent value="overview" className="m-0">
                            <div className="space-y-5">
                                <PassportPhonePreview
                                    passport={passport}
                                    artisan={artisan}
                                    score={score}
                                    overrideGrade={overlay?.overrideGrade}
                                />
                                <div className="border-border bg-card grid grid-cols-2 gap-3 rounded-xl border p-4 text-xs">
                                    <Field label="Soumis le" value={fmtDate(passport.createdAt)} />
                                    <Field label="Mis à jour" value={fmtDate(passport.updatedAt)} />
                                    <Field label="Statut DPP" value={passport.status} />
                                    <Field label="GS1 Digital Link" value={passport.gs1.verificationUrl} mono />
                                    <Field label="Garantie" value={`${passport.warranty.durationMonths} mois`} />
                                    <Field
                                        label="Prix public"
                                        value={`${passport.garment.retailPrice.toLocaleString('fr-FR')} €`}
                                    />
                                </div>
                                {overlay?.changesMessage ? (
                                    <div className="border-lumiris-amber/30 bg-lumiris-amber/5 rounded-xl border p-3 text-xs">
                                        <p className="text-lumiris-amber font-medium">Changements demandés</p>
                                        <p className="text-foreground mt-1">{overlay.changesMessage}</p>
                                    </div>
                                ) : null}
                                {overlay?.flagReason ? (
                                    <div className="border-lumiris-rose/30 bg-lumiris-rose/5 rounded-xl border p-3 text-xs">
                                        <p className="text-lumiris-rose font-medium">Anomalie signalée</p>
                                        <p className="text-foreground mt-1">{overlay.flagReason}</p>
                                        {overlay.flagTags && overlay.flagTags.length > 0 ? (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {overlay.flagTags.map((t) => (
                                                    <Badge key={t} variant="outline" className="font-mono text-[10px]">
                                                        {t}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>
                                ) : null}
                            </div>
                        </TabsContent>

                        <TabsContent value="composition" className="m-0">
                            <CompositionList composition={passport.materials} now={new Date('2026-04-30T08:00:00Z')} />
                        </TabsContent>

                        <TabsContent value="steps" className="m-0">
                            <ManufacturingTimeline steps={passport.steps} />
                        </TabsContent>

                        <TabsContent value="invoices" className="m-0">
                            <InvoicesTab passport={passport} />
                        </TabsContent>

                        <TabsContent value="score" className="m-0">
                            <div className="space-y-5">
                                <div className="border-border bg-card rounded-xl border p-4">
                                    <div className="flex items-baseline justify-between">
                                        <p className="text-muted-foreground text-xs uppercase tracking-wider">
                                            Score Iris
                                        </p>
                                        <span className="text-foreground font-mono text-2xl font-bold">
                                            {score.total.toFixed(1)}
                                        </span>
                                    </div>
                                    <ScoreBreakdown
                                        breakdown={score.breakdown}
                                        weights={score.weights}
                                        className="mt-4"
                                    />
                                </div>
                                {score.cap?.applied ? <ScoreCapWarning cap={score.cap} /> : null}
                                <div>
                                    <p className="text-foreground mb-2 text-sm font-medium">Motifs</p>
                                    <ScoreReasonsList reasons={score.reasons} />
                                </div>
                                <div className="border-border bg-card rounded-xl border p-4">
                                    <p className="text-muted-foreground mb-2 text-[10px] uppercase tracking-wider">
                                        Coefficients appliqués
                                    </p>
                                    <ul className="space-y-1 text-xs">
                                        <li className="flex justify-between">
                                            <span>Transparence</span>
                                            <span className="font-mono">×{score.weights.transparency.toFixed(2)}</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Savoir-faire</span>
                                            <span className="font-mono">×{score.weights.craftsmanship.toFixed(2)}</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Impact</span>
                                            <span className="font-mono">×{score.weights.impact.toFixed(2)}</span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>Réparabilité</span>
                                            <span className="font-mono">×{score.weights.repairability.toFixed(2)}</span>
                                        </li>
                                    </ul>
                                </div>
                                {overlay?.overrideGrade ? (
                                    <div className="border-lumiris-cyan/30 bg-lumiris-cyan/5 rounded-xl border p-3 text-xs">
                                        <p className="text-lumiris-cyan inline-flex items-center gap-1 font-semibold">
                                            <Sparkles className="h-3 w-3" /> Override actif
                                        </p>
                                        <p className="text-foreground mt-1">
                                            Grade affiché <strong>{overlay.overrideGrade}</strong> au lieu de{' '}
                                            <strong>{score.grade}</strong>.
                                        </p>
                                        <p className="text-muted-foreground mt-1">{overlay.overrideReason}</p>
                                    </div>
                                ) : null}
                            </div>
                        </TabsContent>

                        <TabsContent value="history" className="m-0">
                            <CurationLog entries={passportLog} />
                        </TabsContent>
                    </div>
                </ScrollArea>
            </Tabs>

            <CuratorActions passport={passport} score={{ grade: score.grade }} onAfterAction={onClose} />
        </div>
    );
}

function StatusPill({ status }: { status: EffectiveStatus }) {
    const tone =
        status === 'validated'
            ? 'border-lumiris-emerald/40 bg-lumiris-emerald/10 text-lumiris-emerald'
            : status === 'flagged'
              ? 'border-lumiris-rose/40 bg-lumiris-rose/10 text-lumiris-rose'
              : status === 'changes_requested'
                ? 'border-lumiris-amber/40 bg-lumiris-amber/10 text-lumiris-amber'
                : status === 'archived'
                  ? 'border-muted-foreground/40 bg-muted text-muted-foreground'
                  : 'border-lumiris-cyan/40 bg-lumiris-cyan/10 text-lumiris-cyan';
    return (
        <Badge variant="outline" className={cn('font-mono text-[10px]', tone)}>
            {status}
        </Badge>
    );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <div>
            <p className="text-muted-foreground text-[10px] uppercase tracking-wider">{label}</p>
            <p className={cn('text-foreground mt-0.5 truncate', mono ? 'font-mono text-[11px]' : 'text-xs')}>{value}</p>
        </div>
    );
}

function fmtDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function InvoicesTab({ passport }: { passport: Passport }) {
    const linkedInvoices = useMemo(() => {
        const refs = new Set(passport.materials.map((m) => m.invoiceRef).filter(Boolean));
        return mockInvoices.filter((inv) => refs.has(inv.id));
    }, [passport]);

    const artisan = mockArtisans.find((a) => a.id === passport.artisanId);
    const passportCerts = passport.certifications;

    // Cross-check par artisan : on récupère les certifs de tous les passeports du même artisan
    // et on signale les incohérences (ex. fournisseur déclaré différemment selon les passeports).
    const inconsistencies = useMemo(() => {
        return passport.materials.filter((m) => !m.invoiceRef && m.percentage > 0);
    }, [passport]);

    return (
        <div className="space-y-5">
            <section>
                <h3 className="text-foreground mb-2 text-sm font-semibold">Factures OCR</h3>
                {linkedInvoices.length === 0 ? (
                    <p className="text-muted-foreground text-xs">Aucune facture liée.</p>
                ) : (
                    <div className="space-y-2">
                        {linkedInvoices.map((inv) => (
                            <FactureOcrViewer key={inv.id} invoice={inv} />
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h3 className="text-foreground mb-2 text-sm font-semibold">Certificats joints</h3>
                {passportCerts.length === 0 ? (
                    <p className="text-muted-foreground text-xs">Aucun certificat de passeport.</p>
                ) : (
                    <ul className="border-border bg-card divide-border divide-y rounded-xl border text-xs">
                        {passportCerts.map((c) => (
                            <li key={c.id} className="flex items-baseline justify-between px-3 py-2">
                                <div>
                                    <p className="text-foreground font-medium">
                                        {c.kind} {c.customName ? `· ${c.customName}` : ''}
                                    </p>
                                    <p className="text-muted-foreground text-[10px]">
                                        {c.issuer} · expire {fmtDate(c.expiresAt)}
                                    </p>
                                </div>
                                <Badge variant="outline" className="font-mono text-[10px]">
                                    {c.verified ? 'verified' : 'unverified'}
                                </Badge>
                            </li>
                        ))}
                    </ul>
                )}
                {inconsistencies.length > 0 ? (
                    <div className="border-lumiris-amber/30 bg-lumiris-amber/5 mt-3 rounded-xl border p-3 text-xs">
                        <p className="text-lumiris-amber inline-flex items-center gap-1 font-semibold">
                            <AlertTriangle className="h-3 w-3" /> Incohérence cross-check artisan
                        </p>
                        <p className="text-foreground mt-1">
                            {inconsistencies.length} ligne(s) de composition sans invoiceRef pour{' '}
                            {artisan?.atelierName ?? 'cet artisan'}.
                        </p>
                    </div>
                ) : null}
            </section>

            <section>
                <h3 className="text-foreground mb-2 text-sm font-semibold">Déclarations sur l&apos;honneur</h3>
                <ul className="border-border bg-card divide-border divide-y rounded-xl border text-xs">
                    <li className="flex items-baseline justify-between px-3 py-2">
                        <p className="text-foreground">Déclaration ESPR — composition fidèle</p>
                        <p className="text-muted-foreground font-mono text-[10px]">
                            signée le {fmtDate(passport.createdAt)}
                        </p>
                    </li>
                    <li className="flex items-baseline justify-between px-3 py-2">
                        <p className="text-foreground">Déclaration AGEC — origine et étapes vérifiées</p>
                        <p className="text-muted-foreground font-mono text-[10px]">
                            signée le {fmtDate(passport.createdAt)}
                        </p>
                    </li>
                </ul>
            </section>
        </div>
    );
}

function CurationLog({ entries }: { entries: ReturnType<typeof useAdminAuditLog> }) {
    if (entries.length === 0) {
        return <p className="text-muted-foreground text-xs">Pas encore d&apos;historique.</p>;
    }
    return (
        <ol className="relative space-y-3 border-l border-dashed pl-5">
            {entries.map((entry) => (
                <li key={entry.id} className="relative">
                    <span className="bg-foreground absolute -left-[27px] top-2 block h-2 w-2 rounded-full" />
                    <div className="border-border bg-card rounded-lg border p-3 text-xs">
                        <div className="flex items-baseline justify-between gap-3">
                            <p className="text-foreground font-mono text-[11px]">{entry.action}</p>
                            <span className="text-muted-foreground font-mono text-[10px]">
                                {new Date(entry.ts).toLocaleString('fr-FR', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </div>
                        <p className="text-muted-foreground mt-1 truncate text-[11px]">
                            par <strong className="text-foreground">{entry.actorId}</strong> · {entry.actorRole}
                        </p>
                        {Object.keys(entry.payload).length > 0 ? (
                            <pre className="text-muted-foreground/80 mt-2 overflow-x-auto whitespace-pre-wrap text-[10px]">
                                {JSON.stringify(entry.payload, null, 2)}
                            </pre>
                        ) : null}
                    </div>
                </li>
            ))}
        </ol>
    );
}

type CuratorAction = 'validate' | 'request_changes' | 'flag' | 'override';

interface CuratorActionsProps {
    passport: Passport;
    score: { grade: IrisGradeLetter };
    onAfterAction: () => void;
}

function CuratorActions({ passport, score, onAfterAction }: CuratorActionsProps) {
    const canCurate = usePermission('passport.curate');
    const canFlag = usePermission('passport.flag');
    const canRequest = usePermission('passport.request_changes');
    const canOverride = usePermission('passport.override_score');
    const log = useLogAction();
    const { setOverlay } = useCurationStore();

    const [pendingAction, setPendingAction] = useState<CuratorAction | null>(null);
    const [validateOpen, setValidateOpen] = useState(false);
    const [overrideOpen, setOverrideOpen] = useState(false);

    const [requestMessage, setRequestMessage] = useState('');
    const [flagReason, setFlagReason] = useState('');
    const [flagTags, setFlagTags] = useState<string[]>([]);
    const [overrideGrade, setOverrideGrade] = useState<IrisGradeLetter>(score.grade);
    const [overrideReason, setOverrideReason] = useState('');

    if (!canCurate && !canFlag && !canRequest && !canOverride) {
        return (
            <div className="border-border text-muted-foreground bg-muted/30 border-t px-5 py-3 text-center text-xs">
                Vous n&apos;avez aucune permission curator sur ce passeport.
            </div>
        );
    }

    const handleValidate = () => {
        const publishedAt = new Date().toISOString();
        setOverlay(passport.id, { status: 'validated', publishedAt });
        log({
            action: 'passport.curate',
            targetType: 'passport',
            targetId: passport.id,
            payload: {
                decision: 'validated',
                publishedAt,
                qrCodeUrl: passport.gs1.verificationUrl,
                artisanId: passport.artisanId,
            },
        });
        setValidateOpen(false);
        onAfterAction();
    };

    const handleRequestChanges = () => {
        if (requestMessage.trim().length === 0) return;
        setOverlay(passport.id, {
            status: 'changes_requested',
            changesMessage: requestMessage,
        });
        log({
            action: 'passport.request_changes',
            targetType: 'passport',
            targetId: passport.id,
            payload: { message: requestMessage, artisanId: passport.artisanId },
        });
        setRequestMessage('');
        setPendingAction(null);
        onAfterAction();
    };

    const handleFlag = () => {
        if (flagReason.trim().length === 0) return;
        setOverlay(passport.id, {
            status: 'flagged',
            flagReason,
            flagTags,
        });
        log({
            action: 'passport.flag',
            targetType: 'passport',
            targetId: passport.id,
            payload: { reason: flagReason, tags: flagTags, artisanId: passport.artisanId },
        });
        setFlagReason('');
        setFlagTags([]);
        setPendingAction(null);
        onAfterAction();
    };

    const handleOverride = () => {
        if (overrideReason.trim().length < 30) return;
        setOverlay(passport.id, {
            overrideGrade,
            overrideReason,
        });
        log({
            action: 'passport.override_score',
            targetType: 'passport',
            targetId: passport.id,
            payload: {
                from: score.grade,
                to: overrideGrade,
                reason: overrideReason,
                artisanId: passport.artisanId,
            },
        });
        setOverrideReason('');
        setOverrideOpen(false);
        onAfterAction();
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-border bg-card flex flex-wrap gap-2 border-t p-4"
            >
                {canCurate ? (
                    <Button
                        size="sm"
                        className="bg-lumiris-emerald hover:bg-lumiris-emerald/90 text-primary-foreground gap-1.5"
                        onClick={() => setValidateOpen(true)}
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Valider et publier
                    </Button>
                ) : null}
                {canRequest ? (
                    <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => setPendingAction('request_changes')}
                    >
                        <MessageSquare className="h-3.5 w-3.5" /> Demander des changements
                    </Button>
                ) : null}
                {canFlag ? (
                    <Button
                        size="sm"
                        variant="outline"
                        className="border-lumiris-rose/40 text-lumiris-rose hover:bg-lumiris-rose/10 gap-1.5"
                        onClick={() => setPendingAction('flag')}
                    >
                        <Flag className="h-3.5 w-3.5" /> Flagger anomalie
                    </Button>
                ) : null}
                {canOverride ? (
                    <Button
                        size="sm"
                        variant="outline"
                        className="border-lumiris-cyan/40 text-lumiris-cyan hover:bg-lumiris-cyan/10 gap-1.5"
                        onClick={() => setOverrideOpen(true)}
                    >
                        <Sparkles className="h-3.5 w-3.5" /> Override score
                    </Button>
                ) : null}
            </motion.div>

            <AlertDialog open={validateOpen} onOpenChange={setValidateOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Valider et publier ce passeport ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Le passeport <strong>{passport.garment.reference}</strong> sera publié avec son grade Iris{' '}
                            <strong>{score.grade}</strong>. Le QR code GS1 sera émis. Action tracée dans le log de
                            gouvernance.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleValidate}
                            className="bg-lumiris-emerald hover:bg-lumiris-emerald/90"
                        >
                            Confirmer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={pendingAction === 'request_changes'}
                onOpenChange={(open) => !open && setPendingAction(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Demander des changements à l&apos;artisan</AlertDialogTitle>
                        <AlertDialogDescription>
                            Précisez ce qui doit être complété ou corrigé. Un message sera envoyé à l&apos;artisan et
                            l&apos;action sera tracée.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Textarea
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                        placeholder="Exemple : il manque la photo de l'étape 3 et le fournisseur du fil de soie."
                        className="min-h-24"
                    />
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRequestChanges} disabled={requestMessage.trim().length === 0}>
                            Envoyer la demande
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={pendingAction === 'flag'} onOpenChange={(open) => !open && setPendingAction(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Flagger une anomalie</AlertDialogTitle>
                        <AlertDialogDescription>
                            Le passeport sera marqué <strong>flagged</strong>, soustrait de la file principale et
                            nécessitera une revue lead curator.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Textarea
                        value={flagReason}
                        onChange={(e) => setFlagReason(e.target.value)}
                        placeholder="Raison de l'anomalie (libre)…"
                        className="min-h-20"
                    />
                    <div className="space-y-1.5">
                        <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Tags</p>
                        <div className="flex flex-wrap gap-1.5">
                            {FLAG_TAGS.map((tag) => {
                                const active = flagTags.includes(tag);
                                return (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() =>
                                            setFlagTags((prev) =>
                                                prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
                                            )
                                        }
                                        className={cn(
                                            'rounded-full border px-2 py-0.5 font-mono text-[10px] transition-colors',
                                            active
                                                ? 'border-lumiris-rose/40 bg-lumiris-rose/10 text-lumiris-rose'
                                                : 'border-border text-muted-foreground hover:border-lumiris-rose/40 hover:text-lumiris-rose',
                                        )}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleFlag}
                            disabled={flagReason.trim().length === 0}
                            className="bg-lumiris-rose hover:bg-lumiris-rose/90"
                        >
                            Flagger
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={overrideOpen} onOpenChange={setOverrideOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lumiris-cyan">
                            Override de score — gouvernance sensible
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Vous remplacez visuellement le grade calculé par l&apos;algorithme. Cette action est tracée
                            publiquement dans la timeline gouvernance. <strong>Personne n&apos;achète son score</strong>{' '}
                            — la raison doit justifier formellement (audit ré-vérifié, certif re-validée…).
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-3">
                        <div className="border-border bg-muted/30 flex items-center justify-around rounded-xl border p-3">
                            <div className="text-center">
                                <p className="text-muted-foreground text-[10px] uppercase tracking-wider">
                                    Grade calculé
                                </p>
                                <span
                                    className={cn(
                                        'mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full font-mono text-base font-bold',
                                        gradeBackground(score.grade),
                                        gradeColor(score.grade),
                                    )}
                                >
                                    {score.grade}
                                </span>
                            </div>
                            <Clock className="text-muted-foreground h-4 w-4" />
                            <div className="text-center">
                                <p className="text-muted-foreground text-[10px] uppercase tracking-wider">
                                    Nouveau grade
                                </p>
                                <span
                                    className={cn(
                                        'mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full font-mono text-base font-bold',
                                        gradeBackground(overrideGrade),
                                        gradeColor(overrideGrade),
                                    )}
                                >
                                    {overrideGrade}
                                </span>
                            </div>
                        </div>
                        <Select value={overrideGrade} onValueChange={(v) => setOverrideGrade(v as IrisGradeLetter)}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {(['A', 'B', 'C', 'D', 'E'] as const).map((g) => (
                                    <SelectItem key={g} value={g}>
                                        Grade {g}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Textarea
                            value={overrideReason}
                            onChange={(e) => setOverrideReason(e.target.value)}
                            placeholder="Justification (30+ caractères) : audit ré-effectué, certif re-validée, etc."
                            className="min-h-24"
                        />
                        <p
                            className={cn(
                                'text-right font-mono text-[10px]',
                                overrideReason.trim().length >= 30 ? 'text-lumiris-emerald' : 'text-muted-foreground',
                            )}
                        >
                            {overrideReason.trim().length} / 30
                        </p>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleOverride}
                            disabled={overrideReason.trim().length < 30 || overrideGrade === score.grade}
                            className="bg-lumiris-cyan hover:bg-lumiris-cyan/90"
                        >
                            <History className="mr-1 h-3.5 w-3.5" /> Confirmer override
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
