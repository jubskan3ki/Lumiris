'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Leaf, Recycle, AlertTriangle, FileSearch, CheckCircle2, Database, ArrowRight } from 'lucide-react';
import { LUMIRIS_WEIGHTS } from '@lumiris/core/constants';

const formatWeight = (w: number) => `${Math.round(w * 100)}%`;

/* ---------- PILLAR DATA ---------- */
const pillars = [
    {
        title: 'Transparency',
        weight: formatWeight(LUMIRIS_WEIGHTS.integrity),
        icon: Shield,
        color: 'grade-a',
        description:
            'Full supply chain disclosure -- origin, labor conditions, certifications, and raw material provenance. The foundation of trust.',
        metrics: ['Supply chain mapping', 'Certification audit', 'Data completeness', 'Origin traceability'],
    },
    {
        title: 'Impact',
        weight: formatWeight(LUMIRIS_WEIGHTS.trust),
        icon: Leaf,
        color: 'grade-b',
        description:
            'Environmental and social footprint analysis -- carbon emissions, water usage, biodiversity impact, and worker welfare.',
        metrics: ['Carbon footprint', 'Water usage index', 'Social impact score', 'Biodiversity assessment'],
    },
    {
        title: 'Circularity',
        weight: formatWeight(LUMIRIS_WEIGHTS.impact),
        icon: Recycle,
        color: 'grade-c',
        description:
            'End-of-life responsibility -- recyclability, repair programs, take-back initiatives, and material recoverability.',
        metrics: ['Recyclability rate', 'Repair program', 'Take-back initiative', 'Material recovery'],
    },
];

/* ---------- GRADE DATA ---------- */
const grades = [
    {
        letter: 'A',
        label: 'Exemplary',
        range: '90 -- 100',
        color: 'grade-a',
        description:
            'Full transparency, minimal environmental impact, and a robust circular economy model. The gold standard.',
    },
    {
        letter: 'B',
        label: 'Strong',
        range: '70 -- 89',
        color: 'grade-b',
        description:
            'Above-average disclosure with measurable impact reduction. Minor gaps in circularity or traceability.',
    },
    {
        letter: 'C',
        label: 'Average',
        range: '50 -- 69',
        color: 'grade-c',
        description:
            'Baseline transparency met, but significant room for improvement in impact management and end-of-life planning.',
    },
    {
        letter: 'D',
        label: 'Below Average',
        range: '30 -- 49',
        color: 'grade-d',
        description: 'Partial disclosure only. Key data points missing. Environmental claims unsubstantiated or vague.',
    },
    {
        letter: 'E',
        label: 'Insufficient',
        range: '0 -- 29',
        color: 'grade-e',
        description:
            'Critical data withheld or unavailable. The Golden Rule applies -- silence is treated as non-compliance.',
    },
];

/* ---------- AUDIT PROCESS ---------- */
const auditSteps = [
    {
        icon: FileSearch,
        title: 'Data Collection',
        description:
            'Brands submit product data through the LUMIRIS COMMAND portal. Every data point is categorized across 47 evaluation criteria.',
    },
    {
        icon: Database,
        title: 'Algorithmic Scoring',
        description:
            'The LUMIRIS Algorithm applies the 50/30/20 weighting. AI-assisted analysis cross-references public databases and certifications.',
    },
    {
        icon: CheckCircle2,
        title: 'Independent Verification',
        description:
            'A dedicated analyst reviews flagged anomalies. No brand can influence the final score. The result is immutable once published.',
    },
];

