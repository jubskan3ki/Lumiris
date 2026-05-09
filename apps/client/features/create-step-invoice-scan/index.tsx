'use client';

/**
 * Étape 3 du wizard — Scan de facture fournisseur.
 *
 * UX clé : l'artisan glisse une facture (PDF/JPG/PNG), lance l'OCR, on lui montre
 * un mock d'extraction (`OcrExtraction` aléatoire issue de @lumiris/mock-data/invoices),
 * il pré-remplit la composition (en *complétant* — n'écrase pas).
 *
 * @see docs/PIVOT-PLAN.md — l'OCR réel se branchera dans apps/api lors de la vague V5
 *      (Mistral OCR ou Tesseract — décision encore ouverte).
 */

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CheckCircle2, FileUp, Loader2, ScanLine, Sparkles } from 'lucide-react';
import { mockInvoices } from '@lumiris/mock-data';
import type { Fiber, Material, OcrExtraction, SupplierInvoice } from '@lumiris/types';
import { Alert, AlertDescription, AlertTitle } from '@lumiris/ui/components/alert';
import { Button } from '@lumiris/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@lumiris/ui/components/card';
import { WizardShell } from '@/features/wizard-shell';
import { useDraftStore } from '@/lib/draft-store';

const OCR_MOCK_LATENCY_MS = 1500;

export function CreateStepInvoiceScan({ draftId }: { draftId: string }) {
    const router = useRouter();
    const draft = useDraftStore((s) => s.drafts[draftId]);
    const setMaterials = useDraftStore((s) => s.setMaterials);
    const setLastStep = useDraftStore((s) => s.setLastStep);

    const [file, setFile] = useState<File | null>(null);
    const [running, setRunning] = useState(false);
    const [extracted, setExtracted] = useState<{ source: SupplierInvoice; data: OcrExtraction } | null>(null);
    const [merged, setMerged] = useState(false);

    if (!draft) {
        return (
            <WizardShell draftId={draftId} step="invoice">
                {null}
            </WizardShell>
        );
    }

    const runOcr = () => {
        setRunning(true);
        setExtracted(null);
        setMerged(false);
        // Pioche dans le pool des factures qui ont déjà une OcrExtraction.
        const candidates = mockInvoices.filter((i) => i.ocrExtracted !== null);
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        window.setTimeout(() => {
            if (pick && pick.ocrExtracted) {
                setExtracted({ source: pick, data: pick.ocrExtracted });
            }
            setRunning(false);
        }, OCR_MOCK_LATENCY_MS);
    };

    const prefillComposition = () => {
        if (!extracted) return;
        const newRows: Material[] = extracted.data.lineItems.map((item) => ({
            fiber: (item.fiber ?? 'other') as Fiber,
            percentage: 0,
            supplierId: extracted.source.supplierId,
            originCountry: 'FR',
            certifications: [],
            invoiceRef: extracted.source.id,
        }));
        // Ne remplace pas — concatène. L'artisan ajustera les pourcentages côté composition.
        setMaterials(draftId, [...draft.materials, ...newRows]);
        setMerged(true);
    };

    const goNext = () => {
        setLastStep(draftId, 'invoice');
        router.push(`/create/${draftId}/manufacturing`);
    };

    return (
        <WizardShell
            draftId={draftId}
            step="invoice"
            onPrev={() => router.push(`/create/${draftId}/composition`)}
            onNext={goNext}
            nextLabel="Étape suivante"
        >
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ScanLine className="text-lumiris-emerald h-4 w-4" /> Scan de facture
                    </CardTitle>
                    <p className="text-muted-foreground text-sm">
                        Importez une facture fournisseur. L’OCR extrait fournisseur, fibres et quantités.
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <label className="border-border bg-muted/40 hover:bg-muted relative flex h-44 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed transition-colors">
                        <FileUp className="text-muted-foreground h-6 w-6" />
                        <p className="text-foreground text-sm font-medium">
                            {file ? file.name : 'Glissez une facture ici'}
                        </p>
                        <p className="text-muted-foreground text-xs">PDF · JPG · PNG</p>
                        <input
                            type="file"
                            accept="application/pdf,image/*"
                            aria-label="Importer une facture fournisseur"
                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            className="absolute inset-0 cursor-pointer opacity-0"
                        />
                    </label>

                    <div className="flex items-center gap-3">
                        <Button onClick={runOcr} disabled={running}>
                            {running ? (
                                <>
                                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Analyse en cours…
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-1.5 h-4 w-4" /> Lancer l’OCR
                                </>
                            )}
                        </Button>
                        <p className="text-muted-foreground text-xs">
                            Mock — la version V5 branchera Mistral OCR ou Tesseract via apps/api.
                        </p>
                    </div>

                    {extracted && (
                        <Card className="border-lumiris-emerald/30 bg-lumiris-emerald/5">
                            <CardHeader className="pb-2">
                                <p className="text-lumiris-emerald flex items-center gap-1.5 text-xs font-semibold">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> OCR — champs reconnus
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <ReadOnlyField label="Fournisseur" value={extracted.data.supplierName} />
                                <ReadOnlyField label="Date facture" value={extracted.data.invoiceDate} />
                                <ReadOnlyField
                                    label="Total HT"
                                    value={`${extracted.data.totalHt.toLocaleString('fr-FR')} ${extracted.data.currency}`}
                                />
                                <div>
                                    <p className="text-muted-foreground mb-1.5 text-[11px] uppercase tracking-wider">
                                        Lignes
                                    </p>
                                    <ul className="space-y-1">
                                        {extracted.data.lineItems.map((item, i) => (
                                            <li
                                                key={i}
                                                className="border-border bg-card flex items-center justify-between rounded-md border px-3 py-2 text-xs"
                                            >
                                                <span>
                                                    <span className="text-foreground font-medium">{item.label}</span>
                                                    {item.fiber && (
                                                        <span className="text-muted-foreground ml-2">
                                                            ({item.fiber})
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="text-muted-foreground font-mono">
                                                    {item.qty} {item.unit}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Button
                                    onClick={prefillComposition}
                                    variant="outline"
                                    className="border-lumiris-emerald/40 text-lumiris-emerald hover:bg-lumiris-emerald/10"
                                    disabled={merged}
                                >
                                    {merged ? 'Composition complétée ✓' : 'Pré-remplir la composition'}
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {merged && (
                        <Alert>
                            <AlertTitle>Lignes ajoutées à la composition</AlertTitle>
                            <AlertDescription>
                                Retournez à l’étape composition pour ajuster les pourcentages avant de poursuivre.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </WizardShell>
    );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground text-[11px] uppercase tracking-wider">{label}</span>
            <span className="text-foreground font-medium">{value}</span>
        </div>
    );
}
