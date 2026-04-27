'use client';

import { motion } from 'framer-motion';
import {
    ArrowRight,
    BarChart3,
    FileSearch,
    Layers,
    TrendingUp,
    ShieldCheck,
    BadgeCheck,
    Users,
    Globe,
    Zap,
} from 'lucide-react';

/* ---------- FEATURES ---------- */
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
            'Automatically map Tier 1-3 suppliers. Visualize dependencies and identify transparency blind spots.',
    },
    {
        icon: TrendingUp,
        title: 'Competitive Benchmarking',
        description:
            'See how your products score against anonymized industry peers. Transparency becomes your competitive advantage.',
    },
];

/* ---------- STATS ---------- */
const stats = [
    { value: '2,400+', label: 'Products audited', icon: FileSearch },
    { value: '180', label: 'Brands evaluated', icon: Users },
    { value: '12', label: 'Countries covered', icon: Globe },
    { value: '47', label: 'Evaluation criteria', icon: Zap },
];

/* ---------- ANIMATION HELPER ---------- */
function Reveal({
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

export function BusinessContent() {
    return (
        <div className="pb-20 pt-28">
            {/* Hero */}
            <section className="mx-auto mb-24 max-w-5xl px-6">
                <div className="flex flex-col items-start gap-14 lg:flex-row">
                    <Reveal className="flex-1">
                        <p className="text-muted-foreground mb-4 text-xs font-medium uppercase tracking-[0.25em]">
                            For Brands
                        </p>
                        <h1 className="text-foreground text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
                            Radical Transparency is your new
                            <span className="prismatic-text"> competitive edge.</span>
                        </h1>
                        <p className="text-muted-foreground mt-5 max-w-lg text-pretty text-base leading-relaxed">
                            LUMIRIS COMMAND is the backend platform where forward-thinking brands submit, audit, and
                            improve their product transparency data &mdash; before consumers see the score.
                        </p>
                        <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
                            <button
                                type="button"
                                className="bg-foreground text-background inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                            >
                                Access the Audit Pipeline
                                <ArrowRight className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                className="border-border text-foreground hover:bg-secondary inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors"
                            >
                                Request a Demo
                            </button>
                        </div>
                    </Reveal>

                    {/* Stats */}
                    <Reveal delay={0.2} className="w-full flex-1">
                        <div className="grid grid-cols-2 gap-4">
                            {stats.map((stat) => {
                                const Icon = stat.icon;
                                return (
                                    <div
                                        key={stat.label}
                                        className="border-border bg-card rounded-2xl border p-5 shadow-sm"
                                    >
                                        <Icon className="text-muted-foreground mb-3 h-4 w-4" />
                                        <p className="text-foreground font-mono text-2xl font-bold">{stat.value}</p>
                                        <p className="text-muted-foreground mt-0.5 text-xs">{stat.label}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* Features */}
            <section className="mx-auto mb-28 max-w-5xl px-6">
                <Reveal className="mb-14">
                    <p className="text-muted-foreground mb-3 text-xs font-medium uppercase tracking-[0.25em]">
                        The Platform
                    </p>
                    <h2 className="text-foreground text-balance text-2xl font-bold sm:text-3xl">
                        Everything you need to lead on transparency.
                    </h2>
                </Reveal>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {features.map((feature, i) => {
                        const Icon = feature.icon;
                        return (
                            <Reveal key={feature.title} delay={i * 0.08}>
                                <div className="border-border bg-card hover:border-foreground/10 group h-full rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                                    <div className="bg-secondary group-hover:bg-grade-a/8 mb-4 flex h-10 w-10 items-center justify-center rounded-xl transition-colors">
                                        <Icon className="text-foreground group-hover:text-grade-a h-5 w-5 transition-colors" />
                                    </div>
                                    <h3 className="text-foreground mb-2 text-base font-semibold">{feature.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </Reveal>
                        );
                    })}
                </div>
            </section>

            {/* Trust Badge Showcase */}
            <section className="bg-foreground overflow-hidden py-28">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="flex flex-col items-center gap-16 lg:flex-row">
                        {/* Badge visual */}
                        <Reveal className="flex-shrink-0">
                            <div className="relative">
                                {/* Outer glow */}
                                <div className="prismatic-bg absolute -inset-8 rounded-full opacity-15 blur-2xl" />

                                {/* Badge A */}
                                <div className="bg-primary-foreground/[0.04] border-primary-foreground/10 relative flex h-52 w-52 flex-col items-center justify-center rounded-3xl border">
                                    <div className="prismatic-bg mb-4 flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg">
                                        <ShieldCheck className="text-card h-10 w-10" />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-primary-foreground text-sm font-semibold">
                                            Verified by LUMIRIS
                                        </span>
                                        <BadgeCheck className="text-grade-a h-4 w-4" />
                                    </div>
                                    <span className="text-primary-foreground/40 mt-1 font-mono text-xs">Badge A</span>
                                </div>
                            </div>
                        </Reveal>

                        {/* Text */}
                        <Reveal delay={0.2} className="flex-1 text-center lg:text-left">
                            <p className="text-primary-foreground/35 mb-4 text-xs font-medium uppercase tracking-[0.25em]">
                                The Trust Label
                            </p>
                            <h2 className="text-primary-foreground text-balance text-3xl font-bold leading-[1.1] sm:text-4xl">
                                The only label that cannot be bought.
                            </h2>
                            <p className="text-primary-foreground/50 mt-4 max-w-lg text-pretty leading-relaxed">
                                The &ldquo;Verified by LUMIRIS&rdquo; badge signals independently audited,
                                algorithmically scored, and bias-free product evaluation. It comes in two tiers:
                            </p>

                            <div className="mt-6 flex flex-col gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="bg-grade-a/10 mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg">
                                        <span className="text-grade-a font-mono text-sm font-bold">A</span>
                                    </div>
                                    <div>
                                        <p className="text-primary-foreground text-sm font-semibold">
                                            Badge A &mdash; Exemplary
                                        </p>
                                        <p className="text-primary-foreground/45 text-sm leading-relaxed">
                                            Reserved for products scoring 90+ across all three pillars. Displayed
                                            prominently on packaging and digital channels.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="bg-grade-b/10 mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg">
                                        <span className="text-grade-b font-mono text-sm font-bold">B</span>
                                    </div>
                                    <div>
                                        <p className="text-primary-foreground text-sm font-semibold">
                                            Badge B &mdash; Strong Performer
                                        </p>
                                        <p className="text-primary-foreground/45 text-sm leading-relaxed">
                                            For products scoring 70-89. Signals commitment to transparency with clear
                                            areas for improvement identified.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="mx-auto max-w-3xl px-6 py-28 text-center">
                <Reveal>
                    <h2 className="text-foreground text-balance text-3xl font-bold sm:text-4xl">
                        Ready to lead on transparency?
                    </h2>
                    <p className="text-muted-foreground mx-auto mt-4 max-w-lg leading-relaxed">
                        Join the brands using LUMIRIS COMMAND to turn supply chain data into a competitive advantage.
                    </p>
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <button
                            type="button"
                            className="bg-foreground text-background inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90"
                        >
                            Start Your Audit
                            <ArrowRight className="h-4 w-4" />
                        </button>
                        <a
                            href="mailto:brands@lumiris.eu"
                            className="border-border text-foreground hover:bg-secondary inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-medium transition-colors"
                        >
                            Contact Sales
                        </a>
                    </div>
                </Reveal>
            </section>
        </div>
    );
}
