'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, FileUp, Plus, ShieldAlert, Trash2 } from 'lucide-react';
import { getEffectiveStatus } from '@lumiris/types';
import type { CertificationKind, CertificationRef, PassportWarranty } from '@lumiris/types';
import { Alert, AlertDescription, AlertTitle } from '@lumiris/ui/components/alert';
import { Button } from '@lumiris/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@lumiris/ui/components/card';
import { Checkbox } from '@lumiris/ui/components/checkbox';
import { Input } from '@lumiris/ui/components/input';
import { Label } from '@lumiris/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@lumiris/ui/components/select';
import { Textarea } from '@lumiris/ui/components/textarea';
import { WizardShell } from '@/features/wizard-shell';
import { useStepNavigation } from '@/features/wizard-shell/use-step-navigation';
import { useDraftStore } from '@/lib/draft-store';
import { readFileAsDataUrl } from '@lumiris/utils';
import { validateStep } from './schema';

const CERT_KINDS: readonly CertificationKind[] = [
    'GOTS',
    'OEKO-TEX',
    'OFG',
    'EPV',
    'GRS',
    'BLUESIGN',
    'ISO-14001',
    'CUSTOM',
];

function newCert(): CertificationRef {
    const today = new Date();
    const exp = new Date(today);
    exp.setFullYear(today.getFullYear() + 2);
    return {
        id: `cert-draft-${Math.random().toString(36).slice(2, 8)}`,
        kind: 'GOTS',
        issuer: '',
        issuedAt: today.toISOString(),
        expiresAt: exp.toISOString(),
        verified: false,
        fileUrl: '',
    };
}

