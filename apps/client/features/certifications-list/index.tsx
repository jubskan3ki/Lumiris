'use client';

import { useMemo, useState } from 'react';
import {
    Clock,
    ExternalLink,
    FileText,
    MoreHorizontal,
    Plus,
    RotateCcw,
    Search,
    ShieldCheck,
    Trash2,
} from 'lucide-react';
import type { CertificationKind } from '@lumiris/types';
import { getEffectiveStatus } from '@lumiris/types';
import { AtelierStatusBadge } from '@lumiris/scoring-ui';
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
import { Card, CardContent } from '@lumiris/ui/components/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@lumiris/ui/components/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@lumiris/ui/components/dropdown-menu';
import { Input } from '@lumiris/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@lumiris/ui/components/select';
import { Toaster, toast } from '@lumiris/ui/components/sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@lumiris/ui/components/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@lumiris/ui/components/tooltip';
import { useCurrentArtisan } from '@/lib/current-artisan';
import {
    CERTIFICATION_KINDS,
    isMockCertificate,
    useCertificatesForArtisan,
    useCertificatesStore,
    type ArtisanCertificate,
} from '@/lib/certificates-store';
import { EmptyState } from '@/features/empty-state';
import { AddCertificateDialog, KIND_LABEL } from './add-dialog';
import { RenewCertificateDialog } from './renew-dialog';

type StatusFilter = 'current' | 'expiring' | 'expired' | 'all';

const STATUS_LABEL: Record<StatusFilter, string> = {
    current: 'En cours',
    expiring: 'Expirent bientôt',
    expired: 'Expirés',
    all: 'Tous statuts',
};

const ONE_DAY = 24 * 60 * 60 * 1000;
const EXPIRING_WINDOW_DAYS = 90;

function isExpiringSoon(cert: ArtisanCertificate, now: Date): boolean {
    if (getEffectiveStatus(cert, now) === 'Expired') return false;
    const remaining = (new Date(cert.expiresAt).getTime() - now.getTime()) / ONE_DAY;
    return remaining > 0 && remaining <= EXPIRING_WINDOW_DAYS;
}

function certLabel(cert: ArtisanCertificate): string {
    if (cert.kind === 'CUSTOM') return cert.customName ?? 'Certificat personnalisé';
    return KIND_LABEL[cert.kind];
}

