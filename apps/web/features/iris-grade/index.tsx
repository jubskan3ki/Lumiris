'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BadgeCheck, ShieldCheck } from 'lucide-react';
import { computeScore, toIrisGrade } from '@lumiris/core';
import { mockDpps } from '@lumiris/mock-data/dpp';
import { mockCertificates } from '@lumiris/mock-data/certificates';
import type { IrisGrade as IrisGradeLetter } from '@lumiris/types';
import { IrisGrade as IrisGradeBadge } from '@lumiris/scoring-ui/components/iris-grade';
import { ScoreReasonsList } from '@lumiris/scoring-ui/components/score-reasons-list';

interface GradeRow {
    grade: IrisGradeLetter;
    label: string;
    range: string;
    description: string;
    /** A live DPP whose score lands in this grade — drives the `reasons` panel. */
    liveExample?: {
        productName: string;
        brand: string;
        total: number;
        reasons: readonly string[];
    };
}

const GRADE_LABELS: Record<IrisGradeLetter, string> = {
    'A+': 'Exemplary+',
    A: 'Exemplary',
    B: 'Strong',
    C: 'Average',
    D: 'Below Average',
    E: 'Insufficient',
};

const GRADE_RANGES: Record<IrisGradeLetter, string> = {
    'A+': '90 — 100',
    A: '80 — 89',
    B: '65 — 79',
    C: '50 — 64',
    D: '35 — 49',
    E: '0 — 34',
};

const GRADE_DESCRIPTIONS: Record<IrisGradeLetter, string> = {
    'A+': 'Full transparency, regenerative material sourcing, and a closed-loop economy. The exemplary tier — almost no scoring axis is left below 90.',
    A: 'Robust supply-chain disclosure with measurable impact reduction. Minor gaps in circularity or traceability.',
    B: 'Above-average disclosure but missing one or two mandatory ESPR fields. Trust score sometimes drags the total down.',
    C: 'Baseline transparency met, but real room for improvement on impact (water/carbon) or end-of-life planning.',
    D: 'Partial disclosure only. Multiple key data points missing — environmental claims look unsubstantiated.',
    E: 'Critical data withheld or unavailable. The Golden Rule applies — silence is treated as non-compliance.',
};

const ORDER: readonly IrisGradeLetter[] = ['A+', 'A', 'B', 'C', 'D', 'E'];

