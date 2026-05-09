'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, RefreshCw, X } from 'lucide-react';
import { GRADE_LABEL, IrisGrade, gradeBackgroundSolid, gradeBorder2px } from '@lumiris/scoring-ui';
import type { Artisan, Passport, ScoreResult } from '@lumiris/types';
import { SPRING_OVERLAY } from '@/lib/motion';

// Bottom-sheet 70vh qui apparaît quand un passeport est lu. Mise en avant :
//   - cercle de grade 96px (border 2px, glow couleur grade)
//   - référence produit + atelier
//   - 2 CTA empilés : "Voir le passeport" (primaire) + "Scanner un autre" (secondaire)
// Le wrapper porte un `layoutId="scan-result-<id>"` pour préparer la transition partagée
// vers la fiche passeport (Section C).

interface ScanResultModalProps {
    passport: Passport;
    artisan?: Artisan;
    score: ScoreResult;
    onClose: () => void;
    onOpenPassport: (passportId: string) => void;
}

export function ScanResultModal({ passport, artisan, score, onClose, onOpenPassport }: ScanResultModalProps) {
    const gradeBg = gradeBackgroundSolid(score.grade);
    const gradeLabel = GRADE_LABEL[score.grade];
    const gradeBorder2pxClass = gradeBorder2px(score.grade);

    return (
        <AnimatePresence>
            <motion.div
                key="scan-result"
                className="absolute inset-0 z-40 flex items-end justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                {/* Halo prismatique d'arrivée - disparaît en 1.2s */}
                <motion.div
                    className="pointer-events-none absolute inset-0 motion-reduce:hidden"
                    style={{
                        background:
                            'radial-gradient(circle at 50% 50%, oklch(60% 0.13 195deg / 35%), oklch(55% 0.18 160deg / 20%), transparent 70%)',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.9, 0] }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    aria-hidden
                />

                {/* Backdrop blur */}
                <button
                    type="button"
                    className="bg-background/60 absolute inset-0 backdrop-blur-md"
                    onClick={onClose}
                    aria-label="Fermer"
                />

                {/* Bottom sheet - hauteur cible 70vh */}
                <motion.div
                    layoutId={`scan-result-${passport.id}`}
                    className="border-border/50 bg-card/95 relative flex max-h-[70vh] w-full max-w-md flex-col gap-5 rounded-t-3xl border-x border-t p-6 pb-8 shadow-2xl backdrop-blur-2xl"
                    role="dialog"
                    aria-label="Passeport détecté"
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={SPRING_OVERLAY}
                >
                    {/* Drag handle */}
                    <div
                        className="bg-border/60 absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full"
                        aria-hidden
                    />

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fermer"
                        className="border-border/60 bg-card text-foreground absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>

                    {/* Hero - grade circle géant 96px */}
                    <div className="flex flex-col items-center gap-3 pt-2">
                        <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-[0.2em]">
                            Passeport détecté
                        </p>
                        <div className="relative h-24 w-24">
                            {/* Glow */}
                            <span
                                className={`absolute inset-0 -z-10 rounded-full opacity-50 blur-2xl ${gradeBg}`}
                                aria-hidden
                            />
                            {/* IrisGrade XL = 90px - on étire à 96px (h-24/w-24) via className et on impose
                                la border 2px dans la couleur du grade (override du `border-transparent` de tone=solid). */}
                            <IrisGrade
                                grade={score.grade}
                                size="xl"
                                tone="solid"
                                shape="pill"
                                className={`h-24! w-24! shadow-xl ${gradeBorder2pxClass}`}
                            />
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                            <p className="text-foreground text-center text-base font-semibold">
                                {passport.garment.reference}
                            </p>
                            <p className="text-muted-foreground text-center text-xs">
                                {artisan?.atelierName ?? '-'}
                                {artisan?.city ? ` · ${artisan.city}` : ''}
                            </p>
                            <p className="text-muted-foreground/80 mt-1 text-[11px] font-medium uppercase tracking-[0.15em]">
                                {gradeLabel}
                            </p>
                        </div>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={() => onOpenPassport(passport.id)}
                            className="bg-foreground text-primary-foreground inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold"
                        >
                            Voir le passeport
                            <ArrowRight className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="border-border/60 bg-card text-foreground inline-flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-medium"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Scanner un autre
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
