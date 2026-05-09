'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { Passport, ScoreResult } from '@lumiris/types';
import { GRADE_LABEL, IrisGrade as IrisGradeBadge } from '@lumiris/scoring-ui';

export interface VaultItem {
    passport: Passport;
    score: ScoreResult;
    artisanName: string;
}

interface ComparisonOverlayProps {
    items: readonly VaultItem[];
    onClose: () => void;
}

export function ComparisonOverlay({ items, onClose }: ComparisonOverlayProps) {
    const [a, b] = items;
    if (!a || !b) return null;

    return (
        <motion.div
            className="bg-background absolute inset-0 z-50 flex flex-col"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            <div className="flex items-center justify-between px-6 pb-4 pt-12">
                <h2 className="text-foreground text-lg font-bold">Comparer</h2>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Fermer la comparaison"
                    className="border-border bg-card text-foreground inline-flex h-9 w-9 items-center justify-center rounded-xl border"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-8">
                <div className="mb-6 flex gap-3">
                    {[a, b].map((item) => (
                        <ComparisonHeaderCard key={item.passport.id} item={item} />
                    ))}
                </div>

                <ComparisonRow
                    label="Prix"
                    valueA={`${a.passport.garment.retailPrice} €`}
                    valueB={`${b.passport.garment.retailPrice} €`}
                />
                <ComparisonRow label="Value" valueA={GRADE_LABEL[a.score.grade]} valueB={GRADE_LABEL[b.score.grade]} />
                <ComparisonRow
                    label="CO₂"
                    valueA={fmtNum(a.passport.carbonKg, 'kg')}
                    valueB={fmtNum(b.passport.carbonKg, 'kg')}
                />
                <ComparisonRow
                    label="Eau"
                    valueA={fmtNum(a.passport.waterLiters, 'L')}
                    valueB={fmtNum(b.passport.waterLiters, 'L')}
                />
                {/* Pas de champ énergie sur Passport - on garde le row pour la spec, valeur '-'. */}
                <ComparisonRow label="Énergie" valueA="- kWh" valueB="- kWh" />
                <ComparisonRow
                    label="Certifs"
                    valueA={`${a.passport.certifications.length}`}
                    valueB={`${b.passport.certifications.length}`}
                />
                <ComparisonRow
                    label="Étapes"
                    valueA={`${a.passport.steps.length}`}
                    valueB={`${b.passport.steps.length}`}
                />
            </div>
        </motion.div>
    );
}

function ComparisonHeaderCard({ item }: { item: VaultItem }) {
    return (
        <div className="border-border/60 bg-card flex flex-1 flex-col items-center gap-2 rounded-2xl border py-5">
            <IrisGradeBadge grade={item.score.grade} size="lg" tone="soft" />
            <p className="text-foreground line-clamp-2 px-2 text-center text-xs font-semibold">
                {item.passport.garment.reference}
            </p>
            <p className="text-muted-foreground text-[11px]">{item.artisanName}</p>
        </div>
    );
}

function ComparisonRow({ label, valueA, valueB }: { label: string; valueA: string; valueB: string }) {
    return (
        <div className="border-border/40 flex items-center gap-3 border-b py-3">
            <span className="text-foreground flex-1 text-right text-sm font-semibold">{valueA}</span>
            <span className="text-muted-foreground w-24 text-center text-[10px] font-bold uppercase tracking-wider">
                {label}
            </span>
            <span className="text-foreground flex-1 text-sm font-semibold">{valueB}</span>
        </div>
    );
}

function fmtNum(value: number | undefined, unit: string): string {
    if (typeof value !== 'number') return '-';
    return `${value} ${unit}`;
}
