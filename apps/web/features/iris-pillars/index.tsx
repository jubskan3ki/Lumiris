'use client';

import { motion } from 'framer-motion';
import { Eye, Scissors, Leaf, Wrench } from 'lucide-react';
import { IRIS_PILLARS, type IrisPillarDefinition } from '@lumiris/types';

interface PillarVisual {
    icon: typeof Eye;
    iconColor: string;
    badgeBg: string;
    borderClass: string;
}

const VISUALS: Record<IrisPillarDefinition['id'], PillarVisual> = {
    transparency: {
        icon: Eye,
        iconColor: 'text-grade-a',
        badgeBg: 'bg-grade-a/8',
        borderClass: 'border-grade-a/20',
    },
    craftsmanship: {
        icon: Scissors,
        iconColor: 'text-grade-a',
        badgeBg: 'bg-grade-a/8',
        borderClass: 'border-grade-a/20',
    },
    impact: {
        icon: Leaf,
        iconColor: 'text-grade-b',
        badgeBg: 'bg-grade-b/8',
        borderClass: 'border-grade-b/20',
    },
    repairability: {
        icon: Wrench,
        iconColor: 'text-grade-c',
        badgeBg: 'bg-grade-c/8',
        borderClass: 'border-grade-c/20',
    },
};

export function IrisPillars() {
    return (
        <section className="relative py-24" aria-labelledby="iris-pillars-title">
            <div className="mx-auto max-w-6xl px-6">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-14 text-center"
                >
                    <p className="text-muted-foreground mb-3 text-xs font-medium uppercase tracking-[0.25em]">
                        La méthode Iris
                    </p>
                    <h2 id="iris-pillars-title" className="text-foreground text-balance text-3xl font-bold sm:text-4xl">
                        Quatre piliers, cent points
                    </h2>
                    <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-pretty leading-relaxed">
                        Chaque passeport est noté sur quatre axes pondérés. La transparence pèse le plus — sans elle,
                        les autres piliers ne sont pas vérifiables.
                    </p>
                </motion.div>

                <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                    {IRIS_PILLARS.map((pillar, i) => {
                        const visual = VISUALS[pillar.id];
                        const Icon = visual.icon;
                        return (
                            <motion.li
                                key={pillar.id}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-40px' }}
                                transition={{ duration: 0.5, delay: i * 0.07 }}
                                className={`bg-card rounded-2xl border ${visual.borderClass} p-7 shadow-sm`}
                            >
                                <div
                                    className={`mb-5 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 ${visual.badgeBg}`}
                                >
                                    <Icon className={`h-3.5 w-3.5 ${visual.iconColor}`} aria-hidden="true" />
                                    <span className={`font-mono text-xs font-semibold ${visual.iconColor}`}>
                                        {pillar.weight} pts
                                    </span>
                                </div>
                                <h3 className="text-foreground mb-2 text-lg font-semibold">{pillar.label}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{pillar.description}</p>
                            </motion.li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
