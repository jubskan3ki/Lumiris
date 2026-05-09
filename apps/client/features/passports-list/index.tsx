'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, Pencil, Search } from 'lucide-react';
import { computeScore } from '@lumiris/core/scoring';
import { mockCertificates } from '@lumiris/mock-data';
import type { Passport, IrisGrade as IrisGradeLetter, PassportStatus, ScoreResult } from '@lumiris/types';
import { Button } from '@lumiris/ui/components/button';
import { Card, CardContent } from '@lumiris/ui/components/card';
import { Input } from '@lumiris/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@lumiris/ui/components/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@lumiris/ui/components/table';
import { IrisGrade, AtelierStatusBadge } from '@lumiris/scoring-ui';
import { currentArtisan } from '@/lib/current-artisan';
import { usePassports } from '@/lib/passports-source';
import { QrModal } from './qr-modal';

const PAGE_SIZE = 25;
const STATUSES: ReadonlyArray<PassportStatus | 'all'> = ['all', 'Draft', 'InCompletion', 'Published'];
const GRADES: ReadonlyArray<IrisGradeLetter | 'all'> = ['all', 'A', 'B', 'C', 'D', 'E'];

interface ScoredRow {
    passport: Passport;
    score: ScoreResult;
}

export function PassportsList() {
    const passports = usePassports(currentArtisan.id);
    const [statusFilter, setStatusFilter] = useState<PassportStatus | 'all'>('all');
    const [gradeFilter, setGradeFilter] = useState<IrisGradeLetter | 'all'>('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [qrPassport, setQrPassport] = useState<Passport | null>(null);

    const rows: readonly ScoredRow[] = useMemo(() => {
        const now = new Date();
        return passports.map((passport) => ({
            passport,
            score: computeScore(passport, {
                artisan: currentArtisan,
                certificates: mockCertificates,
                now,
            }),
        }));
    }, [passports]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return rows.filter(({ passport, score }) => {
            if (statusFilter !== 'all' && passport.status !== statusFilter) return false;
            if (gradeFilter !== 'all' && score.grade !== gradeFilter) return false;
            if (term) {
                const ref = passport.garment.reference?.toLowerCase() ?? '';
                const kind = passport.garment.kind.toLowerCase();
                if (!ref.includes(term) && !kind.includes(term)) return false;
            }
            return true;
        });
    }, [rows, statusFilter, gradeFilter, search]);

    const total = filtered.length;
    const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const safePage = Math.min(page, pageCount);
    const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    return (
        <div className="space-y-6 p-8">
            <Card>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                    <div className="relative min-w-0 flex-1">
                        <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                        <Input
                            placeholder="Rechercher par référence ou type"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="pl-9"
                        />
                    </div>
                    <Select
                        value={statusFilter}
                        onValueChange={(v) => {
                            setStatusFilter(v as PassportStatus | 'all');
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>
                                    {s === 'all' ? 'Tous statuts' : s}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={gradeFilter}
                        onValueChange={(v) => {
                            setGradeFilter(v as IrisGradeLetter | 'all');
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Grade" />
                        </SelectTrigger>
                        <SelectContent>
                            {GRADES.map((g) => (
                                <SelectItem key={g} value={g}>
                                    {g === 'all' ? 'Tous grades' : g}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[60px]">Photo</TableHead>
                                <TableHead>Référence</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead>Modifié</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visible.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-muted-foreground py-10 text-center text-sm">
                                        Aucun passeport ne correspond aux filtres.
                                    </TableCell>
                                </TableRow>
                            )}
                            {visible.map(({ passport, score }) => (
                                <TableRow key={passport.id}>
                                    <TableCell>
                                        {passport.garment.mainPhotoUrl ? (
                                            <Image
                                                src={passport.garment.mainPhotoUrl}
                                                alt={`Vignette ${passport.garment.reference}`}
                                                width={40}
                                                height={40}
                                                unoptimized
                                                className="border-border h-10 w-10 rounded-md border object-cover"
                                            />
                                        ) : (
                                            <div className="border-border bg-muted text-muted-foreground flex h-10 w-10 items-center justify-center rounded-md border text-[10px]">
                                                ∅
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            href={`/passports/${passport.id}`}
                                            className="text-foreground hover:text-lumiris-emerald font-medium"
                                        >
                                            {passport.garment.reference || 'Brouillon'}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground capitalize">
                                        {passport.garment.kind}
                                    </TableCell>
                                    <TableCell>
                                        <AtelierStatusBadge status={passport.status} />
                                    </TableCell>
                                    <TableCell>
                                        <IrisGrade grade={score.grade} size="sm" />
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                        {new Date(passport.updatedAt).toLocaleDateString('fr-FR')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {passport.status === 'Published' ? (
                                            <Button size="sm" variant="ghost" onClick={() => setQrPassport(passport)}>
                                                <Eye className="mr-1.5 h-3.5 w-3.5" /> Voir le QR
                                            </Button>
                                        ) : (
                                            <Button size="sm" variant="ghost" asChild>
                                                <Link href={resumeHref(passport)}>
                                                    <Pencil className="mr-1.5 h-3.5 w-3.5" /> Continuer
                                                </Link>
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {total > PAGE_SIZE && (
                <div className="text-muted-foreground flex items-center justify-between text-sm">
                    <p>
                        {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, total)} sur {total}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={safePage === 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="font-mono text-xs">
                            {safePage} / {pageCount}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={safePage === pageCount}
                            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {qrPassport && <QrModal passport={qrPassport} onClose={() => setQrPassport(null)} />}
        </div>
    );
}

function resumeHref(passport: Passport): string {
    if (passport.status === 'Published') return `/passports/${passport.id}`;
    // Reprendre à l'étape la plus pertinente selon l'état ; à défaut on repart du début.
    if (passport.materials.length === 0) return `/create/${passport.id}/identification`;
    if (passport.steps.length === 0) return `/create/${passport.id}/composition`;
    if (passport.warranty.durationMonths === 0) return `/create/${passport.id}/manufacturing`;
    return `/create/${passport.id}/publish`;
}
