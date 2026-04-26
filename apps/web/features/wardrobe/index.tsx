'use client';

import { motion } from 'framer-motion';
import { Download, Star, TrendingUp, ShieldCheck } from 'lucide-react';

function PhoneMockup() {
    const vaultItems = [
        {
            name: 'Merino Jacket',
            brand: 'Patagonia',
            grade: 'A',
            score: 94,
            color: 'text-grade-a',
            bgColor: 'bg-grade-a/10',
        },
        {
            name: 'Organic Tee',
            brand: 'Everlane',
            grade: 'B',
            score: 78,
            color: 'text-grade-b',
            bgColor: 'bg-grade-b/10',
        },
        {
            name: 'Denim Jacket',
            brand: 'Nudie Jeans',
            grade: 'A',
            score: 91,
            color: 'text-grade-a',
            bgColor: 'bg-grade-a/10',
        },
        {
            name: 'Sneakers',
            brand: 'Veja',
            grade: 'B',
            score: 82,
            color: 'text-grade-b',
            bgColor: 'bg-grade-b/10',
        },
    ];

    return (
        <div className="relative mx-auto w-64 sm:w-72">
            {/* Phone frame */}
            <div className="border-foreground/90 bg-foreground shadow-foreground/20 relative overflow-hidden rounded-[2.5rem] border-[6px] shadow-2xl">
                {/* Notch */}
                <div className="bg-foreground absolute left-1/2 top-0 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl" />

                {/* Screen content */}
                <div className="bg-background overflow-hidden rounded-[2rem]">
                    {/* Status bar */}
                    <div className="flex items-center justify-between px-6 pb-2 pt-8">
                        <span className="text-muted-foreground text-[10px] font-medium">9:41</span>
                        <div className="flex items-center gap-1">
                            <div className="bg-foreground/20 h-2 w-4 rounded-sm" />
                            <div className="bg-foreground/20 h-2 w-4 rounded-sm" />
                        </div>
                    </div>

                    {/* App header */}
                    <div className="px-5 pb-4 pt-2">
                        <div className="flex items-center gap-2">
                            <div className="prismatic-bg h-6 w-6 rounded-md" />
                            <span className="text-foreground text-xs font-semibold">LUMIRIS</span>
                        </div>
                        <h3 className="text-foreground mt-3 font-serif text-lg font-bold">Personal Vault</h3>
                        <p className="text-muted-foreground text-[10px]">Your wardrobe transparency score</p>

                        {/* Overall score */}
                        <div className="mt-3 flex items-center gap-3">
                            <div className="bg-grade-a/10 flex h-12 w-12 items-center justify-center rounded-xl">
                                <span className="text-grade-a font-serif text-lg font-bold">A</span>
                            </div>
                            <div>
                                <p className="text-foreground text-sm font-semibold">86 / 100</p>
                                <p className="text-muted-foreground text-[9px]">Wardrobe avg.</p>
                            </div>
                            <div className="text-grade-a ml-auto flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                <span className="text-[10px] font-medium">+4</span>
                            </div>
                        </div>
                    </div>

                    {/* Item list */}
                    <div className="flex flex-col gap-2 px-5 pb-6">
                        {vaultItems.map((item) => (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4 }}
                                className="bg-secondary/50 flex items-center gap-3 rounded-xl p-2.5"
                            >
                                <div
                                    className={`h-8 w-8 rounded-lg ${item.bgColor} flex flex-shrink-0 items-center justify-center`}
                                >
                                    <span className={`font-serif text-xs font-bold ${item.color}`}>{item.grade}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-foreground truncate text-[11px] font-medium">{item.name}</p>
                                    <p className="text-muted-foreground text-[9px]">{item.brand}</p>
                                </div>
                                <span className="text-muted-foreground text-[10px] font-medium">{item.score}</span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Bottom nav bar */}
                    <div className="border-border flex items-center justify-around border-t px-5 py-3">
                        <div className="flex flex-col items-center gap-0.5">
                            <ShieldCheck className="text-foreground h-4 w-4" />
                            <span className="text-foreground text-[8px] font-medium">Vault</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                            <Star className="text-muted-foreground h-4 w-4" />
                            <span className="text-muted-foreground text-[8px]">Scan</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                            <TrendingUp className="text-muted-foreground h-4 w-4" />
                            <span className="text-muted-foreground text-[8px]">Trends</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function Wardrobe() {
    return (
        <section id="app" className="bg-secondary/50 relative overflow-hidden py-32">
            {/* Background elements */}
            <div className="bg-grade-a/5 absolute left-1/4 top-20 h-80 w-80 rounded-full blur-3xl" />
            <div className="bg-grade-b/5 absolute bottom-20 right-1/4 h-96 w-96 rounded-full blur-3xl" />

            <div className="relative z-10 mx-auto max-w-7xl px-6">
                <div className="flex flex-col items-center gap-16 lg:flex-row lg:gap-20">
                    {/* Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="flex-1 text-center lg:text-left"
                    >
                        <p className="text-muted-foreground mb-4 text-xs font-medium uppercase tracking-[0.3em]">
                            Coming Soon
                        </p>
                        <h2 className="text-foreground text-balance font-serif text-3xl font-bold leading-[1.1] sm:text-4xl lg:text-5xl">
                            Your wardrobe, scored.
                        </h2>
                        <p className="text-muted-foreground mx-auto mt-6 max-w-lg text-pretty leading-relaxed lg:mx-0">
                            The LUMIRIS app lets you scan, save, and score every item in your wardrobe. Build your
                            Personal Vault — track your style&apos;s transparency over time.
                        </p>

                        {/* Feature bullets */}
                        <div className="mt-8 flex flex-col items-center gap-3 lg:items-start">
                            {[
                                'Scan any barcode for instant scoring',
                                'Track wardrobe transparency trends',
                                'Earn badges for sustainable swaps',
                                'Share your Vault score with friends',
                            ].map((feature, i) => (
                                <motion.div
                                    key={feature}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: i * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="bg-grade-a/10 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                                        <div className="bg-grade-a h-1.5 w-1.5 rounded-full" />
                                    </div>
                                    <span className="text-foreground text-sm">{feature}</span>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start"
                        >
                            <a
                                href="#"
                                className="bg-foreground text-background inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90"
                            >
                                <Download className="h-4 w-4" />
                                Download the App
                            </a>
                        </motion.div>
                    </motion.div>

                    {/* Phone mockup */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex-shrink-0"
                    >
                        <PhoneMockup />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
