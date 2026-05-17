'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, ScanLine, Trash2 } from 'lucide-react';
import { getEffectiveStatus } from '@lumiris/types';
import type { CertificationRef, Fiber, Material } from '@lumiris/types';
import { mockInvoices, mockSuppliers } from '@lumiris/mock-data';
import { COUNTRIES } from '@lumiris/utils';
import { Alert, AlertDescription, AlertTitle } from '@lumiris/ui/components/alert';
import { Badge } from '@lumiris/ui/components/badge';
import { Button } from '@lumiris/ui/components/button';
import { Checkbox } from '@lumiris/ui/components/checkbox';
import { Input } from '@lumiris/ui/components/input';
import { Label } from '@lumiris/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@lumiris/ui/components/select';
import { WizardStepFrame } from '@/features/wizard-shell/step-frame';
import { useStepNavigation } from '@/features/wizard-shell/use-step-navigation';
import { InvoiceScanPicker } from '@/features/invoice-scan-picker';
import { mergeMaterials } from '@/features/invoice-scan-picker/merge';
import { useCertificatesForArtisan } from '@/lib/certificates-store';
import { useCurrentArtisan } from '@/lib/current-artisan';
import { useDraftStore } from '@/lib/draft-store';
import { validateStep } from './schema';

const FIBERS: ReadonlyArray<{ value: Fiber; label: string }> = [
    { value: 'wool', label: 'Laine' },
    { value: 'linen', label: 'Lin' },
    { value: 'cotton', label: 'Coton' },
    { value: 'silk', label: 'Soie' },
    { value: 'hemp', label: 'Chanvre' },
    { value: 'cashmere', label: 'Cachemire' },
    { value: 'recycled-polyester', label: 'Polyester recyclé' },
    { value: 'other', label: 'Autre' },
];

function newRow(): Material {
    return {
        fiber: 'linen',
        percentage: 0,
        supplierId: '',
        originCountry: 'FR',
        certifications: [],
    };
}

export function CreateStepComposition({ draftId }: { draftId: string }) {
    const draft = useDraftStore((s) => s.drafts[draftId]);
    const setMaterials = useDraftStore((s) => s.setMaterials);
    const { goNext, goTo } = useStepNavigation(draftId);
    const artisan = useCurrentArtisan();
    const artisanCerts = useCertificatesForArtisan(artisan.id);

    const now = useMemo(() => new Date(), []);
    const availableCerts = useMemo<CertificationRef[]>(
        () =>
            artisanCerts.filter((c) => {
                if (getEffectiveStatus(c, now) === 'Expired') return false;
                if (c.kind === 'CUSTOM' && !c.customName) return false;
                return true;
            }),
        [artisanCerts, now],
    );

    const [rows, setRows] = useState<Material[]>(draft?.materials.length ? [...draft.materials] : [newRow()]);
    const [scanOpen, setScanOpen] = useState(false);

    useEffect(() => {
        if (draft && draft.materials.length > 0) setRows([...draft.materials]);
    }, [draft]);

    const total = useMemo(() => rows.reduce((sum, r) => sum + (Number(r.percentage) || 0), 0), [rows]);
    const sumValid = Math.abs(total - 100) < 1;

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
                materials: rows,
                steps: draft?.steps ?? [],
                certifications: draft?.certifications ?? [],
                warranty: draft?.warranty ?? { durationMonths: 0, terms: '' },
            }),
        [rows, draft],
    );
    const nextMissing = validation.ok ? [] : validation.missing;

    const updateRow = (idx: number, patch: Partial<Material>) => {
        setRows((rs) => rs.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
    };

    const handleNext = () => {
        setMaterials(draftId, rows);
        goNext('composition', 'invoice');
    };

    return (
        <WizardStepFrame
            draftId={draftId}
            step="composition"
            title="Composition fibres"
            subtitle="La somme des pourcentages doit valoir 100. Chaque fibre référence un fournisseur et un pays."
            onPrev={() => goTo('identification')}
            onNext={handleNext}
            nextMissing={nextMissing}
            contentClassName="space-y-4"
        >
            {!sumValid && (
                <Alert className="border-lumiris-amber/30 bg-lumiris-amber/5 text-lumiris-amber">
                    <AlertTitle>Somme des pourcentages : {total.toFixed(0)}%</AlertTitle>
                    <AlertDescription>Ajustez pour atteindre 100% avant de passer à l’étape suivante.</AlertDescription>
                </Alert>
            )}

            <div className="border-lumiris-emerald/30 bg-lumiris-emerald/5 flex flex-col gap-2 rounded-lg border border-dashed p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-foreground text-sm font-medium">Accélérateur — pré-remplir depuis une facture</p>
                    <p className="text-muted-foreground text-[11px]">
                        Scannez une facture fournisseur pour générer une amorce de composition (extraction simulée en
                        mode démo).
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setScanOpen(true)}
                    className="border-lumiris-emerald/40 text-lumiris-emerald hover:bg-lumiris-emerald/10 shrink-0"
                >
                    <ScanLine className="mr-1.5 h-3.5 w-3.5" />
                    Scanner une facture
                </Button>
            </div>

            <InvoiceScanPicker
                artisanId={artisan.id}
                open={scanOpen}
                onOpenChange={setScanOpen}
                onInject={(extracted) => setRows((cur) => mergeMaterials(cur, extracted))}
            />

            <div className="space-y-3">
                {rows.map((row, idx) => (
                    <FiberRow
                        key={idx}
                        row={row}
                        idx={idx}
                        availableCerts={availableCerts}
                        onChange={(patch) => updateRow(idx, patch)}
                        onRemove={() => setRows((rs) => rs.filter((_, i) => i !== idx))}
                    />
                ))}
            </div>

            <Button variant="outline" size="sm" onClick={() => setRows((rs) => [...rs, newRow()])}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Ajouter une fibre
            </Button>
        </WizardStepFrame>
    );
}