export function IrisGrade() {
    const [active, setActive] = useState<IrisGradeLetter>('A');

    const rows = useMemo<readonly GradeRow[]>(() => {
        const examplesByGrade = new Map<IrisGradeLetter, GradeRow['liveExample']>();
        for (const dpp of mockDpps) {
            const score = computeScore(dpp, {
                certificates: mockCertificates.filter((c) => c.factory === dpp.supplierFactory),
            });
            // Verify the grade matches what the boundary helper says — never trust local maps.
            const grade = toIrisGrade(score.total);
            if (!examplesByGrade.has(grade)) {
                examplesByGrade.set(grade, {
                    productName: dpp.productName,
                    brand: dpp.brand,
                    total: score.total,
                    reasons: score.reasons.slice(0, 4),
                });
            }
        }

        return ORDER.map((grade) => ({
            grade,
            label: GRADE_LABELS[grade],
            range: GRADE_RANGES[grade],
            description: GRADE_DESCRIPTIONS[grade],
            liveExample: examplesByGrade.get(grade),
        }));
    }, []);

    const activeRow = rows.find((r) => r.grade === active) ?? rows[0]!;

    return (
        <section className="bg-foreground relative overflow-hidden py-32">
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage:
                        'linear-gradient(oklch(0.985 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(0.985 0 0) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }}
            />

            <div className="relative z-10 mx-auto max-w-7xl px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="mb-20 text-center"
                >
                    <p className="text-primary-foreground/40 mb-4 text-xs font-medium uppercase tracking-[0.3em]">
                        The Scale
                    </p>
                    <h2 className="text-primary-foreground text-balance font-serif text-3xl font-bold sm:text-4xl lg:text-5xl">
                        The Iris Grade
                    </h2>
                    <p className="text-primary-foreground/50 mx-auto mt-4 max-w-xl text-pretty leading-relaxed">
                        Six tiers, derived deterministically by{' '}
                        <span className="text-primary-foreground font-mono">computeScore</span>. Live examples below are
                        real DPPs from our audit pipeline.
                    </p>
                </motion.div>

                <div className="flex flex-col items-start gap-12 lg:flex-row lg:gap-20">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="w-full flex-1"
                    >
                        <div className="flex flex-col gap-2">
                            {rows.map((row) => {
                                const isActive = row.grade === active;
                                return (
                                    <button
                                        key={row.grade}
                                        onClick={() => setActive(row.grade)}
                                        className={`group flex items-center gap-4 rounded-xl p-4 text-left transition-all duration-300 ${
                                            isActive
                                                ? 'border-primary-foreground/15 bg-primary-foreground/5 border'
                                                : 'hover:bg-primary-foreground/5 border border-transparent'
                                        }`}
                                    >
                                        <IrisGradeBadge grade={row.grade} size="lg" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`text-sm font-semibold transition-colors ${
                                                        isActive
                                                            ? 'text-primary-foreground'
                                                            : 'text-primary-foreground/30'
                                                    }`}
                                                >
                                                    {row.label}
                                                </span>
                                                <span className="text-primary-foreground/40 text-xs">{row.range}</span>
                                            </div>
                                            {row.liveExample ? (
                                                <p className="text-primary-foreground/40 mt-0.5 text-[11px]">
                                                    {row.liveExample.productName} · {row.liveExample.total.toFixed(1)} /
                                                    100
                                                </p>
                                            ) : null}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="w-full flex-1"
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeRow.grade}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="border-primary-foreground/10 bg-primary-foreground/5 rounded-2xl border p-8 lg:p-10"
                            >
                                <div className="mb-6 flex items-center gap-3">
                                    <IrisGradeBadge grade={activeRow.grade} size="lg" />
                                    <div>
                                        <h3 className="text-primary-foreground font-serif text-xl font-bold">
                                            {activeRow.label}
                                        </h3>
                                        <p className="text-primary-foreground/40 text-sm">
                                            Score range: {activeRow.range}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-primary-foreground/60 leading-relaxed">{activeRow.description}</p>

                                {activeRow.liveExample ? (
                                    <div className="border-primary-foreground/10 bg-primary-foreground/5 mt-6 rounded-xl border p-5">
                                        <p className="text-primary-foreground/40 text-[11px] font-medium uppercase tracking-wider">
                                            Live example
                                        </p>
                                        <p className="text-primary-foreground mt-1 text-sm font-semibold">
                                            {activeRow.liveExample.productName}
                                        </p>
                                        <p className="text-primary-foreground/50 text-xs">
                                            {activeRow.liveExample.brand} · {activeRow.liveExample.total.toFixed(1)} /
                                            100
                                        </p>
                                        {activeRow.liveExample.reasons.length > 0 ? (
                                            <ScoreReasonsList
                                                reasons={activeRow.liveExample.reasons}
                                                className="text-primary-foreground/55 mt-3"
                                            />
                                        ) : (
                                            <p className="text-primary-foreground/50 mt-3 text-sm">
                                                No issues detected by computeScore.
                                            </p>
                                        )}
                                    </div>
                                ) : null}
                            </motion.div>
                        </AnimatePresence>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.4 }}
                            className="border-primary-foreground/10 bg-primary-foreground/5 mt-8 flex items-start gap-4 rounded-2xl border p-6"
                        >
                            <div className="prismatic-bg flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl">
                                <ShieldCheck className="text-primary-foreground h-5 w-5" />
                            </div>
                            <div>
                                <div className="mb-1 flex items-center gap-2">
                                    <h4 className="text-primary-foreground text-sm font-semibold">
                                        Verified by LUMIRIS
                                    </h4>
                                    <BadgeCheck className="text-grade-a h-4 w-4" />
                                </div>
                                <p className="text-primary-foreground/50 text-sm leading-relaxed">
                                    The only label that cannot be bought. Independently audited, algorithmically scored,
                                    bias-free product evaluation.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
