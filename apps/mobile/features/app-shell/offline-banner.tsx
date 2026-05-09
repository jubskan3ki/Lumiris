'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CloudOff } from 'lucide-react';
import { useOnlineStatus } from '@/lib/network/use-online-status';

export function OfflineBanner() {
    const online = useOnlineStatus();

    return (
        <AnimatePresence initial={false}>
            {online ? null : (
                <motion.div
                    role="status"
                    aria-live="polite"
                    className="bg-lumiris-amber/15 text-lumiris-amber border-lumiris-amber/30 flex items-center justify-center gap-2 border-b px-4 py-2 text-[11px] font-medium leading-tight"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                    <CloudOff className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span>
                        Mode hors-ligne - ta garde-robe reste accessible, certaines images et liens externes sont
                        indisponibles.
                    </span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
