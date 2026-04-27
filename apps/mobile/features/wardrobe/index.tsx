'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, GitCompareArrows, X } from 'lucide-react';
import { Wardrobe as VaultGrid, IrisGrade, type WardrobeItem } from '@lumiris/scoring-ui';
import { WARDROBE_ITEMS, type MobileProduct } from '@/lib/lumiris-data';

interface WardrobeProps {
    onSelectProduct: (product: MobileProduct) => void;
}

export function Wardrobe({ onSelectProduct }: WardrobeProps) {
    const [compareMode, setCompareMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showComparison, setShowComparison] = useState(false);

    const items: WardrobeItem[] = useMemo(
        () =>
            WARDROBE_ITEMS.map((p) => ({
                id: p.id,
                name: p.name,
                brand: p.brand,
                grade: p.grade,
                score: p.score,
                price: p.price,
            })),
        [],
    );

    const productById = useMemo(() => new Map(WARDROBE_ITEMS.map((p) => [p.id, p])), []);

    const overall = useMemo(() => {
        if (WARDROBE_ITEMS.length === 0) {
            return { grade: 'E' as const, percentage: 0 };
        }
        const sum = WARDROBE_ITEMS.reduce((acc, p) => acc + p.score, 0);
        const avg = sum / WARDROBE_ITEMS.length;
        return { grade: gradeFromAverage(avg), percentage: avg };
    }, []);

    const distribution = useMemo(() => {
        const dist: Record<string, number> = {};
        WARDROBE_ITEMS.forEach((p) => {
            const key = p.grade === 'A+' ? 'A' : p.grade;
            dist[key] = (dist[key] ?? 0) + 1;
        });
        return dist;
    }, []);

    const exitCompare = () => {
        setShowComparison(false);
        setCompareMode(false);
        setSelectedIds([]);
    };

    const handleSelect = (item: WardrobeItem) => {
        if (compareMode) {
            setSelectedIds((prev) => {
                if (prev.includes(item.id)) {
                    return prev.filter((id) => id !== item.id);
                }
                if (prev.length >= 2) {
                    return prev;
                }
                const next = [...prev, item.id];
                if (next.length === 2) {
                    setTimeout(() => setShowComparison(true), 200);
                }
                return next;
            });
            return;
        }
        const product = productById.get(item.id);
        if (product) {
            onSelectProduct(product);
        }
    };

    const compareProducts: MobileProduct[] = selectedIds
        .map((id) => productById.get(id))
        .filter((p): p is MobileProduct => Boolean(p));

    return (
        <div className="bg-background flex h-full flex-col">
            <motion.div
                className="flex items-center justify-between px-6 pb-4 pt-14"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h1 className="text-foreground text-xl font-bold">Your Vault</h1>
                    <p className="text-muted-foreground mt-0.5 text-sm">{WARDROBE_ITEMS.length} items scanned</p>
                </div>
                <button
                    onClick={() => (compareMode ? exitCompare() : setCompareMode(true))}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        compareMode
                            ? 'border-lumiris-cyan bg-lumiris-cyan/10 text-lumiris-cyan'
                            : 'border-border bg-card text-foreground'
                    }`}
                >
                    <GitCompareArrows className="h-3.5 w-3.5" />
                    {compareMode ? 'Cancel' : 'Compare'}
                </button>
            </motion.div>

            <div className="flex-1 overflow-y-auto px-5 pb-28">
                <motion.div
                    className="border-border/60 bg-card mb-5 flex items-center gap-5 rounded-2xl border p-5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <IrisGrade grade={overall.grade} size="lg" />
                    <div className="flex-1">
                        <h3 className="text-foreground text-sm font-bold">Wardrobe Health</h3>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                            Average score {Math.round(overall.percentage)} / 100
                        </p>
                        <div className="bg-lumiris-emerald/10 mt-2.5 flex items-center gap-1.5 rounded-xl px-2.5 py-1.5">
                            <TrendingUp className="text-lumiris-emerald h-3 w-3" />
                            <span className="text-lumiris-emerald text-[11px] font-medium">Top 20% in your city</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="mb-5 flex gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {(['A', 'B', 'C', 'D', 'E'] as const).map((grade) => (
                        <div
                            key={grade}
                            className="border-border/40 bg-card flex flex-1 flex-col items-center gap-1 rounded-xl border py-2.5"
                        >
                            <span className="text-foreground text-base font-bold">{distribution[grade] ?? 0}</span>
                            <IrisGrade grade={grade} size="sm" />
                        </div>
                    ))}
                </motion.div>

                <AnimatePresence>
                    {compareMode && selectedIds.length < 2 && (
                        <motion.div
                            className="border-lumiris-cyan/30 bg-lumiris-cyan/5 mb-4 rounded-2xl border px-4 py-3 text-center"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <p className="text-lumiris-cyan text-xs font-medium">
                                Select {2 - selectedIds.length} product
                                {2 - selectedIds.length > 1 ? 's' : ''} to compare
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <VaultGrid items={items} onSelect={handleSelect} selectedIds={selectedIds} />
            </div>

            <AnimatePresence>
                {showComparison && compareProducts.length === 2 && (
                    <ComparisonView products={compareProducts} onClose={exitCompare} />
                )}
            </AnimatePresence>
        </div>
    );
}

interface ComparisonViewProps {
    products: readonly MobileProduct[];
    onClose: () => void;
}

function ComparisonView({ products, onClose }: ComparisonViewProps) {
    const [a, b] = products;
    if (!a || !b) {
        return null;
    }

    return (
        <motion.div
            className="bg-background absolute inset-0 z-50 flex flex-col"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            <div className="flex items-center justify-between px-6 pb-4 pt-14">
                <h2 className="text-foreground text-lg font-bold">Compare</h2>
                <button
                    onClick={onClose}
                    className="border-border bg-card flex h-9 w-9 items-center justify-center rounded-xl border"
                >
                    <X className="text-foreground h-4 w-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-8">
                <div className="mb-6 flex gap-3">
                    {[a, b].map((product) => (
                        <div
                            key={product.id}
                            className="border-border/60 bg-card flex flex-1 flex-col items-center gap-2 rounded-2xl border py-5"
                        >
                            <IrisGrade grade={product.grade} size="lg" />
                            <p className="text-foreground text-xs font-semibold">{product.name}</p>
                            <p className="text-muted-foreground text-[11px]">{product.brand}</p>
                        </div>
                    ))}
                </div>

                <ComparisonRow
                    label="Score"
                    valueA={`${Math.round(a.score)} / 100`}
                    valueB={`${Math.round(b.score)} / 100`}
                />
                <ComparisonRow label="Price" valueA={`€${a.price}`} valueB={`€${b.price}`} />
                <ComparisonRow label="Value" valueA={a.priceGradeRatio} valueB={b.priceGradeRatio} />
                <ComparisonRow
                    label="CO2"
                    valueA={`${a.environmental[0]?.value ?? '-'} kg`}
                    valueB={`${b.environmental[0]?.value ?? '-'} kg`}
                />
                <ComparisonRow
                    label="Water"
                    valueA={`${a.environmental[1]?.value ?? '-'} L`}
                    valueB={`${b.environmental[1]?.value ?? '-'} L`}
                />
                <ComparisonRow
                    label="Energy"
                    valueA={`${a.environmental[2]?.value ?? '-'} kWh`}
                    valueB={`${b.environmental[2]?.value ?? '-'} kWh`}
                />
                <ComparisonRow
                    label="Certificates"
                    valueA={`${a.certificates.length}`}
                    valueB={`${b.certificates.length}`}
                />
                <ComparisonRow label="Supply Steps" valueA={`${a.journey.length}`} valueB={`${b.journey.length}`} />
            </div>
        </motion.div>
    );
}

interface ComparisonRowProps {
    label: string;
    valueA: string;
    valueB: string;
}

function ComparisonRow({ label, valueA, valueB }: ComparisonRowProps) {
    return (
        <div className="border-border/40 flex items-center gap-3 border-b py-3">
            <span className="text-foreground flex-1 text-right text-sm font-semibold">{valueA}</span>
            <span className="text-muted-foreground w-24 text-center text-[10px] font-bold uppercase tracking-wider">
                {label}
            </span>
            <span className="text-foreground flex-1 text-sm font-semibold">{valueB}</span>
        </div>
    );
}

function gradeFromAverage(avg: number): 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' {
    if (avg >= 90) return 'A+';
    if (avg >= 80) return 'A';
    if (avg >= 65) return 'B';
    if (avg >= 50) return 'C';
    if (avg >= 35) return 'D';
    return 'E';
}