interface FiberRowProps {
    row: Material;
    idx: number;
    availableCerts: readonly CertificationRef[];
    onChange: (patch: Partial<Material>) => void;
    onRemove: () => void;
}

function FiberRow({ row, idx, availableCerts, onChange, onRemove }: FiberRowProps) {
    const linkedInvoices = mockInvoices.filter((i) => i.supplierId === row.supplierId);
    const supplierMatchesFiber = mockSuppliers.filter((s) => s.fibers.includes(row.fiber));

    return (
        <div className="border-border bg-muted/30 space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
                <p className="text-foreground text-sm font-medium">Fibre #{idx + 1}</p>
                <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Supprimer">
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5">
                    <Label>Fibre</Label>
                    <Select value={row.fiber} onValueChange={(v) => onChange({ fiber: v as Fiber })}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {FIBERS.map((f) => (
                                <SelectItem key={f.value} value={f.value}>
                                    {f.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label>Pourcentage</Label>
                    <div className="relative">
                        <Input
                            type="number"
                            min={0}
                            max={100}
                            value={row.percentage || ''}
                            onChange={(e) => onChange({ percentage: Number(e.target.value) || 0 })}
                        />
                        <span className="text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 text-xs">
                            %
                        </span>
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label>Fournisseur</Label>
                    <Select
                        value={row.supplierId || '__none'}
                        onValueChange={(v) => onChange({ supplierId: v === '__none' ? '' : v })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Choisir…" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__none">- Aucun</SelectItem>
                            {(supplierMatchesFiber.length > 0 ? supplierMatchesFiber : mockSuppliers).map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                    {s.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label>Origine</Label>
                    <Select value={row.originCountry} onValueChange={(v) => onChange({ originCountry: v })}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {COUNTRIES.map((c) => (
                                <SelectItem key={c.code} value={c.code}>
                                    {c.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                    <Label>Certifications fibre</Label>
                    <div className="bg-card space-y-1.5 rounded-md border p-2">
                        {availableCerts.length === 0 ? (
                            <p className="text-muted-foreground px-1 py-0.5 text-xs">
                                Aucun certificat d’atelier disponible — ajoutez-en depuis{' '}
                                <Link href="/certifications" className="text-foreground underline">
                                    Mes certifications
                                </Link>
                                .
                            </p>
                        ) : (
                            availableCerts.map((c) => {
                                const checked = row.certifications.some((rc) => rc.id === c.id);
                                const label = c.kind === 'CUSTOM' ? (c.customName ?? c.kind) : c.kind;
                                return (
                                    <label key={c.id} className="flex items-center gap-2 text-xs">
                                        <Checkbox
                                            checked={checked}
                                            onCheckedChange={(v) => {
                                                const next = v
                                                    ? [...row.certifications, c]
                                                    : row.certifications.filter((rc) => rc.id !== c.id);
                                                onChange({ certifications: next });
                                            }}
                                        />
                                        <span className="text-foreground">{label}</span>
                                        <span className="text-muted-foreground truncate">- {c.scope ?? c.issuer}</span>
                                    </label>
                                );
                            })
                        )}
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label>Facture liée (optionnel)</Label>
                    <Select
                        value={row.invoiceRef ?? '__none'}
                        onValueChange={(v) => onChange({ invoiceRef: v === '__none' ? undefined : v })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Aucune" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__none">- Aucune</SelectItem>
                            {linkedInvoices.map((i) => (
                                <SelectItem key={i.id} value={i.id}>
                                    {i.id} {i.ocrExtracted ? `· ${i.ocrExtracted.supplierName}` : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {row.certifications.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                            {row.certifications.map((c) => (
                                <Badge key={c.id} variant="secondary" className="text-[10px]">
                                    {c.kind}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