export function CertificationsList() {
    const artisan = useCurrentArtisan();
    const [now] = useState(() => new Date());
    const certs = useCertificatesForArtisan(artisan.id);
    const removeCertificate = useCertificatesStore((s) => s.removeCertificate);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [kindFilter, setKindFilter] = useState<CertificationKind | 'all'>('all');

    const [addOpen, setAddOpen] = useState(false);
    const [renewing, setRenewing] = useState<ArtisanCertificate | null>(null);
    const [viewing, setViewing] = useState<ArtisanCertificate | null>(null);
    const [pendingDelete, setPendingDelete] = useState<ArtisanCertificate | null>(null);

    const expiringCount = useMemo(() => certs.filter((c) => isExpiringSoon(c, now)).length, [certs, now]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return certs.filter((cert) => {
            if (kindFilter !== 'all' && cert.kind !== kindFilter) return false;
            const status = getEffectiveStatus(cert, now);
            if (statusFilter === 'expired' && status !== 'Expired') return false;
            if (statusFilter === 'current' && status === 'Expired') return false;
            if (statusFilter === 'expiring' && !isExpiringSoon(cert, now)) return false;
            if (term) {
                const haystack = `${cert.issuer} ${cert.scope ?? ''} ${cert.customName ?? ''}`.toLowerCase();
                if (!haystack.includes(term)) return false;
            }
            return true;
        });
    }, [certs, search, statusFilter, kindFilter, now]);

    function handleDelete() {
        if (!pendingDelete) return;
        const ref = `${certLabel(pendingDelete)} — ${pendingDelete.issuer}`;
        removeCertificate(pendingDelete.artisanId, pendingDelete.id);
        setPendingDelete(null);
        toast.success('Certificat supprimé', { description: ref });
    }

    function resetFilters() {
        setSearch('');
        setStatusFilter('all');
        setKindFilter('all');
    }

    const isEmpty = certs.length === 0;

    return (
        <div className="space-y-6 p-8">
            <Toaster position="bottom-right" />

            <div className="space-y-1">
                <p className="text-muted-foreground text-sm">
                    Catalogue d’atelier — vos certifications réutilisables sur l’ensemble de vos passeports.
                </p>
                <p className="text-muted-foreground/80 text-xs">
                    Différent des certifications produit saisies dans le wizard de création.
                </p>
            </div>

            {isEmpty ? (
                <EmptyState
                    icon={ShieldCheck}
                    title="Aucun certificat dans votre atelier"
                    description="Centralisez vos certifications (GOTS, OEKO-TEX, EPV…) pour les réutiliser sur l’ensemble de vos passeports."
                    cta={{ label: 'Ajouter mon premier certificat', onClick: () => setAddOpen(true) }}
                />
            ) : (
                <>
                    {expiringCount > 0 && (
                        <div className="border-lumiris-amber/40 bg-lumiris-amber/10 text-foreground flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <Clock className="text-lumiris-amber mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                                <p className="text-sm font-medium">
                                    {expiringCount} certificat{expiringCount > 1 ? 's' : ''} expire
                                    {expiringCount > 1 ? 'nt' : ''} dans les 90 prochains jours.
                                </p>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-lumiris-amber/40 text-foreground"
                                onClick={() => setStatusFilter('expiring')}
                            >
                                Voir
                            </Button>
                        </div>
                    )}

                    <Card>
                        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                            <div className="relative min-w-0 flex-1">
                                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                                <Input
                                    placeholder="Rechercher par émetteur ou portée"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                                <SelectTrigger className="w-44">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {(['all', 'current', 'expiring', 'expired'] as const).map((s) => (
                                        <SelectItem key={s} value={s}>
                                            {STATUS_LABEL[s]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={kindFilter}
                                onValueChange={(v) => setKindFilter(v as CertificationKind | 'all')}
                            >
                                <SelectTrigger className="w-44">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous types</SelectItem>
                                    {CERTIFICATION_KINDS.map((k) => (
                                        <SelectItem key={k} value={k}>
                                            {KIND_LABEL[k]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={() => setAddOpen(true)}>
                                <Plus className="mr-1.5 h-4 w-4" /> Ajouter un certificat
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Émetteur</TableHead>
                                        <TableHead>Portée</TableHead>
                                        <TableHead>Émise</TableHead>
                                        <TableHead>Expire</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="py-12 text-center">
                                                <div className="text-foreground text-sm font-medium">
                                                    Aucun certificat ne correspond aux filtres
                                                </div>
                                                <div className="text-muted-foreground mt-1 text-xs">
                                                    Ajustez la recherche ou réinitialisez les filtres.
                                                </div>
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
                                    )}
                                    {filtered.map((cert) => {
                                        const status = getEffectiveStatus(cert, now);
                                        const expiringSoon = isExpiringSoon(cert, now);
                                        const isMock = isMockCertificate(cert.id);
                                        return (
                                            <TableRow key={cert.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <span>{certLabel(cert)}</span>
                                                        {isMock && (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="text-muted-foreground text-[10px] uppercase tracking-wide"
                                                                    >
                                                                        Démo
                                                                    </Badge>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    Donnée d’exemple injectée par le mock — non
                                                                    supprimable.
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-xs">
                                                    {cert.issuer}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-xs">
                                                    {cert.scope ?? '-'}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-xs">
                                                    {new Date(cert.issuedAt).toLocaleDateString('fr-FR')}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-xs">
                                                    {new Date(cert.expiresAt).toLocaleDateString('fr-FR')}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <AtelierStatusBadge status={status} />
                                                        {expiringSoon && (
                                                            <span className="text-lumiris-amber inline-flex items-center gap-1 text-[11px]">
                                                                <Clock className="h-3 w-3" />
                                                                &lt; 90j
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onSelect={() => setViewing(cert)}>
                                                                <FileText className="mr-2 h-4 w-4" />
                                                                Voir le document
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onSelect={() => setRenewing(cert)}>
                                                                <RotateCcw className="mr-2 h-4 w-4" />
                                                                Renouveler
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                disabled={isMock}
                                                                onSelect={() => !isMock && setPendingDelete(cert)}
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Supprimer
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </>
            )}

            <AddCertificateDialog open={addOpen} onOpenChange={setAddOpen} artisanId={artisan.id} />
            <RenewCertificateDialog
                open={!!renewing}
                onOpenChange={(open) => (!open ? setRenewing(null) : undefined)}
                cert={renewing}
            />
            <ViewDocumentDialog cert={viewing} onClose={() => setViewing(null)} />
            <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer ce certificat ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est définitive — le certificat local sera retiré de votre atelier.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function ViewDocumentDialog({ cert, onClose }: { cert: ArtisanCertificate | null; onClose: () => void }) {
    const open = !!cert;
    const fileUrl = cert?.fileDataUri || cert?.fileUrl || '';
    const isImage = fileUrl.startsWith('data:image') || /\.(png|jpe?g|webp|gif|avif)$/i.test(fileUrl);

    return (
        <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : undefined)}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{cert ? certLabel(cert) : ''}</DialogTitle>
                    <DialogDescription>{cert?.issuer}</DialogDescription>
                </DialogHeader>
                <div className="bg-muted/40 min-h-50 flex items-center justify-center rounded-md p-4">
                    {!fileUrl ? (
                        <p className="text-muted-foreground text-sm">Aucun document attaché.</p>
                    ) : isImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={fileUrl}
                            alt={`Document ${cert ? certLabel(cert) : ''}`}
                            className="max-h-[60vh] w-auto rounded-md"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-center">
                            <FileText className="text-muted-foreground h-10 w-10" />
                            <p className="text-muted-foreground text-sm">
                                Document PDF — ouvrez-le dans un nouvel onglet.
                            </p>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    {fileUrl && (
                        <Button asChild variant="outline">
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-1.5 h-4 w-4" />
                                Ouvrir dans un onglet
                            </a>
                        </Button>
                    )}
                    <Button onClick={onClose}>Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
