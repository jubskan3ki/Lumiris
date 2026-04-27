'use client';

import { motion } from 'framer-motion';
import { Shield, Leaf, Recycle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { LUMIRIS_WEIGHTS } from '@lumiris/core/constants';

const formatWeight = (w: number) => `${Math.round(w * 100)}%`;

const pillars = [
    {
        title: 'Transparency',
        weight: formatWeight(LUMIRIS_WEIGHTS.integrity),
        icon: Shield,
        description: 'Full supply chain disclosure, certifications, and raw material provenance.',
        borderClass: 'border-grade-a/20',
        iconColor: 'text-grade-a',
        badgeBg: 'bg-grade-a/8',
    },
    {
        title: 'Impact',
        weight: formatWeight(LUMIRIS_WEIGHTS.trust),
        icon: Leaf,
        description: 'Environmental and social footprint analysis across the product lifecycle.',
        borderClass: 'border-grade-b/20',
        iconColor: 'text-grade-b',
        badgeBg: 'bg-grade-b/8',
    },
    {
        title: 'Circularity',
        weight: formatWeight(LUMIRIS_WEIGHTS.impact),
        icon: Recycle,
        description: 'End-of-life responsibility, recyclability, and material recoverability.',
        borderClass: 'border-grade-c/20',
        iconColor: 'text-grade-c',
        badgeBg: 'bg-grade-c/8',
    },
];

export function PillarsPreview() {
    return (
        <section className="relative py-28">
            <div className="via-border absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent" />

            <div className="mx-auto max-w-6xl px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-16 text-center"
                >
                    <p className="text-muted-foreground mb-3 text-xs font-medium uppercase tracking-[0.25em]">
                        The Science
                    </p>
                    <h2 className="text-foreground text-balance text-3xl font-bold sm:text-4xl">
                        The 50 / 30 / 20 Rule
                    </h2>
                    <p className="text-muted-foreground mx-auto mt-3 max-w-lg text-pretty leading-relaxed">
                        Every product is evaluated across three weighted pillars. Transparency always dominates.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    {pillars.map((pillar, i) => {
                        const Icon = pillar.icon;
                        return (
                            <motion.div
                                key={pillar.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-40px' }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className={`group rounded-2xl border ${pillar.borderClass} bg-card p-7 shadow-sm transition-shadow duration-300 hover:shadow-md`}
                            >
                                <div
                                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 ${pillar.badgeBg} mb-5`}
                                >
                                    <Icon className={`h-3.5 w-3.5 ${pillar.iconColor}`} />
                                    <span className={`font-mono text-xs font-semibold ${pillar.iconColor}`}>
                                        {pillar.weight}
                                    </span>
                                </div>

                                <h3 className="text-foreground mb-2 text-lg font-semibold">{pillar.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{pillar.description}</p>
                            </motion.div>
                        );
                    })}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-10 text-center"
                >
                    <Link
                        href="/methodology"
                        className="text-foreground hover:text-grade-a inline-flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                        Read the full methodology
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
