'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { computeScore } from '@lumiris/core';
import { mockProducts, mockProductDpp } from '@lumiris/mock-data/products';
import { mockCertificates } from '@lumiris/mock-data/certificates';
import type { IrisGrade as IrisGradeLetter } from '@lumiris/types';
import { IrisGrade } from '@lumiris/scoring-ui/components/iris-grade';

interface ScanRow {
    id: string;
    product: string;
    brand: string;
    grade: IrisGradeLetter;
    score: number;
}

const GRADE_BAR: Record<IrisGradeLetter, string> = {
    'A+': 'bg-grade-a-plus',
    A: 'bg-grade-a',
    B: 'bg-grade-b',
    C: 'bg-grade-c',
    D: 'bg-grade-d',
    E: 'bg-grade-e',
};

function ScanCard({ product, brand, grade, score }: ScanRow) {
    return (
        <div className="border-border bg-card w-56 flex-shrink-0 rounded-xl border p-4 shadow-sm">
            <div className="mb-3 flex items-start justify-between">
                <div className="min-w-0">
                    <p className="text-foreground truncate text-xs font-medium">{product}</p>
                    <p className="text-muted-foreground mt-0.5 text-[11px]">{brand}</p>
                </div>
                <IrisGrade grade={grade} size="sm" className="ml-3" />
            </div>
            <div className="flex items-center gap-2">
                <div className="bg-secondary h-1 flex-1 overflow-hidden rounded-full">
                    <div
                        className={`${GRADE_BAR[grade]} h-full rounded-full`}
                        style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
                    />
                </div>
                <span className="text-muted-foreground font-mono text-[10px]">{score.toFixed(0)}</span>
            </div>
        </div>
    );
}

export function RecentScans() {
    const scans = useMemo<readonly ScanRow[]>(() => {
        return mockProducts
            .map((product) => {
                const dpp = mockProductDpp(product);
                if (!dpp) return null;
                const score = computeScore(dpp, {
                    certificates: mockCertificates.filter((c) => c.factory === dpp.supplierFactory),
                });
                return {
                    id: product.id,
                    product: product.name,
                    brand: product.brand,
                    grade: score.grade,
                    score: score.total,
                } satisfies ScanRow;
            })
            .filter((s): s is ScanRow => s !== null);
    }, []);

    // Doubled so the ticker loops seamlessly.
    const doubled = useMemo(() => [...scans, ...scans], [scans]);

    return (
        <section className="relative overflow-hidden py-20">
            <div className="via-border absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-10 px-6 text-center"
            >
                <div className="border-grade-a/15 bg-grade-a/8 mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1">
                    <div className="bg-grade-a h-1.5 w-1.5 animate-pulse rounded-full" />
                    <span className="text-grade-a font-mono text-[11px] font-medium">LIVE</span>
                </div>
                <h2 className="text-foreground text-balance text-2xl font-bold sm:text-3xl">Recent Scans</h2>
                <p className="text-muted-foreground mt-2 text-sm">Products recently verified by the LUMIRIS team.</p>
            </motion.div>

            <div className="relative">
                <div className="from-background absolute bottom-0 left-0 top-0 z-10 w-24 bg-gradient-to-r to-transparent" />
                <div className="from-background absolute bottom-0 right-0 top-0 z-10 w-24 bg-gradient-to-l to-transparent" />

                <div className="ticker-scroll flex gap-4" style={{ width: 'max-content' }}>
                    {doubled.map((scan, i) => (
                        <ScanCard key={`${scan.id}-${i}`} {...scan} />
                    ))}
                </div>
            </div>
        </section>
    );
}
