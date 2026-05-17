'use client';

import { useMemo } from 'react';
import { Download, Trash2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@lumiris/ui/components/alert-dialog';
import { GlassCard } from '@/lib/motion';
import { USER_KEYS, userScopedKey } from '@/lib/storage-keys';
import { useWardrobe } from '@/lib/wardrobe-storage';
import type { Settings } from '@/lib/settings';

interface DataSectionProps {
    user: { displayName: string; email: string; city?: string; id: string; createdAt: string };
    settings: Settings;
    appVersion: string;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">{title}</h2>
            <GlassCard intensity="subtle" className="flex flex-col">
                {children}
            </GlassCard>
        </section>
    );
}

function Row({ children, last = false }: { children: React.ReactNode; last?: boolean }) {
    return (
        <div className={`flex items-center justify-between gap-3 px-4 py-3 ${last ? '' : 'border-border/40 border-b'}`}>
            {children}
        </div>
    );
}

export function DataSection({ user, settings, appVersion }: DataSectionProps) {
    const wardrobe = useWardrobe();

    const exportPayload = useMemo(
        () => ({
            exportedAt: new Date().toISOString(),
            version: appVersion,
            // L'export ne contient pas plus que ce que l'utilisateur a saisi - pas d'IP,
            // pas de device id, pas de scoring agrégé. JSON lisible à plat.
            user: {
                displayName: user.displayName,
                email: user.email,
                city: user.city ?? null,
                createdAt: user.createdAt,
            },
            wardrobe,
            settings,
        }),
        [user, wardrobe, settings, appVersion],
    );

    function handleExport() {
        if (typeof window === 'undefined') return;
        const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lumiris-export-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function handleClearWardrobe() {
        if (typeof window === 'undefined') return;
        window.localStorage.removeItem(userScopedKey(user.id, USER_KEYS.wardrobe));
        window.dispatchEvent(new CustomEvent('lumiris:wardrobe-changed'));
    }

    return (
        <Section title="Données">
            <Row>
                <div className="min-w-0 flex-1">
                    <p className="text-foreground text-sm">Effacer ma garde-robe locale</p>
                    <p className="text-muted-foreground mt-0.5 text-[11px]">
                        {wardrobe.length} pièce{wardrobe.length > 1 ? 's' : ''} stockée
                        {wardrobe.length > 1 ? 's' : ''} dans ce navigateur.
                    </p>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <button
                            type="button"
                            disabled={wardrobe.length === 0}
                            className="border-lumiris-rose/30 bg-lumiris-rose/5 text-lumiris-rose hover:bg-lumiris-rose/10 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-40"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Effacer
                        </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Effacer toute ta garde-robe ?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Toutes les pièces que tu as ajoutées seront retirées. Ton historique d&apos;entretien
                                sera perdu. Cette action est définitive.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleClearWardrobe}
                                className="bg-lumiris-rose hover:bg-lumiris-rose/90 text-white"
                            >
                                Effacer
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </Row>
            <Row last>
                <div className="min-w-0 flex-1">
                    <p className="text-foreground text-sm">Exporter mes données</p>
                    <p className="text-muted-foreground mt-0.5 text-[11px]">
                        JSON lisible - compte, garde-robe, réglages.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleExport}
                    className="border-border/60 bg-background/60 text-foreground hover:bg-background/80 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold"
                >
                    <Download className="h-3.5 w-3.5" />
                    Exporter
                </button>
            </Row>
        </Section>
    );
}
