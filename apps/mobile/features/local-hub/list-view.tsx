'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { LocalPoint } from './types';
import { FilterPills, type LocalFilter } from './filter-pills';
import { MarketplaceBanner } from './marketplace-banner';
import { PointCard } from './point-card';

interface ListViewProps {
    points: readonly LocalPoint[];
}

export function ListView({ points }: ListViewProps) {
    const prefersReduced = useReducedMotion();
    const [filter, setFilter] = useState<LocalFilter>('all');

    const counts = useMemo<Record<LocalFilter, number>>(
        () => ({
            all: points.length,
            buy: points.filter((p) => p.kind === 'artisan').length,
            repair: points.filter((p) => p.kind === 'repairer').length,
        }),
        [points],
    );

    const filtered = useMemo(() => {
        if (filter === 'buy') return points.filter((p) => p.kind === 'artisan');
        if (filter === 'repair') return points.filter((p) => p.kind === 'repairer');
        return points;
    }, [points, filter]);

    return (
        <div className="flex flex-col gap-4 px-4 pb-24">
            <div className="bg-background/85 sticky top-0 z-10 -mx-4 px-4 py-3 backdrop-blur-xl">
                <FilterPills value={filter} onChange={setFilter} counts={counts} />
            </div>

            <AnimatePresence initial={false}>
                {filter === 'buy' ? (
                    <motion.div
                        key="marketplace-banner"
                        initial={prefersReduced ? false : { opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={prefersReduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <MarketplaceBanner />
                    </motion.div>
                ) : null}
            </AnimatePresence>

            {filtered.length === 0 ? (
                <p className="text-muted-foreground py-12 text-center text-sm">
                    Aucun point partenaire pour ce filtre.
                </p>
            ) : (
                <ul className="flex flex-col gap-4">
                    {filtered.map((point, index) => (
                        <li key={`${point.kind}-${point.id}`}>
                            <PointCard point={point} index={index} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
