'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { getShopItems } from '@/lib/shop';
import { ShopCard } from './card';
import { CategoryChips } from './category-chips';

export function Shop() {
    const [now] = useState(() => new Date());
    const items = useMemo(() => getShopItems(now), [now]);

    return (
        <div className="bg-background flex h-full flex-col">
            <motion.header className="px-5 pb-4 pt-12" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-2">
                    <h1 className="text-foreground text-xl font-bold">Marketplace</h1>
                    <ShoppingBag className="text-muted-foreground h-4 w-4" />
                </div>
                <p className="text-muted-foreground mt-0.5 text-sm">Trié exclusivement par score Iris</p>
            </motion.header>

            <CategoryChips />

            <div className="flex-1 overflow-y-auto px-5 pb-28">
                <div className="grid grid-cols-2 gap-3">
                    {items.map((item, idx) => (
                        <ShopCard key={item.passport.id} item={item} index={idx} />
                    ))}
                </div>
                {items.length === 0 ? <ShopEmpty /> : null}
            </div>
        </div>
    );
}

function ShopEmpty() {
    return <p className="text-muted-foreground mt-8 text-center text-xs">Aucune pièce disponible pour le moment.</p>;
}
