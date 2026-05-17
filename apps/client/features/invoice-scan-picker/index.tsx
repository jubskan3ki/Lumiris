'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, FileText, Loader2, Plus, Sparkles, Trash2 } from 'lucide-react';
import type { Fiber, SupplierInvoice } from '@lumiris/types';
import { Badge } from '@lumiris/ui/components/badge';
import { Button } from '@lumiris/ui/components/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@lumiris/ui/components/dialog';
import { Input } from '@lumiris/ui/components/input';
import { Label } from '@lumiris/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@lumiris/ui/components/select';
import { cn } from '@lumiris/ui/lib/cn';
import { mockSuppliers } from '@lumiris/mock-data';
import { buildInitialRows, listArtisanInvoices } from './merge';
import type { DraftRow, ExtractedRow } from './merge';

const OCR_SIM_LATENCY_MS = 800;

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

export interface InvoiceScanPickerBodyProps {
    artisanId: string;
    onInject: (rows: readonly ExtractedRow[]) => void;
    injectLabel?: string;
}

export function InvoiceScanPickerBody({
    artisanId,
    onInject,
    injectLabel = 'Injecter dans la composition',
}: InvoiceScanPickerBodyProps) {
    const artisanInvoices = useMemo(() => listArtisanInvoices(artisanId), [artisanId]);

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [extracting, setExtracting] = useState(false);
    const [rows, setRows] = useState<DraftRow[] | null>(null);

    const selected = useMemo(
        () => artisanInvoices.find((i) => i.id === selectedId) ?? null,
        [artisanInvoices, selectedId],
    );

    useEffect(() => {
        setRows(null);
        setExtracting(false);
    }, [selectedId]);

    const runExtraction = () => {
        if (!selected) return;
        setExtracting(true);
        window.setTimeout(() => {
            setRows(buildInitialRows(selected));
            setExtracting(false);
        }, OCR_SIM_LATENCY_MS);
    };

    const updateRow = (idx: number, patch: Partial<DraftRow>) => {
        setRows((cur) => (cur ? cur.map((r, i) => (i === idx ? { ...r, ...patch } : r)) : cur));
    };
    const removeRow = (idx: number) => setRows((cur) => (cur ? cur.filter((_, i) => i !== idx) : cur));
    const addRow = () =>
        setRows((cur) => [...(cur ?? []), { fiber: 'linen', percentage: 0, supplierId: selected?.supplierId ?? '' }]);

    const inject = () => {
        if (!rows || !selected) return;
        const enriched: ExtractedRow[] = rows.map((r) => ({ ...r, invoiceRef: selected.id }));
        onInject(enriched);
    };

    return (
        <div className="grid gap-4 md:grid-cols-[2fr_3fr]">
            <InvoiceList invoices={artisanInvoices} selectedId={selectedId} onSelect={(id) => setSelectedId(id)} />
            <ExtractionPanel
                selected={selected}
                extracting={extracting}
                rows={rows}
                injectLabel={injectLabel}
                onRunExtraction={runExtraction}
                onAddRow={addRow}
                onUpdateRow={updateRow}
                onRemoveRow={removeRow}
                onInject={inject}
            />
        </div>
    );
}

export interface InvoiceScanPickerProps {
    artisanId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onInject: (rows: readonly ExtractedRow[]) => void;
}

export function InvoiceScanPicker({ artisanId, open, onOpenChange, onInject }: InvoiceScanPickerProps) {
    const handleInject = (rows: readonly ExtractedRow[]) => {
        onInject(rows);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Pré-remplir depuis une facture</DialogTitle>
                    <DialogDescription>
                        Sélectionnez une facture fournisseur et lancez l’extraction simulée pour injecter les lignes
                        dans la composition. L’extraction est simulée en mode démo.
                    </DialogDescription>
                </DialogHeader>
                <InvoiceScanPickerBody artisanId={artisanId} onInject={handleInject} injectLabel="Injecter et fermer" />
            </DialogContent>
        </Dialog>
    );
}

