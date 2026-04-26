'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { DISCOVERY_FEED, GRADE_CONFIG } from '@/lib/lumiris-data';

export function DiscoveryFeed() {
    return (
        <div className="bg-background flex h-full flex-col">
            {/* Header */}
            <motion.div className="px-6 pb-4 pt-14" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-2">
                    <h1 className="text-foreground text-xl font-bold">Discover</h1>
                    <Sparkles className="text-grade-c h-4 w-4" />
                </div>
                <p className="text-muted-foreground mt-0.5 text-sm">Transparency Trends from the Lumiris Journal</p>
            </motion.div>

            <div className="flex-1 overflow-y-auto px-5 pb-28">
                {/* Feed items */}
                <div className="flex flex-col gap-4">
                    {DISCOVERY_FEED.map((item, i) => {
                        const config = GRADE_CONFIG[item.grade];
                        const daysAgo = Math.round((Date.now() - new Date(item.publishedAt).getTime()) / 86400000);
                        const isOpaque = item.grade === 'E';
                        return (
                            <motion.article
                                key={item.id}
                                className="border-border/60 bg-card group rounded-2xl border p-5 transition-colors"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + i * 0.08 }}
                                style={isOpaque ? { filter: 'saturate(0.4) brightness(0.95)' } : {}}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className="text-primary-foreground mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                                        style={{ background: config.color }}
                                    >
                                        {item.grade}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-foreground text-sm font-semibold leading-snug">
                                            {item.title}
                                        </h3>
                                        <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                                            {item.subtitle}
                                        </p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-secondary text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-medium">
                                                    {item.category}
                                                </span>
                                                <span className="text-muted-foreground text-[10px]">
                                                    {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
                                                </span>
                                            </div>
                                            <div className="text-muted-foreground group-hover:text-foreground flex items-center gap-1 text-[11px] font-medium transition-colors">
                                                <span>Read</span>
                                                <ArrowUpRight className="h-3 w-3" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>

                {/* Journal CTA */}
                <motion.div
                    className="border-border/40 bg-secondary/50 mt-6 flex flex-col items-center gap-2 rounded-2xl border py-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <Sparkles className="text-muted-foreground/40 h-5 w-5" />
                    <p className="text-muted-foreground text-xs font-medium">More from the Lumiris Journal</p>
                    <button className="bg-foreground text-primary-foreground mt-1 rounded-full px-5 py-2 text-xs font-semibold transition-all active:scale-95">
                        Explore
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
