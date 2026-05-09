'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Trash2, AlertTriangle, FileText } from 'lucide-react';
import { useWardrobe } from '@/lib/wardrobe-storage';
import { useScanCount } from '@/lib/scan-counter';
import { STORAGE_PREFIX } from '@/lib/storage-keys';

export function Profile() {
    const wardrobe = useWardrobe();
    const scans = useScanCount();
    const [confirming, setConfirming] = useState(false);

    const wipe = useCallback(() => {
        if (typeof window === 'undefined') return;
        // Boucle inverse : on collecte d'abord les clés puis on supprime — sinon l'index
        // se décale pendant qu'on itère et on en oublie la moitié.
        const keys: string[] = [];
        for (let i = 0; i < window.localStorage.length; i += 1) {
            const key = window.localStorage.key(i);
            if (key && key.startsWith(STORAGE_PREFIX)) keys.push(key);
        }
        keys.forEach((k) => window.localStorage.removeItem(k));
        // Notifier les hooks useSyncExternalStore — sinon les écrans Wardrobe/Profil ne se re-render pas.
        window.dispatchEvent(new CustomEvent('lumiris:wardrobe-changed'));
        window.dispatchEvent(new CustomEvent('lumiris:scan-counter-changed'));
        setConfirming(false);
    }, []);

    return (
        <div className="bg-background flex h-full flex-col overflow-y-auto pb-24">
            <motion.header className="px-5 pb-4 pt-12" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-foreground text-xl font-bold">Profil</h1>
                <p className="text-muted-foreground text-sm">Tu utilises LUMIRIS sans compte.</p>
            </motion.header>

            <div className="flex flex-col gap-4 px-4">
                <div className="border-border/60 bg-card flex items-start gap-3 rounded-2xl border p-4">
                    <ShieldCheck className="text-lumiris-emerald mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                        <p className="text-foreground text-sm font-semibold">Anonyme</p>
                        <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                            Aucune donnée n&apos;est synchronisée. Tout vit sur ce téléphone, dans le stockage local de
                            ton navigateur.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Stat label="Pièces suivies" value={wardrobe.length} />
                    <Stat label="Scans effectués" value={scans} />
                </div>

                <ul className="border-border/60 bg-card flex flex-col rounded-2xl border">
                    <LegalLink label="Conditions générales d'utilisation" />
                    <LegalLink label="Mentions légales" />
                    <LegalLink label="Politique de confidentialité" />
                </ul>

                <div className="border-lumiris-cyan/30 bg-lumiris-cyan/5 flex flex-col gap-1 rounded-2xl border p-4">
                    <p className="text-lumiris-cyan text-xs font-semibold uppercase tracking-wider">Bientôt</p>
                    <p className="text-foreground/90 text-sm">
                        Compte LUMIRIS pour synchroniser ta Garde-Robe entre appareils.
                    </p>
                </div>

                <div className="mt-2">
                    {confirming ? (
                        <div className="border-lumiris-rose/30 bg-lumiris-rose/5 flex flex-col gap-3 rounded-2xl border p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="text-lumiris-rose mt-0.5 h-5 w-5 shrink-0" />
                                <div>
                                    <p className="text-foreground text-sm font-semibold">
                                        Effacer toutes mes données ?
                                    </p>
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        Cette action efface ta Garde-Robe et le compteur de scans. Elle est définitive.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={wipe}
                                    className="bg-lumiris-rose text-primary-foreground flex-1 rounded-full px-4 py-2 text-xs font-semibold"
                                >
                                    Confirmer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConfirming(false)}
                                    className="border-border bg-card text-foreground flex-1 rounded-full border px-4 py-2 text-xs font-medium"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setConfirming(true)}
                            className="border-lumiris-rose/30 bg-lumiris-rose/5 text-lumiris-rose hover:bg-lumiris-rose/10 inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-xs font-semibold"
                        >
                            <Trash2 className="h-4 w-4" />
                            Effacer toutes mes données
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="border-border/60 bg-card flex flex-col gap-1 rounded-2xl border p-4">
            <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">{label}</p>
            <p className="text-foreground font-mono text-2xl font-bold">{value}</p>
        </div>
    );
}

function LegalLink({ label }: { label: string }) {
    return (
        <li>
            <button
                type="button"
                className="text-foreground hover:bg-secondary/30 flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm transition-colors"
            >
                <span className="inline-flex items-center gap-2">
                    <FileText className="text-muted-foreground h-4 w-4" />
                    {label}
                </span>
                <span className="text-muted-foreground/60 text-xs">Bientôt</span>
            </button>
        </li>
    );
}
