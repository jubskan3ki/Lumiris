'use client';

import { motion } from 'framer-motion';
import { Shield, Leaf, Recycle, AlertTriangle } from 'lucide-react';

const pillars = [
    {
        title: 'Transparency',
        weight: '50%',
        icon: Shield,
        color: 'grade-a',
        borderColor: 'border-grade-a/30',
        glowColor: 'shadow-grade-a/20',
        bgColor: 'bg-grade-a/5',
        description:
            'Full supply chain disclosure — origin, labor conditions, certifications, and raw material provenance. The foundation of trust.',
        metrics: ['Supply chain mapping', 'Certification audit', 'Data completeness'],
    },
    {
        title: 'Impact',
        weight: '30%',
        icon: Leaf,
        color: 'grade-b',
        borderColor: 'border-grade-b/30',
        glowColor: 'shadow-grade-b/20',
        bgColor: 'bg-grade-b/5',
        description:
            'Environmental and social footprint analysis — carbon emissions, water usage, biodiversity impact, and worker welfare.',
        metrics: ['Carbon footprint', 'Water usage index', 'Social impact score'],
    },
    {
        title: 'Circularity',
        weight: '20%',
        icon: Recycle,
        color: 'grade-c',
        borderColor: 'border-grade-c/30',
        glowColor: 'shadow-grade-c/20',
        bgColor: 'bg-grade-c/5',
        description:
            'End-of-life responsibility — recyclability, repair programs, take-back initiatives, and material recoverability.',
        metrics: ['Recyclability rate', 'Repair program', 'Material recovery'],
    },
];

function PillarCard({ pillar, index }: { pillar: (typeof pillars)[0]; index: number }) {
    const Icon = pillar.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, delay: index * 0.15 }}
            whileHover={{ y: -6, transition: { duration: 0.3 } }}
            className={`group relative rounded-2xl border ${pillar.borderColor} ${pillar.bgColor} p-8 transition-shadow duration-500 hover:shadow-xl hover:${pillar.glowColor}`}
        >
            {/* Weight badge */}
            <div className="mb-6 flex items-center justify-between">
                <div
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 ${pillar.bgColor} border ${pillar.borderColor}`}
                >
                    <Icon className={`h-4 w-4 text-${pillar.color}`} />
                    <span className={`text-xs font-semibold text-${pillar.color}`}>{pillar.weight}</span>
                </div>
            </div>

            <h3 className="text-foreground mb-3 font-serif text-2xl font-bold">{pillar.title}</h3>

            <p className="text-muted-foreground mb-6 text-sm leading-relaxed">{pillar.description}</p>

            {/* Metric tags */}
            <div className="flex flex-wrap gap-2">
                {pillar.metrics.map((metric) => (
                    <span
                        key={metric}
                        className="text-muted-foreground bg-background border-border rounded-md border px-2.5 py-1 text-[11px] font-medium"
                    >
                        {metric}
                    </span>
                ))}
            </div>

            {/* Subtle glow on hover */}
            <div
                className={`absolute -inset-px rounded-2xl bg-gradient-to-b opacity-0 transition-opacity duration-500 group-hover:opacity-100 from-${pillar.color}/10 pointer-events-none to-transparent`}
            />
        </motion.div>
    );
}

export function Methodology() {
    return (
        <section id="methodology" className="relative py-32">
            {/* Background accent */}
            <div className="via-border absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent" />

            <div className="mx-auto max-w-7xl px-6">
                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="mb-20 text-center"
                >
                    <p className="text-muted-foreground mb-4 text-xs font-medium uppercase tracking-[0.3em]">
                        The Science
                    </p>
                    <h2 className="text-foreground text-balance font-serif text-3xl font-bold sm:text-4xl lg:text-5xl">
                        The 50 / 30 / 20 Rule
                    </h2>
                    <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-pretty leading-relaxed">
                        Every product is evaluated across three pillars. Our weighted scoring system ensures
                        transparency is always the dominant factor.
                    </p>
                </motion.div>

                {/* Pillar cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {pillars.map((pillar, i) => (
                        <PillarCard key={pillar.title} pillar={pillar} index={i} />
                    ))}
                </div>

                {/* Golden Rule callout */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="mx-auto mt-16 max-w-3xl"
                >
                    <div className="border-grade-e/20 bg-grade-e/5 relative flex flex-col items-start gap-4 rounded-2xl border p-8 sm:flex-row">
                        <div className="bg-grade-e/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl">
                            <AlertTriangle className="text-grade-e h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="text-foreground mb-1 text-sm font-semibold">The Golden Rule</h4>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                Missing data = Automatic Grade E. If a brand cannot or will not disclose information,
                                LUMIRIS assumes the worst. Silence is not neutrality — it&apos;s a red flag.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
