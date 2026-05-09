'use client';

import { motion } from 'framer-motion';

// Overlay caméra : viewfinder centré + halo prismatique animé. Désactive l'animation
// quand `prefers-reduced-motion` est actif (gain perceptible sur Tauri Linux faible GPU).
export function PrismaticOverlay({ active }: { active: boolean }) {
    return (
        <div className="pointer-events-none absolute inset-0 z-10">
            {/* Halos prismatiques ambiants — coupés par reduce-motion via CSS only */}
            <motion.div
                className="absolute -right-32 -top-32 h-[50vh] w-[50vh] rounded-full opacity-[0.10] blur-[100px] motion-safe:opacity-100 motion-reduce:opacity-0"
                style={{
                    background: 'radial-gradient(circle, #06b6d4, #059669, transparent)',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
                className="absolute -bottom-24 -left-24 h-[35vh] w-[35vh] rounded-full opacity-[0.08] blur-[80px] motion-safe:opacity-100 motion-reduce:opacity-0"
                style={{
                    background: 'radial-gradient(circle, #059669, #06b6d4, transparent)',
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
            />

            {/* Viewfinder centré */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative h-64 w-64">
                    {/* Quatre coins angle — couleur change quand `active` (lock) */}
                    {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
                        <Corner key={corner} corner={corner} active={active} />
                    ))}

                    {/* Ligne de scan animée */}
                    <motion.div
                        className="absolute left-2 right-2 h-px motion-reduce:hidden"
                        style={{
                            background: 'linear-gradient(90deg, transparent, #06b6d4, transparent)',
                            boxShadow: '0 0 12px rgba(6,182,212,0.6)',
                        }}
                        initial={{ top: '0%' }}
                        animate={{ top: ['8%', '92%', '8%'] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* Halo de validation quand active */}
                    {active ? (
                        <motion.div
                            className="absolute inset-0 rounded-2xl"
                            style={{
                                background: 'radial-gradient(circle, rgba(5,150,105,0.25), transparent 70%)',
                            }}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1.05 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                        />
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function Corner({ corner, active }: { corner: 'tl' | 'tr' | 'bl' | 'br'; active: boolean }) {
    const positions: Record<typeof corner, string> = {
        tl: 'top-0 left-0 border-t-2 border-l-2 rounded-tl-2xl',
        tr: 'top-0 right-0 border-t-2 border-r-2 rounded-tr-2xl',
        bl: 'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-2xl',
        br: 'bottom-0 right-0 border-b-2 border-r-2 rounded-br-2xl',
    };
    return (
        <span
            className={`absolute h-10 w-10 ${positions[corner]} transition-colors ${
                active ? 'border-lumiris-emerald' : 'border-foreground/60'
            }`}
            aria-hidden
        />
    );
}
