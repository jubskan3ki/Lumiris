'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@lumiris/ui/components/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@lumiris/ui/components/table';
import { IrisGrade } from '@lumiris/scoring-ui';
import { getTopPassports } from '@/lib/analytics-mock';

export function TopPassportsSection({ artisanId }: { artisanId: string }) {
    const rows = useMemo(() => getTopPassports(artisanId, 5), [artisanId]);

    return (
        <section className="space-y-4">
            <header>
                <h2 className="text-foreground text-lg font-semibold tracking-tight">Pièces les plus vues</h2>
                <p className="text-muted-foreground text-xs">
                    Top 5 par scans pondérés par grade Iris (A×4, B×2, C×1, D/E×0,3).
                </p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Classement</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-15">Photo</TableHead>
                                <TableHead>Référence</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead className="text-right">Scans</TableHead>
                                <TableHead className="text-right">Conversions</TableHead>
                                <TableHead className="text-right">Lien</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-muted-foreground py-10 text-center text-sm">
                                        Aucun passeport publié — le classement s’activera dès votre première
                                        publication.
                                    </TableCell>
                                </TableRow>
                            )}
                            {rows.map(({ passport, grade, scans, conversions }) => (
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
                                        <span className="text-foreground font-medium">
                                            {passport.garment.reference || passport.id}
                                        </span>
                                        <span className="text-muted-foreground ml-2 text-xs capitalize">
                                            {passport.garment.kind}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <IrisGrade grade={grade} size="sm" />
                                    </TableCell>
                                    <TableCell className="text-right font-mono">{scans}</TableCell>
                                    <TableCell className="text-right font-mono">{conversions}</TableCell>
                                    <TableCell className="text-right">
                                        <Link
                                            href={`/passports/${passport.id}`}
                                            className="text-lumiris-emerald hover:underline"
                                        >
                                            Voir
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </section>
    );
}
