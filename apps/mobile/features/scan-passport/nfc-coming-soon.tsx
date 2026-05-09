'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Nfc } from 'lucide-react';

// NFC hors scope v1 — bouton qui affiche un toast court "Bientôt disponible" avec
// l'icône Nfc de lucide. La capacité Tauri sera ajoutée à part le jour où la fonction
// arrive (cf. CLAUDE.md, `apps/mobile/src-tauri/capabilities/`).
export function NfcComingSoon() {
    const [visible, setVisible] = useState(false);

    const trigger = useCallback(() => {
        setVisible(true);
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
        window.setTimeout(() => setVisible(false), 2200);
    }, []);

    return (
        <>
            <button
                type="button"
                onClick={trigger}
                className="border-border/60 bg-card/80 text-foreground hover:bg-card inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium backdrop-blur-md transition"
            >
                <Nfc className="h-4 w-4" />
                Approcher une étiquette NFC
            </button>

            <AnimatePresence>
                {visible ? (
                    <motion.div
                        role="status"
                        className="border-lumiris-cyan/40 bg-card/95 text-foreground pointer-events-none fixed left-1/2 top-24 z-50 -translate-x-1/2 rounded-2xl border px-4 py-2 text-xs font-medium shadow-xl backdrop-blur-md"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        Lecture NFC — bientôt disponible
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </>
    );
}
