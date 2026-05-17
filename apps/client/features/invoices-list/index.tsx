'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
    ArrowDown,
    ArrowUp,
    ExternalLink,
    Eye,
    FileText,
    Loader2,
    Plus,
    ReceiptText,
    RefreshCcw,
    RotateCcw,
    Search,
    Trash2,
} from 'lucide-react';
import { Badge } from '@lumiris/ui/components/badge';
import { Button } from '@lumiris/ui/components/button';
import { Card, CardContent } from '@lumiris/ui/components/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@lumiris/ui/components/dialog';
import { Input } from '@lumiris/ui/components/input';
import { Label } from '@lumiris/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@lumiris/ui/components/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@lumiris/ui/components/sheet';
import { Toaster } from '@lumiris/ui/components/sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@lumiris/ui/components/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@lumiris/ui/components/tooltip';
import { useCurrentArtisan } from '@/lib/current-artisan';
import {
    type InvoiceStatus,
    type InvoiceView,
    useInvoicesForArtisan,
    useInvoicesStore,
    usePassportsLinkedTo,
} from '@/lib/invoices-store';
import { mockSuppliers } from '@lumiris/mock-data';
import { EmptyState } from '@/features/empty-state';
import { genFibers } from './import-dialog';
import { ImportInvoiceDialog } from './import-dialog';

type StatusFilter = InvoiceStatus | 'all';
type SupplierFilter = string | 'all';
type SortKey = 'addedAt' | 'issuedAt';
type SortDir = 'asc' | 'desc';

const STATUS_LABELS: Record<InvoiceStatus, string> = {
    extracted: 'Extracted',
    pending: 'À traiter',
    failed: 'Échec',
};

