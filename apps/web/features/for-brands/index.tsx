'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, FileSearch, Layers, TrendingUp } from 'lucide-react';

const features = [
    {
        icon: FileSearch,
        title: 'Audit Pipeline',
        description:
            'Submit product data through our secure pipeline. AI-assisted pre-screening identifies gaps before the full audit begins.',
    },
    {
        icon: BarChart3,
        title: 'Real-Time Dashboard',
        description:
            'Monitor your entire product portfolio score in real time. Track improvements and identify underperformers at a glance.',
    },
    {
        icon: Layers,
        title: 'Supply Chain Mapping',
        description:
            'Automatically map Tier 1–3 suppliers. Visualize dependencies and identify transparency blind spots.',
    },
    {
        icon: TrendingUp,
        title: 'Competitive Benchmarking',
        description:
            'See how your products score against anonymized industry peers. Transparency becomes your competitive advantage.',
    },
];

export function ForBrands() {
    return (
        <section id="brands" className="relative py-32">
            {/* Top divider */}
            <div className="via-border absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent" />

            <div className="mx-auto max-w-7xl px-6">
                <div className="flex flex-col items-start gap-16 lg:flex-row lg:gap-20">
                    {/* Left — text content */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="flex-1"
                    >
                        <p className="text-muted-foreground mb-4 text-xs font-medium uppercase tracking-[0.3em]">
                            For Brands
                        </p>
                        <h2 className="text-foreground text-balance font-serif text-3xl font-bold leading-[1.1] sm:text-4xl lg:text-5xl">
                            Radical Transparency is your new competitive edge.
                        </h2>
                        <p className="text-muted-foreground mt-6 max-w-lg text-pretty leading-relaxed">
                            LUMIRIS COMMAND is the backend platform where forward-thinking brands submit, audit, and
                            improve their product transparency data — before consumers see the score.
                        </p>

                        <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row">
                            <button
                                type="button"
                                className="bg-foreground text-background inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90"
                            >
                                Access the Audit Pipeline
                                <ArrowRight className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                className="border-border text-foreground hover:bg-secondary inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-medium transition-colors"
                            >
                                Request a Demo
                            </button>
                        </div>
                    </motion.div>

                    {/* Right — features grid */}
                    <div className="grid w-full flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                        {features.map((feature, i) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    className="border-border bg-card hover:border-foreground/10 hover:shadow-foreground/5 group rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg"
                                >
                                    <div className="bg-secondary group-hover:bg-foreground/5 mb-4 flex h-10 w-10 items-center justify-center rounded-xl transition-colors">
                                        <Icon className="text-foreground h-5 w-5" />
                                    </div>
                                    <h3 className="text-foreground mb-2 text-sm font-semibold">{feature.title}</h3>
                                    <p className="text-muted-foreground text-xs leading-relaxed">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