export function CreateStepCertifications({ draftId }: { draftId: string }) {
    const draft = useDraftStore((s) => s.drafts[draftId]);
    const setCertifications = useDraftStore((s) => s.setCertifications);
    const setWarranty = useDraftStore((s) => s.setWarranty);
    const { goNext, goTo } = useStepNavigation(draftId);

    const [certs, setCerts] = useState<CertificationRef[]>(
        draft?.certifications.length ? [...draft.certifications] : [],
    );
    const [warranty, setLocalWarranty] = useState<PassportWarranty>(
        draft?.warranty ?? { durationMonths: 12, terms: '' },
    );

    const updateCert = (idx: number, patch: Partial<CertificationRef>) => {
        setCerts((cur) => cur.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
    };

    const validation = useMemo(
        () =>
            validateStep({
                garment: draft?.garment ?? {
                    kind: 'sweater',
                    reference: '',
                    mainPhotoUrl: '',
                    dimensions: {},
                    retailPrice: 0,
                    currency: 'EUR',
                },
                materials: draft?.materials ?? [],
                steps: draft?.steps ?? [],
                certifications: certs,
                warranty,
            }),
        [certs, warranty, draft],
    );
    const nextMissing = validation.ok ? [] : validation.missing;

    const handleNext = () => {
        setCertifications(draftId, certs);
        setWarranty(draftId, warranty);
        goNext('certifications', 'publish');
    };

    return (
        <WizardShell
            draftId={draftId}
            step="certifications"
            onPrev={() => goTo('manufacturing')}
            onNext={handleNext}
            nextMissing={nextMissing}
        >
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Certifications &amp; garanties du produit</CardTitle>
                        <p className="text-muted-foreground text-sm">
                            Certifications spécifiques à cette pièce (lot GOTS, attestation matière) et garantie offerte
                            au client. Pour les certifications d’atelier réutilisables (EPV, OFG, ISO), utilisez{' '}
                            <a
                                href="/certifications"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-foreground underline-offset-2 hover:underline"
                            >
                                votre catalogue d’atelier
                            </a>
                            .
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {certs.length === 0 && (
                            <p className="text-muted-foreground rounded-md border border-dashed py-6 text-center text-sm">
                                Aucune certification rattachée pour l’instant.
                            </p>
                        )}
                        {certs.map((cert, idx) => (
                            <CertRow
                                key={cert.id}
                                cert={cert}
                                onChange={(patch) => updateCert(idx, patch)}
                                onRemove={() => setCerts((cur) => cur.filter((_, i) => i !== idx))}
                            />
                        ))}
                        <Button variant="outline" size="sm" onClick={() => setCerts((cur) => [...cur, newCert()])}>
                            <Plus className="mr-1.5 h-3.5 w-3.5" /> Ajouter une certification
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Garantie</CardTitle>
                        <p className="text-muted-foreground text-sm">
                            Durée et termes - pèse 35% du sous-score Réparabilité.
                        </p>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-[160px_1fr]">
                        <div className="space-y-1.5">
                            <Label htmlFor="dur">Durée (mois)</Label>
                            <Input
                                id="dur"
                                type="number"
                                min={0}
                                value={warranty.durationMonths || ''}
                                onChange={(e) =>
                                    setLocalWarranty((w) => ({
                                        ...w,
                                        durationMonths: Number(e.target.value) || 0,
                                    }))
                                }
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="terms">Termes</Label>
                            <Textarea
                                id="terms"
                                rows={4}
                                value={warranty.terms}
                                onChange={(e) => setLocalWarranty((w) => ({ ...w, terms: e.target.value }))}
                                placeholder="Ex. réparation gratuite des coutures pendant 24 mois."
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </WizardShell>
    );
}

interface CertRowProps {
    cert: CertificationRef;
    onChange: (patch: Partial<CertificationRef>) => void;
    onRemove: () => void;
}

function CertRow({ cert, onChange, onRemove }: CertRowProps) {
    const status = getEffectiveStatus(cert, new Date());

    const handleFile = async (file: File | undefined) => {
        if (!file) return;
        const dataUrl = await readFileAsDataUrl(file);
        onChange({ fileUrl: dataUrl });
    };

    return (
        <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
                <p className="text-foreground text-sm font-medium">{cert.kind}</p>
                <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Supprimer">
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1.5">
                    <Label>Type</Label>
                    <Select value={cert.kind} onValueChange={(v) => onChange({ kind: v as CertificationKind })}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {CERT_KINDS.map((k) => (
                                <SelectItem key={k} value={k}>
                                    {k}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label>Organisme</Label>
                    <Input value={cert.issuer} onChange={(e) => onChange({ issuer: e.target.value })} />
                </div>
                {cert.kind === 'CUSTOM' && (
                    <div className="space-y-1.5">
                        <Label>Nom personnalisé</Label>
                        <Input
                            value={cert.customName ?? ''}
                            onChange={(e) => onChange({ customName: e.target.value })}
                        />
                    </div>
                )}
                <div className="space-y-1.5">
                    <Label>Émise le</Label>
                    <Input
                        type="date"
                        value={cert.issuedAt.slice(0, 10)}
                        onChange={(e) => onChange({ issuedAt: new Date(e.target.value).toISOString() })}
                    />
                </div>
                <div className="space-y-1.5">
                    <Label>Expire le</Label>
                    <Input
                        type="date"
                        value={cert.expiresAt.slice(0, 10)}
                        onChange={(e) => onChange({ expiresAt: new Date(e.target.value).toISOString() })}
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor={`cert-file-${cert.id}`}>Fichier PDF</Label>
                    <label
                        htmlFor={`cert-file-${cert.id}`}
                        className="border-border bg-card text-muted-foreground hover:bg-muted relative flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border text-xs"
                    >
                        <FileUp className="h-3.5 w-3.5" />
                        {cert.fileUrl ? 'Fichier chargé' : 'Importer'}
                        <input
                            id={`cert-file-${cert.id}`}
                            type="file"
                            accept="application/pdf"
                            aria-label="Importer le PDF de la certification"
                            className="absolute inset-0 cursor-pointer opacity-0"
                            onChange={(e) => handleFile(e.target.files?.[0])}
                        />
                    </label>
                </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
                <Checkbox
                    id={`cert-verified-${cert.id}`}
                    checked={cert.verified}
                    onCheckedChange={(v) => onChange({ verified: Boolean(v) })}
                />
                <Label htmlFor={`cert-verified-${cert.id}`} className="text-foreground font-normal">
                    Vérifié (l’organisme confirme l’authenticité)
                </Label>
            </div>

            {status === 'Expired' && (
                <Alert className="border-lumiris-rose/30 bg-lumiris-rose/5 text-lumiris-rose">
                    <AlertTriangle aria-hidden />
                    <AlertTitle>Certification expirée</AlertTitle>
                    <AlertDescription>
                        Cette certification sera ignorée dans le calcul du score (poids 0).
                    </AlertDescription>
                </Alert>
            )}
            {status === 'Unverified' && (
                <Alert className="border-lumiris-amber/30 bg-lumiris-amber/5 text-lumiris-amber">
                    <ShieldAlert aria-hidden />
                    <AlertTitle>Certification non vérifiée</AlertTitle>
                    <AlertDescription>
                        Tant qu’elle n’est pas vérifiée, elle pèse × 0.5 dans le sous-score Savoir-faire.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
