'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import type { GarmentKind } from '@lumiris/types';
import { GARMENT_KIND_LABEL, getShopItemsByCategory } from '@/lib/shop';
import { ShopCard } from './card';
import { CategoryChips } from './category-chips';

interface ShopCategoryProps {
    category: GarmentKind;
}

export function ShopCategory({ category }: ShopCategoryProps) {
    const [now] = useState(() => new Date());
    const items = useMemo(() => getShopItemsByCategory(category, now), [category, now]);

    return (
        <div className="bg-background flex h-full flex-col">
            <motion.header className="px-5 pb-4 pt-12" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <Link
                    href="/shop"
                    className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Marketplace
                </Link>
                <h1 className="text-foreground mt-2 text-xl font-bold">{GARMENT_KIND_LABEL[category]}</h1>
                <p className="text-muted-foreground mt-0.5 text-sm">Trié exclusivement par score Iris</p>
            </motion.header>

            <CategoryChips activeKind={category} />

            <div className="flex-1 overflow-y-auto px-5 pb-28">
                {items.length === 0 ? (
                    <CategoryEmpty />
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {items.map((item, idx) => (
                            <ShopCard key={item.passport.id} item={item} index={idx} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function CategoryEmpty() {
    return (
        <div className="mt-12 flex flex-col items-center gap-3 px-8 text-center">
            <p className="text-muted-foreground text-sm">Aucune pièce dans cette catégorie pour le moment.</p>
            <Link
                href="/shop"
                className="text-foreground hover:text-foreground/80 text-xs font-semibold underline-offset-4 hover:underline"
            >
                Voir toute la Marketplace
            </Link>
        </div>
    );
}
