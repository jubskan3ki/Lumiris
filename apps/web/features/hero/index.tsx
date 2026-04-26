'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Eye } from 'lucide-react';
import Link from 'next/link';

function ProductCard({ isRevealed }: { isRevealed: boolean }) {
    return (
        <div className="relative aspect-[3/4] w-60 sm:w-72">
            {/* Prismatic glow */}
            <div className="prismatic-bg absolute -inset-6 rounded-3xl opacity-15 blur-3xl" />

            <div className="border-border relative h-full w-full overflow-hidden rounded-2xl border shadow-sm">
                {/* Front -- product */}
                <div
                    className={`absolute inset-0 transition-opacity duration-700 ${
                        isRevealed ? 'opacity-0' : 'opacity-100'
                    }`}
                >
                    <div className="bg-card flex h-full w-full flex-col items-center justify-center p-6">
                        <div className="bg-secondary border-border mb-5 flex h-40 w-28 items-center justify-center rounded-xl border">
                            <svg
                                viewBox="0 0 80 100"
                                className="text-muted-foreground/20 h-20 w-16"
                                fill="currentColor"
                            >
                                <path d="M40 10 L20 20 L15 50 L10 90 L30 85 L35 60 L40 65 L45 60 L50 85 L70 90 L65 50 L60 20 L40 10Z" />
                                <path d="M30 15 L40 5 L50 15" fill="none" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>
                        <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">
                            Premium Jacket
                        </p>
                        <p className="text-muted-foreground/50 mt-1 text-[11px]">{'"Eco-Label Certified"'}</p>
                    </div>
                </div>

                {/* Revealed -- transparency view */}
                <div
                    className={`absolute inset-0 transition-opacity duration-700 ${
                        isRevealed ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    <div className="bg-foreground flex h-full w-full flex-col items-center justify-center p-6">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={isRevealed ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="mb-5"
                        >
                            <div className="border-grade-a flex h-20 w-20 items-center justify-center rounded-full border-2">
                                <span className="text-grade-a font-mono text-3xl font-bold">A</span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={isRevealed ? { y: 0, opacity: 1 } : { y: 10, opacity: 0 }}
                            transition={{ delay: 0.4, duration: 0.4 }}
                            className="text-center"
                        >
                            <p className="text-primary-foreground font-mono text-sm font-semibold">92 / 100</p>
                            <p className="text-primary-foreground/40 mt-0.5 text-[11px]">Iris Score</p>
                        </motion.div>

                        <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={isRevealed ? { y: 0, opacity: 1 } : { y: 10, opacity: 0 }}
                            transition={{ delay: 0.6, duration: 0.4 }}
                            className="mt-5 flex w-full max-w-[170px] flex-col gap-2.5"
                        >
                            {[
                                { label: 'Transparency', value: 95, color: 'bg-grade-a' },
                                { label: 'Impact', value: 88, color: 'bg-grade-b' },
                                { label: 'Circularity', value: 90, color: 'bg-grade-c' },
                            ].map((item) => (
                                <div key={item.label} className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-primary-foreground/50 font-mono text-[10px]">
                                            {item.label}
                                        </span>
                                        <span className="text-primary-foreground/50 font-mono text-[10px]">
                                            {item.value}%
                                        </span>
                                    </div>
                                    <div className="bg-primary-foreground/10 h-1 w-full rounded-full">
                                        <motion.div
                                            className={`h-full rounded-full ${item.color}`}
                                            initial={{ width: 0 }}
                                            animate={isRevealed ? { width: `${item.value}%` } : { width: 0 }}
                                            transition={{ delay: 0.8, duration: 0.6 }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function Hero() {
    const [isRevealed, setIsRevealed] = useState(false);

    return (
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden pb-16 pt-24">
            {/* Ambient blurs */}
            <div className="bg-grade-a/[0.04] absolute right-1/4 top-20 h-80 w-80 rounded-full blur-3xl" />
            <div className="bg-grade-b/[0.04] absolute bottom-20 left-1/4 h-72 w-72 rounded-full blur-3xl" />

            <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
                <div className="flex flex-col items-center gap-16 lg:flex-row lg:gap-20">
                    {/* Text */}
                    <div className="flex-1 text-center lg:text-left">
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-muted-foreground mb-5 text-xs font-medium uppercase tracking-[0.25em]"
                        >
                            Product Transparency Platform
                        </motion.p>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.35 }}
                            className="text-foreground text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
                        >
                            See through
                            <br />
                            <span className="prismatic-text">the opaque.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="text-muted-foreground mx-auto mt-5 max-w-md text-pretty text-base leading-relaxed lg:mx-0"
                        >
                            LUMIRIS audits product data to give you an independent transparency score from A to E. No
                            sponsorships. No bias. Just data.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.65 }}
                            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
                        >
                            <Link
                                href="/methodology"
                                className="bg-foreground text-background inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                            >
                                Discover the Method
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <button
                                onClick={() => setIsRevealed(!isRevealed)}
                                className="border-border text-foreground hover:bg-secondary inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors"
                            >
                                <Eye className="h-4 w-4" />
                                {isRevealed ? 'Hide Score' : 'Reveal the Score'}
                            </button>
                        </motion.div>
                    </div>

                    {/* Product card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="float-animation flex-shrink-0 cursor-pointer"
                        onMouseEnter={() => setIsRevealed(true)}
                        onMouseLeave={() => setIsRevealed(false)}
                    >
                        <ProductCard isRevealed={isRevealed} />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
