'use client';

import { useState } from 'react';
import { Loader2, RefreshCcw } from 'lucide-react';
import { mockInvoices } from '@lumiris/mock-data';
import type { SupplierInvoice } from '@lumiris/types';
import { Badge } from '@lumiris/ui/components/badge';
import { Button } from '@lumiris/ui/components/button';
import { Card, CardContent } from '@lumiris/ui/components/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@lumiris/ui/components/table';

export function InvoicesList() {
    const [running, setRunning] = useState<Record<string, boolean>>({});
    const [optimistic, setOptimistic] = useState<Record<string, true>>({});

    const fakeRescan = (id: string) => {
        setRunning((cur) => ({ ...cur, [id]: true }));
        window.setTimeout(() => {
            setRunning((cur) => {
                const { [id]: _omit, ...rest } = cur;
                void _omit;
                return rest;
            });
            setOptimistic((cur) => ({ ...cur, [id]: true }));
        }, 1500);
    };

    return (
        <div className="space-y-6 p-8">
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Référence</TableHead>
                                <TableHead>Fournisseur</TableHead>
                                <TableHead>Date upload</TableHead>
                                <TableHead>OCR</TableHead>
                                <TableHead>Passeports liés</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockInvoices.map((invoice) => (
                                <InvoiceRow
                                    key={invoice.id}
                                    invoice={invoice}
                                    isRunning={!!running[invoice.id]}
                                    isOptimisticExtracted={!!optimistic[invoice.id]}
                                    onRescan={() => fakeRescan(invoice.id)}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function InvoiceRow({
    invoice,
    isRunning,
    isOptimisticExtracted,
    onRescan,
}: {
    invoice: SupplierInvoice;
    isRunning: boolean;
    isOptimisticExtracted: boolean;
    onRescan: () => void;
}) {
    const extracted = invoice.ocrExtracted !== null || isOptimisticExtracted;
    return (
        <TableRow>
            <TableCell className="font-mono text-xs">{invoice.id}</TableCell>
            <TableCell className="text-foreground">
                {invoice.ocrExtracted?.supplierName ?? invoice.supplierId}
            </TableCell>
            <TableCell className="text-muted-foreground text-xs">
                {new Date(invoice.uploadedAt).toLocaleDateString('fr-FR')}
            </TableCell>
            <TableCell>
                {extracted ? (
                    <Badge className="border-lumiris-emerald/30 bg-lumiris-emerald/10 text-lumiris-emerald border">
                        Extracted
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                        À traiter
                    </Badge>
                )}
            </TableCell>
            <TableCell className="text-muted-foreground text-xs">
                {invoice.linkedPassportIds.length === 0 ? '—' : invoice.linkedPassportIds.length}
            </TableCell>
            <TableCell className="text-right">
                {!extracted && (
                    <Button size="sm" variant="ghost" disabled={isRunning} onClick={onRescan}>
                        {isRunning ? (
                            <>
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Re-OCR…
                            </>
                        ) : (
                            <>
                                <RefreshCcw className="mr-1.5 h-3.5 w-3.5" /> Re-lancer OCR
                            </>
                        )}
                    </Button>
                )}
            </TableCell>
        </TableRow>
    );
}