/* ---------- PRISMATIC REVEAL HELPER ---------- */
function PrismaticReveal({
    children,
    delay = 0,
    className = '',
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function MethodologyContent() {
    const [activeGrade, setActiveGrade] = useState(0);

    return (
        <div className="pb-20 pt-28">
            {/* Page header */}
            <section className="mx-auto mb-24 max-w-4xl px-6 text-center">
                <PrismaticReveal>
                    <p className="text-muted-foreground mb-4 text-xs font-medium uppercase tracking-[0.25em]">
                        The Algorithm
                    </p>
                    <h1 className="text-foreground text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                        How LUMIRIS
                        <br />
                        <span className="prismatic-text">scores truth.</span>
                    </h1>
                    <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed">
                        Our methodology is built on radical independence. No brand can pay for a higher score. No label
                        can bypass the algorithm. Every product is equal under the same lens.
                    </p>
                </PrismaticReveal>
            </section>

            {/* ---------- THE 3 PILLARS ---------- */}
            <section className="mx-auto mb-28 max-w-6xl px-6">
                <PrismaticReveal className="mb-14 text-center">
                    <h2 className="text-foreground text-2xl font-bold sm:text-3xl">The 50 / 30 / 20 Rule</h2>
                    <p className="text-muted-foreground mx-auto mt-3 max-w-md text-sm leading-relaxed">
                        Three pillars. One weighted system. Transparency always dominates.
                    </p>
                </PrismaticReveal>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    {pillars.map((pillar, i) => {
                        const Icon = pillar.icon;
                        return (
                            <PrismaticReveal key={pillar.title} delay={i * 0.1}>
                                <div
                                    className={`group rounded-2xl border border-${pillar.color}/20 bg-card h-full p-7 shadow-sm transition-shadow duration-300 hover:shadow-md`}
                                >
                                    <div
                                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 bg-${pillar.color}/8 mb-5`}
                                    >
                                        <Icon className={`h-3.5 w-3.5 text-${pillar.color}`} />
                                        <span className={`font-mono text-xs font-semibold text-${pillar.color}`}>
                                            {pillar.weight}
                                        </span>
                                    </div>

                                    <h3 className="text-foreground mb-2 text-xl font-semibold">{pillar.title}</h3>
                                    <p className="text-muted-foreground mb-5 text-sm leading-relaxed">
                                        {pillar.description}
                                    </p>

                                    <div className="flex flex-wrap gap-1.5">
                                        {pillar.metrics.map((m) => (
                                            <span
                                                key={m}
                                                className="text-muted-foreground bg-secondary border-border rounded-md border px-2 py-1 text-[11px] font-medium"
                                            >
                                                {m}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </PrismaticReveal>
                        );
                    })}
                </div>

                {/* Golden Rule */}
                <PrismaticReveal delay={0.3} className="mx-auto mt-12 max-w-3xl">
                    <div className="border-grade-e/20 bg-grade-e/[0.04] flex flex-col items-start gap-4 rounded-2xl border p-7 sm:flex-row">
                        <div className="bg-grade-e/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl">
                            <AlertTriangle className="text-grade-e h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="text-foreground mb-1 text-sm font-semibold">The Golden Rule</h4>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                Missing data = Automatic Grade E. If a brand cannot or will not disclose information,
                                LUMIRIS assumes the worst. Silence is not neutrality &mdash; it&apos;s a red flag.
                            </p>
                        </div>
                    </div>
                </PrismaticReveal>
            </section>

            {/* ---------- THE IRIS GRADE SCALE ---------- */}
            <section className="bg-foreground overflow-hidden py-28">
                {/* Grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage:
                            'linear-gradient(oklch(0.985 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(0.985 0 0) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />

                <div className="relative z-10 mx-auto max-w-6xl px-6">
                    <PrismaticReveal className="mb-16 text-center">
                        <p className="text-primary-foreground/35 mb-3 text-xs font-medium uppercase tracking-[0.25em]">
                            The Scale
                        </p>
                        <h2 className="text-primary-foreground text-balance text-3xl font-bold sm:text-4xl">
                            The Iris Grade
                        </h2>
                        <p className="text-primary-foreground/45 mx-auto mt-3 max-w-md text-pretty leading-relaxed">
                            Five levels. One mission. The only label that cannot be bought.
                        </p>
                    </PrismaticReveal>

                    <div className="flex flex-col items-start gap-10 lg:flex-row lg:gap-16">
                        {/* Grade buttons */}
                        <div className="flex w-full flex-1 flex-col gap-1.5">
                            {grades.map((grade, i) => (
                                <button
                                    key={grade.letter}
                                    onClick={() => setActiveGrade(i)}
                                    className={`flex items-center gap-4 rounded-xl p-4 text-left transition-all duration-300 ${
                                        activeGrade === i
                                            ? `bg-${grade.color}/10 border border-${grade.color}/20`
                                            : 'hover:bg-primary-foreground/[0.04] border border-transparent'
                                    }`}
                                >
                                    <span
                                        className={`font-mono text-4xl font-bold transition-colors duration-300 ${
                                            activeGrade === i ? `text-${grade.color}` : 'text-primary-foreground/12'
                                        }`}
                                    >
                                        {grade.letter}
                                    </span>
                                    <div className="flex-1">
                                        <span
                                            className={`text-sm font-semibold transition-colors duration-300 ${
                                                activeGrade === i
                                                    ? 'text-primary-foreground'
                                                    : 'text-primary-foreground/25'
                                            }`}
                                        >
                                            {grade.label}
                                        </span>
                                        <span
                                            className={`ml-2 text-xs transition-colors duration-300 ${
                                                activeGrade === i
                                                    ? 'text-primary-foreground/45'
                                                    : 'text-primary-foreground/12'
                                            }`}
                                        >
                                            {grade.range}
                                        </span>
                                    </div>
                                    <div className="bg-primary-foreground/5 hidden h-1 w-24 overflow-hidden rounded-full sm:block">
                                        <motion.div
                                            className={`h-full rounded-full bg-${grade.color}`}
                                            animate={{
                                                width: `${100 - i * 20}%`,
                                                opacity: activeGrade === i ? 1 : 0.15,
                                            }}
                                            transition={{ duration: 0.4 }}
                                        />
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Detail panel */}
                        <div className="w-full flex-1">
                            <AnimatePresence mode="wait">
                                {(() => {
                                    const active = grades[activeGrade];
                                    if (!active) {
                                        return null;
                                    }
                                    return (
                                        <motion.div
                                            key={activeGrade}
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -16 }}
                                            transition={{ duration: 0.25 }}
                                            className={`rounded-2xl border border-${active.color}/20 bg-${active.color}/[0.06] p-8`}
                                        >
                                            <div className="mb-5 flex items-center gap-3">
                                                <div
                                                    className={`h-14 w-14 rounded-xl bg-${active.color}/10 flex items-center justify-center`}
                                                >
                                                    <span
                                                        className={`font-mono text-2xl font-bold text-${active.color}`}
                                                    >
                                                        {active.letter}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="text-primary-foreground text-lg font-bold">
                                                        {active.label}
                                                    </h3>
                                                    <p className="text-primary-foreground/40 font-mono text-xs">
                                                        {active.range}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-primary-foreground/55 text-sm leading-relaxed">
                                                {active.description}
                                            </p>
                                        </motion.div>
                                    );
                                })()}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------- THE AUDIT PROCESS ---------- */}
            <section className="mx-auto max-w-5xl px-6 py-28">
                <PrismaticReveal className="mb-16 text-center">
                    <p className="text-muted-foreground mb-3 text-xs font-medium uppercase tracking-[0.25em]">
                        The Process
                    </p>
                    <h2 className="text-foreground text-balance text-2xl font-bold sm:text-3xl">
                        The LUMIRIS COMMAND Path
                    </h2>
                    <p className="text-muted-foreground mx-auto mt-3 max-w-md text-sm leading-relaxed">
                        From submission to publication, every audit follows three immutable stages.
                    </p>
                </PrismaticReveal>

                <div className="relative">
                    {/* Connecting line */}
                    <div className="bg-border absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 md:block" />

                    <div className="flex flex-col gap-12 md:gap-0">
                        {auditSteps.map((step, i) => {
                            const Icon = step.icon;
                            const isLeft = i % 2 === 0;
                            return (
                                <PrismaticReveal key={step.title} delay={i * 0.15}>
                                    <div
                                        className={`flex flex-col items-center gap-6 md:flex-row md:gap-10 ${!isLeft ? 'md:flex-row-reverse' : ''}`}
                                    >
                                        <div className={`flex-1 ${isLeft ? 'md:text-right' : 'md:text-left'}`}>
                                            <h3 className="text-foreground mb-2 text-lg font-semibold">{step.title}</h3>
                                            <p className="text-muted-foreground mx-auto max-w-sm text-sm leading-relaxed md:mx-0">
                                                {step.description}
                                            </p>
                                        </div>

                                        {/* Circle node */}
                                        <div className="relative flex-shrink-0">
                                            <div className="bg-card border-border relative z-10 flex h-12 w-12 items-center justify-center rounded-full border shadow-sm">
                                                <Icon className="text-foreground h-5 w-5" />
                                            </div>
                                            <span className="text-muted-foreground absolute -bottom-5 left-1/2 -translate-x-1/2 font-mono text-[10px]">
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                        </div>

                                        <div className="hidden flex-1 md:block" />
                                    </div>
                                </PrismaticReveal>
                            );
                        })}
                    </div>
                </div>

                <PrismaticReveal delay={0.4} className="mt-20 text-center">
                    <a
                        href="/business"
                        className="bg-foreground text-background inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                    >
                        Learn about COMMAND for Brands
                        <ArrowRight className="h-4 w-4" />
                    </a>
                </PrismaticReveal>
            </section>
        </div>
    );
}