export function InvoicesList() {
    const artisan = useCurrentArtisan();
    const artisanId = artisan.id;
    const invoices = useInvoicesForArtisan(artisanId);
    const updateExtraction = useInvoicesStore((s) => s.updateExtraction);
    const removeInvoice = useInvoicesStore((s) => s.removeInvoice);

    const [importOpen, setImportOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [supplierFilter, setSupplierFilter] = useState<SupplierFilter>('all');
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('addedAt');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    const [previewInvoice, setPreviewInvoice] = useState<InvoiceView | null>(null);
    const [linkedSheet, setLinkedSheet] = useState<InvoiceView | null>(null);
    const [rescanning, setRescanning] = useState<Record<string, boolean>>({});

    const supplierOptions = useMemo(() => Array.from(new Set(invoices.map((i) => i.supplierId))), [invoices]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        const list = invoices.filter((inv) => {
            if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
            if (supplierFilter !== 'all' && inv.supplierId !== supplierFilter) return false;
            if (q) {
                const hay = `${inv.id} ${inv.notes ?? ''} ${inv.supplierName}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
        const sign = sortDir === 'asc' ? 1 : -1;
        return [...list].sort((a, b) => (a[sortKey] < b[sortKey] ? -1 : a[sortKey] > b[sortKey] ? 1 : 0) * sign);
    }, [invoices, statusFilter, supplierFilter, search, sortKey, sortDir]);

    const resetFilters = () => {
        setStatusFilter('all');
        setSupplierFilter('all');
        setSearch('');
        setSortKey('addedAt');
        setSortDir('desc');
    };

    const handleRescan = (inv: InvoiceView) => {
        if (!inv.isLocal) return;
        const supplier = mockSuppliers.find((s) => s.id === inv.supplierId);
        if (!supplier) return;
        setRescanning((cur) => ({ ...cur, [inv.id]: true }));
        window.setTimeout(() => {
            const rng = makeRng(seedHash(inv.id));
            const fibers = genFibers(supplier.fibers, rng);
            updateExtraction(inv.id, { status: 'extracted', fibers });
            setRescanning((cur) => {
                const { [inv.id]: _omit, ...rest } = cur;
                void _omit;
                return rest;
            });
        }, 800);
    };

    const isEmpty = invoices.length === 0;

    return (
        <div className="space-y-6 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-foreground text-2xl font-semibold tracking-tight">Factures fournisseurs</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {invoices.length} facture{invoices.length > 1 ? 's' : ''} dans votre atelier · scoping artisan
                        actif.
                    </p>
                </div>
                <Button onClick={() => setImportOpen(true)}>
                    <Plus className="mr-1.5 h-4 w-4" /> Importer une facture
                </Button>
            </div>

            {isEmpty ? (
                <EmptyState
                    icon={ReceiptText}
                    title="Aucune facture importée"
                    description="Importez vos factures fournisseurs pour justifier la composition de vos passeports et débloquer les fibres certifiées."
                    cta={{ label: 'Importer ma première facture', onClick: () => setImportOpen(true) }}
                />
            ) : (
                <>
                    <FilterBar
                        status={statusFilter}
                        onStatus={setStatusFilter}
                        supplier={supplierFilter}
                        onSupplier={setSupplierFilter}
                        supplierIds={supplierOptions}
                        search={search}
                        onSearch={setSearch}
                        sortKey={sortKey}
                        onSortKey={setSortKey}
                        sortDir={sortDir}
                        onSortDir={setSortDir}
                        onReset={resetFilters}
                    />

                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Référence</TableHead>
                                        <TableHead>Fournisseur</TableHead>
                                        <TableHead>Émise le</TableHead>
                                        <TableHead>Ajoutée le</TableHead>
                                        <TableHead>Total HT</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>Passeports liés</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={8}
                                                className="text-muted-foreground py-10 text-center text-sm"
                                            >
                                                <p>Aucune facture ne correspond aux filtres.</p>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={resetFilters}
                                                    className="mt-2"
                                                >
                                                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                                                    Réinitialiser les filtres
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filtered.map((inv) => (
                                            <InvoiceRow
                                                key={inv.id}
                                                invoice={inv}
                                                artisanId={artisanId}
                                                rescanning={!!rescanning[inv.id]}
                                                onView={() => setPreviewInvoice(inv)}
                                                onLinked={() => setLinkedSheet(inv)}
                                                onRescan={() => handleRescan(inv)}
                                                onDelete={() => removeInvoice(inv.id)}
                                            />
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </>
            )}

            <ImportInvoiceDialog open={importOpen} onOpenChange={setImportOpen} artisanId={artisanId} />
            <ExtractionDialog invoice={previewInvoice} onClose={() => setPreviewInvoice(null)} />
            <LinkedPassportsSheet invoice={linkedSheet} artisanId={artisanId} onClose={() => setLinkedSheet(null)} />
            <Toaster />
        </div>
    );
}

function FilterBar(props: {
    status: StatusFilter;
    onStatus: (v: StatusFilter) => void;
    supplier: SupplierFilter;
    onSupplier: (v: SupplierFilter) => void;
    supplierIds: readonly string[];
    search: string;
    onSearch: (v: string) => void;
    sortKey: SortKey;
    onSortKey: (v: SortKey) => void;
    sortDir: SortDir;
    onSortDir: (v: SortDir) => void;
    onReset: () => void;
}) {
    return (
        <div className="border-border bg-background sticky top-0 z-10 flex flex-wrap items-end gap-3 rounded-lg border p-3 shadow-sm">
            <div className="min-w-40">
                <Label className="text-muted-foreground text-[11px] uppercase tracking-wider">Statut OCR</Label>
                <Select value={props.status} onValueChange={(v) => props.onStatus(v as StatusFilter)}>
                    <SelectTrigger className="mt-1 w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="extracted">Extracted</SelectItem>
                        <SelectItem value="pending">À traiter</SelectItem>
                        <SelectItem value="failed">Échec</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="min-w-50">
                <Label className="text-muted-foreground text-[11px] uppercase tracking-wider">Fournisseur</Label>
                <Select value={props.supplier} onValueChange={(v) => props.onSupplier(v as SupplierFilter)}>
                    <SelectTrigger className="mt-1 w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        {props.supplierIds.map((id) => {
                            const name = mockSuppliers.find((s) => s.id === id)?.name ?? id;
                            return (
                                <SelectItem key={id} value={id}>
                                    {name}
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            </div>

            <div className="min-w-55 flex-1">
                <Label className="text-muted-foreground text-[11px] uppercase tracking-wider">Recherche</Label>
                <div className="relative mt-1">
                    <Search className="text-muted-foreground absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
                    <Input
                        value={props.search}
                        onChange={(e) => props.onSearch(e.target.value)}
                        placeholder="Référence, notes, fournisseur…"
                        className="pl-8"
                    />
                </div>
            </div>

            <div>
                <Label className="text-muted-foreground text-[11px] uppercase tracking-wider">Tri</Label>
                <div className="mt-1 flex items-center gap-1">
                    <Select value={props.sortKey} onValueChange={(v) => props.onSortKey(v as SortKey)}>
                        <SelectTrigger className="w-35">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="addedAt">Date ajout</SelectItem>
                            <SelectItem value="issuedAt">Date émission</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => props.onSortDir(props.sortDir === 'asc' ? 'desc' : 'asc')}
                        aria-label={props.sortDir === 'asc' ? 'Tri croissant' : 'Tri décroissant'}
                    >
                        {props.sortDir === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            <Button variant="ghost" size="sm" onClick={props.onReset} className="self-end">
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Réinitialiser
            </Button>
        </div>
    );
}

function InvoiceRow({
    invoice,
    artisanId,
    rescanning,
    onView,
    onLinked,
    onRescan,
    onDelete,
}: {
    invoice: InvoiceView;
    artisanId: string;
    rescanning: boolean;
    onView: () => void;
    onLinked: () => void;
    onRescan: () => void;
    onDelete: () => void;
}) {
    const linked = usePassportsLinkedTo(invoice.id, artisanId);
    return (
        <TableRow>
            <TableCell className="font-mono text-xs">
                <span className="flex items-center gap-1.5">
                    {invoice.id.length > 12 ? `${invoice.id.slice(0, 8)}…` : invoice.id}
                    {!invoice.isLocal && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge
                                    variant="outline"
                                    className="border-lumiris-amber/40 bg-lumiris-amber/10 text-lumiris-amber h-5 cursor-help px-1.5 text-[10px]"
                                >
                                    Démo
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>Facture de démonstration, non supprimable.</TooltipContent>
                        </Tooltip>
                    )}
                </span>
            </TableCell>
            <TableCell className="text-foreground">{invoice.supplierName}</TableCell>
            <TableCell className="text-muted-foreground text-xs">{formatDate(invoice.issuedAt)}</TableCell>
            <TableCell className="text-muted-foreground text-xs">{formatDate(invoice.addedAt)}</TableCell>
            <TableCell className="text-foreground text-xs font-medium">{formatEur(invoice.totalAmount)}</TableCell>
            <TableCell>
                <StatusBadge status={invoice.status} />
            </TableCell>
            <TableCell className="text-xs">
                {linked.length === 0 ? (
                    <span className="text-muted-foreground">-</span>
                ) : (
                    <button
                        type="button"
                        onClick={onLinked}
                        className="text-lumiris-emerald inline-flex items-center gap-1 hover:underline"
                    >
                        {linked.length} passeport{linked.length > 1 ? 's' : ''}
                        <ExternalLink className="h-3 w-3" />
                    </button>
                )}
            </TableCell>
            <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={onView}>
                        <Eye className="mr-1 h-3.5 w-3.5" /> Voir
                    </Button>
                    {invoice.isLocal && (
                        <>
                            <Button size="sm" variant="ghost" onClick={onRescan} disabled={rescanning}>
                                {rescanning ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <RefreshCcw className="h-3.5 w-3.5" />
                                )}
                                <span className="ml-1">Re-simuler</span>
                            </Button>
                            <Button size="sm" variant="ghost" onClick={onDelete} aria-label="Supprimer">
                                <Trash2 className="text-destructive h-3.5 w-3.5" />
                            </Button>
                        </>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
}

function StatusBadge({ status }: { status: InvoiceStatus }) {
    if (status === 'extracted') {
        return (
            <Badge className="border-lumiris-emerald/30 bg-lumiris-emerald/10 text-lumiris-emerald border">
                {STATUS_LABELS[status]}
            </Badge>
        );
    }
    if (status === 'failed') {
        return (
            <Badge variant="outline" className="border-destructive/40 text-destructive">
                {STATUS_LABELS[status]}
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="text-muted-foreground">
            {STATUS_LABELS[status]}
        </Badge>
    );
}

function ExtractionDialog({ invoice, onClose }: { invoice: InvoiceView | null; onClose: () => void }) {
    const isImage = invoice?.fileDataUri?.startsWith('data:image/');
    return (
        <Dialog open={!!invoice} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                {invoice && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Extraction · {invoice.supplierName}</DialogTitle>
                            <DialogDescription>
                                {formatDate(invoice.issuedAt)} · {formatEur(invoice.totalAmount)}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {invoice.fileDataUri ? (
                                isImage ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={invoice.fileDataUri}
                                        alt={`Facture ${invoice.id}`}
                                        className="border-border max-h-72 w-full rounded-lg border object-contain"
                                    />
                                ) : (
                                    <div className="border-border bg-muted/40 flex items-center gap-3 rounded-lg border p-4">
                                        <FileText className="text-muted-foreground h-8 w-8" />
                                        <a
                                            href={invoice.fileDataUri}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-lumiris-emerald text-sm hover:underline"
                                        >
                                            Ouvrir le PDF
                                        </a>
                                    </div>
                                )
                            ) : invoice.fileUrl ? (
                                <div className="border-border bg-muted/40 flex items-center gap-3 rounded-lg border p-4">
                                    <FileText className="text-muted-foreground h-8 w-8" />
                                    <a
                                        href={invoice.fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-lumiris-emerald text-sm hover:underline"
                                    >
                                        {invoice.fileUrl.split('/').pop()}
                                    </a>
                                </div>
                            ) : null}

                            <div>
                                <h3 className="text-muted-foreground mb-2 text-[11px] uppercase tracking-wider">
                                    Fibres détectées
                                </h3>
                                {invoice.fibers.length === 0 ? (
                                    <p className="text-muted-foreground text-sm">Aucune fibre extraite.</p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Fibre</TableHead>
                                                <TableHead>Libellé</TableHead>
                                                <TableHead className="text-right">Part</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {invoice.fibers.map((f, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="capitalize">{f.fiber}</TableCell>
                                                    <TableCell className="text-muted-foreground text-xs">
                                                        {f.label ?? '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono text-xs">
                                                        {f.pct}%
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>

                            {invoice.notes && (
                                <div>
                                    <h3 className="text-muted-foreground mb-1 text-[11px] uppercase tracking-wider">
                                        Notes
                                    </h3>
                                    <p className="text-foreground whitespace-pre-wrap text-sm">{invoice.notes}</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

function LinkedPassportsSheet({
    invoice,
    artisanId,
    onClose,
}: {
    invoice: InvoiceView | null;
    artisanId: string;
    onClose: () => void;
}) {
    return (
        <Sheet open={!!invoice} onOpenChange={(o) => !o && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-md">
                {invoice && <LinkedPassportsBody invoice={invoice} artisanId={artisanId} />}
            </SheetContent>
        </Sheet>
    );
}

function LinkedPassportsBody({ invoice, artisanId }: { invoice: InvoiceView; artisanId: string }) {
    const linked = usePassportsLinkedTo(invoice.id, artisanId);
    return (
        <>
            <SheetHeader>
                <SheetTitle>Passeports liés</SheetTitle>
                <SheetDescription>
                    {linked.length} passeport{linked.length > 1 ? 's' : ''} référence{linked.length > 1 ? 'nt' : ''}{' '}
                    cette facture.
                </SheetDescription>
            </SheetHeader>
            <div className="space-y-2 px-4">
                {linked.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Aucun passeport rattaché.</p>
                ) : (
                    linked.map((p) => (
                        <Link
                            key={p.id}
                            href={`/passports/${p.id}`}
                            className="border-border bg-card hover:bg-muted/40 flex items-center justify-between rounded-lg border p-3 transition-colors"
                        >
                            <div className="min-w-0">
                                <p className="text-foreground truncate text-sm font-medium">{p.reference}</p>
                                <p className="text-muted-foreground font-mono text-xs">{p.id}</p>
                            </div>
                            <Badge variant="outline" className="text-[10px]">
                                {p.status}
                            </Badge>
                        </Link>
                    ))
                )}
            </div>
        </>
    );
}

function formatDate(iso: string): string {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('fr-FR');
}

function formatEur(n: number): string {
    return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

function seedHash(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    return h >>> 0 || 1;
}

function makeRng(seed: number): () => number {
    let state = seed;
    return () => {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        return state / 0x100000000;
    };
}
