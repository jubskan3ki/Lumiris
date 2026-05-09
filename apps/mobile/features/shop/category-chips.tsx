'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { GarmentKind } from '@lumiris/types';
import { cn } from '@lumiris/ui/lib/cn';
import { GARMENT_KIND_LABEL, SHOP_GARMENT_KINDS } from '@/lib/shop';

interface CategoryChipsProps {
    activeKind?: GarmentKind;
}

export function CategoryChips({ activeKind }: CategoryChipsProps) {
    return (
        <motion.nav
            className="px-5 pb-4"
            aria-label="Catégories"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
        >
            <ul className="flex gap-2 overflow-x-auto pb-1">
                {SHOP_GARMENT_KINDS.map((kind) => {
                    const active = activeKind === kind;
                    return (
                        <li key={kind} className="shrink-0">
                            <Link
                                href={`/shop/${kind}`}
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                    'inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
                                    active
                                        ? 'border-foreground bg-foreground text-background'
                                        : 'border-border bg-card text-foreground hover:border-foreground/60',
                                )}
                            >
                                {GARMENT_KIND_LABEL[kind]}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </motion.nav>
    );
}