function InvoiceList({
    invoices,
    selectedId,
    onSelect,
}: {
    invoices: readonly SupplierInvoice[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}) {
    if (invoices.length === 0) {
        return (
            <div className="border-border bg-muted/30 text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
                Aucune facture liée à votre atelier pour l’instant. En production, importez vos PDF fournisseurs.
            </div>
        );
    }
    return (
        <div className="space-y-2">
            <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
                Factures de l’atelier ({invoices.length})
            </p>
            <ul className="space-y-2">
                {invoices.map((inv) => {
                    const active = inv.id === selectedId;
                    const ocr = inv.ocrExtracted;
                    return (
                        <li key={inv.id}>
                            <button
                                type="button"
                                onClick={() => onSelect(inv.id)}
                                className={cn(
                                    'border-border bg-card hover:bg-muted/50 flex w-full flex-col gap-2 rounded-lg border p-3 text-left transition-colors',
                                    active &&
                                        'border-lumiris-emerald/60 bg-lumiris-emerald/5 ring-lumiris-emerald/20 ring-2',
                                )}
                                aria-pressed={active}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-foreground truncate text-sm font-medium">
                                            {ocr?.supplierName ?? supplierLabel(inv.supplierId)}
                                        </p>
                                        <p className="text-muted-foreground truncate font-mono text-[11px]">{inv.id}</p>
                                    </div>
                                    {ocr ? (
                                        <Badge
                                            variant="outline"
                                            className="border-lumiris-emerald/40 bg-lumiris-emerald/10 text-lumiris-emerald shrink-0 font-mono text-[10px]"
                                        >
                                            OCR ✓
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="outline"
                                            className="border-lumiris-amber/40 bg-lumiris-amber/10 text-lumiris-amber shrink-0 font-mono text-[10px]"
                                        >
                                            OCR à faire
                                        </Badge>
                                    )}
                                </div>
                                <div className="text-muted-foreground flex items-center justify-between text-[11px]">
                                    <span>
                                        {ocr ? ocr.invoiceDate : new Date(inv.uploadedAt).toLocaleDateString('fr-FR')}
                                    </span>
                                    <span className="font-mono">
                                        {ocr ? `${ocr.totalHt.toLocaleString('fr-FR')} ${ocr.currency}` : '—'}
                                    </span>
                                </div>
                                {active && (
                                    <span className="text-lumiris-emerald text-[11px] font-medium">Sélectionnée</span>
                                )}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

interface ExtractionPanelProps {
    selected: SupplierInvoice | null;
    extracting: boolean;
    rows: DraftRow[] | null;
    injectLabel: string;
    onRunExtraction: () => void;
    onAddRow: () => void;
    onUpdateRow: (idx: number, patch: Partial<DraftRow>) => void;
    onRemoveRow: (idx: number) => void;
    onInject: () => void;
}

function ExtractionPanel({
    selected,
    extracting,
    rows,
    injectLabel,
    onRunExtraction,
    onAddRow,
    onUpdateRow,
    onRemoveRow,
    onInject,
}: ExtractionPanelProps) {
    if (!selected) {
        return (
            <div className="border-border bg-muted/20 text-muted-foreground min-h-70 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center text-sm">
                <FileText className="h-6 w-6" />
                <p>Sélectionnez une facture à gauche pour démarrer l’extraction.</p>
            </div>
        );
    }

    const hasDataUri = selected.fileUrl.startsWith('data:image/');
    const ocr = selected.ocrExtracted;
    const totalPct = (rows ?? []).reduce((s, r) => s + (Number(r.percentage) || 0), 0);

    return (
        <div className="border-border bg-card space-y-4 rounded-lg border p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-foreground text-sm font-medium">
                        {ocr?.supplierName ?? supplierLabel(selected.supplierId)}
                    </p>
                    <p className="text-muted-foreground font-mono text-[11px]">{selected.id}</p>
                </div>
                {ocr && (
                    <p className="text-muted-foreground text-[11px]">
                        Total HT{' '}
                        <span className="text-foreground font-mono">
                            {ocr.totalHt.toLocaleString('fr-FR')} {ocr.currency}
                        </span>
                    </p>
                )}
            </div>

            {hasDataUri && (
                <div className="border-border relative h-40 overflow-hidden rounded-md border">
                    <Image
                        src={selected.fileUrl}
                        alt={`Aperçu facture ${selected.id}`}
                        fill
                        unoptimized
                        sizes="(min-width: 768px) 60vw, 100vw"
                        className="object-cover"
                    />
                </div>
            )}

            {rows === null ? (
                <div className="flex flex-col items-start gap-2">
                    <Button onClick={onRunExtraction} disabled={extracting}>
                        {extracting ? (
                            <>
                                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Extraction…
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-1.5 h-4 w-4" /> Simuler l’extraction
                            </>
                        )}
                    </Button>
                    <p className="text-muted-foreground text-[11px]">
                        L’extraction simulée pré-remplit la table fibres × % × fournisseur que vous pourrez ajuster.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-foreground flex items-center gap-1.5 text-xs font-medium">
                            <CheckCircle2 className="text-lumiris-emerald h-3.5 w-3.5" />
                            {rows.length} ligne{rows.length > 1 ? 's' : ''} extraite{rows.length > 1 ? 's' : ''}
                        </p>
                        <p className="text-muted-foreground font-mono text-[11px]">somme {totalPct.toFixed(0)} %</p>
                    </div>

                    <div className="space-y-2">
                        {rows.map((row, idx) => (
                            <ExtractionRow
                                key={idx}
                                row={row}
                                onChange={(patch) => onUpdateRow(idx, patch)}
                                onRemove={() => onRemoveRow(idx)}
                            />
                        ))}
                    </div>

                    <Button variant="outline" size="sm" onClick={onAddRow}>
                        <Plus className="mr-1.5 h-3.5 w-3.5" /> Ajouter une ligne
                    </Button>

                    <Button
                        onClick={onInject}
                        className="bg-lumiris-emerald hover:bg-lumiris-emerald/90 w-full text-white"
                    >
                        {injectLabel}
                    </Button>
                    <p className="text-muted-foreground text-[11px]">
                        Les lignes sont fusionnées (dédupliquées par fibre + fournisseur, somme cap à 100 %), puis vous
                        pourrez ajuster la composition manuellement.
                    </p>
                </div>
            )}
        </div>
    );
}

function ExtractionRow({
    row,
    onChange,
    onRemove,
}: {
    row: DraftRow;
    onChange: (patch: Partial<DraftRow>) => void;
    onRemove: () => void;
}) {
    return (
        <div className="bg-muted/30 grid gap-2 rounded-md p-2 sm:grid-cols-[1.5fr_80px_1.5fr_auto]">
            <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider">Fibre</Label>
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
            <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider">%</Label>
                <Input
                    type="number"
                    min={0}
                    max={100}
                    value={row.percentage || ''}
                    onChange={(e) => onChange({ percentage: Number(e.target.value) || 0 })}
                />
            </div>
            <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider">Fournisseur</Label>
                <Select
                    value={row.supplierId || '__none'}
                    onValueChange={(v) => onChange({ supplierId: v === '__none' ? '' : v })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Choisir…" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="__none">- Aucun</SelectItem>
                        {mockSuppliers.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                                {s.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-end justify-end">
                <Button variant="ghost" size="icon" onClick={onRemove} aria-label="Supprimer la ligne">
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}

function supplierLabel(id: string): string {
    return mockSuppliers.find((s) => s.id === id)?.name ?? id;
}
