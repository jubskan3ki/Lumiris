'use client';

import { useMemo } from 'react';
import { mockCertificates } from '@lumiris/mock-data';
import { getEffectiveStatus } from '@lumiris/types';
import { AtelierStatusBadge } from '@lumiris/scoring-ui';
import { Card, CardContent } from '@lumiris/ui/components/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@lumiris/ui/components/table';

export function CertificationsList() {
    const now = useMemo(() => new Date(), []);

    return (
        <div className="space-y-6 p-8">
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Organisme</TableHead>
                                <TableHead>Portée</TableHead>
                                <TableHead>Émise</TableHead>
                                <TableHead>Expire</TableHead>
                                <TableHead>Statut</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockCertificates.map((cert) => (
                                <TableRow key={cert.id}>
                                    <TableCell className="font-medium">{cert.kind}</TableCell>
                                    <TableCell className="text-muted-foreground text-xs">{cert.issuer}</TableCell>
                                    <TableCell className="text-muted-foreground text-xs">{cert.scope ?? '—'}</TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                        {new Date(cert.issuedAt).toLocaleDateString('fr-FR')}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                        {new Date(cert.expiresAt).toLocaleDateString('fr-FR')}
                                    </TableCell>
                                    <TableCell>
                                        <AtelierStatusBadge status={getEffectiveStatus(cert, now)} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
