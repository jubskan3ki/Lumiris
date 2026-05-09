'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { IrisGrade, gradeBackgroundSolid } from '@lumiris/scoring-ui';
import type { Passport, ScoreResult } from '@lumiris/types';
import type { Artisan } from '@lumiris/types';

// Modale qui apparaît quand un passeport vient d'être lu, avec une animation prismatique
// courte (< 1.5s) puis affichage stable. Le CTA "Voir le passeport" est en bas pour la
// prise pouce, et le bouton X reste accessible en haut.
export interface ScanResultModalProps {
    passport: Passport;
    artisan?: Artisan;
    score: ScoreResult;
    onClose: () => void;
    onOpenPassport: (passportId: string) => void;
}

export function ScanResultModal({ passport, artisan, score, onClose, onOpenPassport }: ScanResultModalProps) {
    return (
        <AnimatePresence>
            <motion.div
                className="absolute inset-0 z-40 flex items-end justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                {/* Halo prismatique d'arrivée — disparaît rapidement */}
                <motion.div
                    className="pointer-events-none absolute inset-0 motion-reduce:hidden"
                    style={{
                        background:
                            'radial-gradient(circle at 50% 50%, rgba(6,182,212,0.35), rgba(5,150,105,0.20), transparent 70%)',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.9, 0] }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                />

                {/* Backdrop */}
                <div
                    className="bg-background/70 absolute inset-0 backdrop-blur-sm"
                    onClick={onClose}
                    role="presentation"
                />

                {/* Card */}
                <motion.div
                    className="border-border bg-card relative mx-4 mb-8 w-full max-w-sm rounded-3xl border p-5 shadow-2xl"
                    role="dialog"
                    aria-label="Passeport détecté"
                    initial={{ y: 60, scale: 0.96 }}
                    animate={{ y: 0, scale: 1 }}
                    exit={{ y: 60, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fermer"
                        className="border-border/60 bg-card text-foreground absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex items-center gap-3">
                        <div
                            className={`text-primary-foreground flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold ${gradeBackgroundSolid(score.grade)}`}
                            aria-label={`Iris grade ${score.grade}`}
                        >
                            {score.grade}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider">
                                Passeport détecté
                            </p>
                            <p className="text-foreground truncate text-sm font-semibold">
                                {passport.garment.reference}
                            </p>
                            <p className="text-muted-foreground truncate text-xs">
                                {artisan?.atelierName ?? '—'} · {artisan?.city ?? ''}
                            </p>
                        </div>
                        <IrisGrade grade={score.grade} size="sm" tone="solid" className="hidden" />
                    </div>

                    <button
                        type="button"
                        onClick={() => onOpenPassport(passport.id)}
                        className="bg-foreground text-primary-foreground mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold"
                    >
                        Voir le passeport
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
