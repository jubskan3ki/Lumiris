'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@lumiris/ui/lib/cn';

export type LocalFilter = 'all' | 'buy' | 'repair';

interface FilterPillsProps {
    value: LocalFilter;
    onChange: (next: LocalFilter) => void;
    counts: Record<LocalFilter, number>;
}

interface PillDef {
    key: LocalFilter;
    label: string;
}

const PILLS: readonly PillDef[] = [
    { key: 'all', label: 'Tout' },
    { key: 'buy', label: 'Acheter' },
    { key: 'repair', label: 'Reparer' },
];

export function FilterPills({ value, onChange, counts }: FilterPillsProps) {
    const prefersReduced = useReducedMotion();

    return (
        <div role="radiogroup" aria-label="Filtrer les points partenaires" className="flex gap-2">
            {PILLS.map((pill) => {
                const active = pill.key === value;
                return (
                    <motion.button
                        key={pill.key}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => onChange(pill.key)}
                        whileTap={prefersReduced ? undefined : { scale: 0.95 }}
                        className={cn(
                            'inline-flex items-center gap-1 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                            'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
                            active
                                ? 'bg-foreground text-background border-transparent shadow-sm'
                                : 'bg-card text-muted-foreground border-border/60 hover:text-foreground',
                        )}
                    >
                        <span>{pill.label}</span>
                        <span
                            className={cn(
                                'text-xs font-semibold tabular-nums',
                                active ? 'text-background/70' : 'text-muted-foreground/70',
                            )}
                        >
                            ({counts[pill.key]})
                        </span>
                    </motion.button>
                );
            })}
        </div>
    );
}
