'use client';

import { useRouter } from 'next/navigation';
import { ScanQrCode, Scissors, Shirt, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@lumiris/ui/components/sheet';
import type { Passport } from '@lumiris/types';
import { removeFromWardrobe } from '@/lib/wardrobe-storage';

interface ItemActionsSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    passport: Passport | null;
    artisanName: string;
}

export function ItemActionsSheet({ open, onOpenChange, passport, artisanName }: ItemActionsSheetProps) {
    const router = useRouter();

    if (!passport) return null;

    const close = () => onOpenChange(false);

    const onRescan = () => {
        close();
        router.push('/');
    };

    const onRemove = () => {
        removeFromWardrobe(passport.id);
        close();
    };

    const onFindRetoucheur = () => {
        close();
        router.push(`/retoucheurs?for=${encodeURIComponent(passport.id)}`);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="mx-auto max-h-[85vh] max-w-md overflow-y-auto rounded-t-2xl pb-8">
                <SheetHeader className="pb-3 pt-5">
                    <SheetTitle className="text-foreground text-base">Que veux-tu faire ?</SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-4 px-4">
                    <header className="border-border bg-card flex items-center gap-3 rounded-2xl border p-3">
                        <span className="bg-secondary/60 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                            <Shirt className="text-muted-foreground/60 h-5 w-5" aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-foreground truncate text-sm font-semibold">
                                {passport.garment.reference}
                            </p>
                            <p className="text-muted-foreground truncate text-xs">{artisanName}</p>
                        </div>
                    </header>

                    <ul className="flex flex-col gap-2">
                        <ActionRow Icon={ScanQrCode} label="Re-scanner" onClick={onRescan} />
                        <ActionRow Icon={Scissors} label="Trouver un retoucheur" onClick={onFindRetoucheur} />
                        <ActionRow Icon={Trash2} label="Retirer de la garde-robe" onClick={onRemove} tone="danger" />
                    </ul>
                </div>
            </SheetContent>
        </Sheet>
    );
}

interface ActionRowProps {
    Icon: typeof ScanQrCode;
    label: string;
    onClick: () => void;
    tone?: 'default' | 'danger';
}

function ActionRow({ Icon, label, onClick, tone = 'default' }: ActionRowProps) {
    const danger = tone === 'danger';
    return (
        <li>
            <button
                type="button"
                onClick={onClick}
                className={
                    danger
                        ? 'border-lumiris-rose/30 bg-lumiris-rose/5 hover:bg-lumiris-rose/10 text-lumiris-rose flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-colors'
                        : 'border-border bg-card hover:bg-muted/40 text-foreground flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-colors'
                }
            >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
            </button>
        </li>
    );
}
