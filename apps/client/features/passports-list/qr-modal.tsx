'use client';

import { ExternalLink, Printer } from 'lucide-react';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';
import type { Passport } from '@lumiris/types';
import { Button } from '@lumiris/ui/components/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@lumiris/ui/components/dialog';

interface QrModalProps {
    passport: Passport;
    onClose: () => void;
}

export function QrModal({ passport, onClose }: QrModalProps) {
    return (
        <Dialog open onOpenChange={(open) => (!open ? onClose() : undefined)}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>QR - {passport.garment.reference}</DialogTitle>
                    <DialogDescription>
                        Identifiant GS1 Digital Link mock pour la pièce {passport.garment.reference}.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center gap-3 py-2">
                    <div className="border-border rounded-xl border bg-white p-4">
                        <QRCodeCanvas
                            value={passport.gs1.verificationUrl}
                            size={220}
                            includeMargin
                            level="M"
                            id={`qr-${passport.id}`}
                        />
                    </div>
                    <p className="text-muted-foreground max-w-full break-all font-mono text-[11px]">
                        {passport.gs1.verificationUrl}
                    </p>
                </div>
                <DialogFooter className="flex flex-row flex-wrap justify-end gap-2">
                    <Button variant="ghost" asChild>
                        <Link href={`/preview/${passport.id}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Aperçu client
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={`/print/${passport.id}`} target="_blank">
                            <Printer className="mr-1.5 h-3.5 w-3.5" /> Imprimer l&apos;étiquette
                        </Link>
                    </Button>
                    <Button onClick={onClose}>Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
