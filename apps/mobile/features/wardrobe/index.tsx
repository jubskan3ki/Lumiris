'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shirt, TrendingUp, GitCompareArrows, X, Check } from 'lucide-react';
import { type Product, GRADE_CONFIG, WARDROBE_ITEMS } from '@/lib/lumiris-data';

interface WardrobeProps {
    onSelectProduct: (product: Product) => void;
}

export function Wardrobe({ onSelectProduct }: WardrobeProps) {
    const [compareMode, setCompareMode] = useState(false);
    const [compareItems, setCompareItems] = useState<Product[]>([]);
    const [showComparison, setShowComparison] = useState(false);

    const gradeDistribution = getGradeDistribution();
    const overallScore = getOverallScore();

    function toggleCompareItem(product: Product) {
        setCompareItems((prev) => {
            if (prev.find((p) => p.id === product.id)) {
                return prev.filter((p) => p.id !== product.id);
            }
            if (prev.length >= 2) return prev;
            const next = [...prev, product];
            if (next.length === 2) {
                setTimeout(() => setShowComparison(true), 200);
            }
            return next;
        });
    }

    function exitCompare() {
        setShowComparison(false);
        setCompareMode(false);
        setCompareItems([]);
    }

    return (
        <div className="bg-background flex h-full flex-col">
            {/* Header */}
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
                            ? 'border-grade-b bg-grade-b/10 text-grade-b'
                            : 'border-border bg-card text-foreground'
                    }`}
                >
                    <GitCompareArrows className="h-3.5 w-3.5" />
                    {compareMode ? 'Cancel' : 'Compare'}
                </button>
            </motion.div>

            <div className="flex-1 overflow-y-auto px-5 pb-28">
                {/* Wardrobe Health gauge */}
                <motion.div
                    className="border-border/60 bg-card mb-5 flex items-center gap-5 rounded-2xl border p-5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {/* Circular gauge */}
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
                        <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r="34" fill="none" strokeWidth="4" className="stroke-secondary" />
                            <motion.circle
                                cx="40"
                                cy="40"
                                r="34"
                                fill="none"
                                strokeWidth="4"
                                strokeLinecap="round"
                                stroke={GRADE_CONFIG[overallScore.grade].color}
                                strokeDasharray={`${2 * Math.PI * 34}`}
                                initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                                animate={{
                                    strokeDashoffset: 2 * Math.PI * 34 * (1 - overallScore.percentage / 100),
                                }}
                                transition={{ delay: 0.3, duration: 1.2, ease: 'easeOut' }}
                            />
                        </svg>
                        <span
                            className="absolute text-2xl font-bold"
                            style={{ color: GRADE_CONFIG[overallScore.grade].color }}
                        >
                            {overallScore.grade}
                        </span>
                    </div>

                    <div className="flex-1">
                        <h3 className="text-foreground text-sm font-bold">Wardrobe Health</h3>
                        <p
                            className="mt-0.5 text-xs font-semibold"
                            style={{ color: GRADE_CONFIG[overallScore.grade].color }}
                        >
                            {GRADE_CONFIG[overallScore.grade].label}
                        </p>
                        <div className="bg-grade-a/8 mt-2.5 flex items-center gap-1.5 rounded-xl px-2.5 py-1.5">
                            <TrendingUp className="text-grade-a h-3 w-3" />
                            <span className="text-grade-a text-[11px] font-medium">Top 20% in your city</span>
                        </div>
                    </div>
                </motion.div>

                {/* Grade distribution chips */}
                <motion.div
                    className="mb-5 flex gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {(['A', 'B', 'C', 'D', 'E'] as const).map((grade) => (
                        <div
                            key={grade}
                            className="border-border/40 bg-card flex flex-1 flex-col items-center gap-0.5 rounded-xl border py-2.5"
                        >
                            <span className="text-base font-bold" style={{ color: GRADE_CONFIG[grade].color }}>
                                {gradeDistribution[grade] || 0}
                            </span>
                            <span className="text-[10px] font-bold" style={{ color: GRADE_CONFIG[grade].color }}>
                                {grade}
                            </span>
                        </div>
                    ))}
                </motion.div>

                {/* Compare mode hint */}
                <AnimatePresence>
                    {compareMode && compareItems.length < 2 && (
                        <motion.div
                            className="border-grade-b/30 bg-grade-b/5 mb-4 rounded-2xl border px-4 py-3 text-center"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <p className="text-grade-b text-xs font-medium">
                                Select {2 - compareItems.length} product
                                {2 - compareItems.length > 1 ? 's' : ''} to compare
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Item gallery */}
                <div className="grid grid-cols-2 gap-3">
                    {WARDROBE_ITEMS.map((item, i) => {
                        const config = GRADE_CONFIG[item.grade];
                        const isSelected = compareItems.find((c) => c.id === item.id);
                        const isGradeA = item.grade === 'A';
                        return (
                            <motion.button
                                key={item.id}
                                className={`group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all ${
                                    isSelected ? 'border-grade-b ring-grade-b/20 ring-2' : 'border-border/60'
                                } bg-card`}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 + i * 0.05 }}
                                onClick={() => (compareMode ? toggleCompareItem(item) : onSelectProduct(item))}
                                style={{
                                    ...(item.grade === 'E' ? { filter: 'saturate(0.4) brightness(0.92)' } : {}),
                                    ...(isGradeA ? { animation: 'grade-a-glow 3s ease-in-out infinite' } : {}),
                                }}
                            >
                                {/* Compare checkbox */}
                                {compareMode && (
                                    <div
                                        className={`absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                                            isSelected ? 'border-grade-b bg-grade-b' : 'border-border bg-card/90'
                                        }`}
                                    >
                                        {isSelected && <Check className="text-primary-foreground h-3 w-3" />}
                                    </div>
                                )}

                                {/* Product image placeholder */}
                                <div className="bg-secondary/50 relative flex h-28 items-center justify-center">
                                    <Shirt className="text-muted-foreground/25 h-9 w-9" />
                                    <div
                                        className="text-primary-foreground absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
                                        style={{ background: config.color }}
                                    >
                                        {item.grade}
                                    </div>
                                </div>

                                <div className="p-3">
                                    <h4 className="text-foreground text-xs font-semibold leading-tight">{item.name}</h4>
                                    <p className="text-muted-foreground mt-0.5 text-[11px]">{item.brand}</p>
                                    <p className="text-foreground mt-1 text-xs font-bold">
                                        {'\u20AC'}
                                        {item.price}
                                    </p>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Comparison overlay */}
            <AnimatePresence>
                {showComparison && compareItems.length === 2 && (
                    <ComparisonView items={compareItems} onClose={exitCompare} />
                )}
            </AnimatePresence>
        </div>
    );
}

function ComparisonView({ items, onClose }: { items: Product[]; onClose: () => void }) {
    const [a, b] = items;

    return (
        <motion.div
            className="bg-background absolute inset-0 z-50 flex flex-col"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            {/* Header */}
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
                {/* Grade comparison */}
                <div className="mb-6 flex gap-3">
                    {[a, b].map((item) => {
                        const cfg = GRADE_CONFIG[item.grade];
                        return (
                            <div
                                key={item.id}
                                className="border-border/60 bg-card flex flex-1 flex-col items-center gap-2 rounded-2xl border py-5"
                            >
                                <div
                                    className="flex h-14 w-14 items-center justify-center rounded-full border-2"
                                    style={{
                                        borderColor: cfg.color,
                                        boxShadow: `0 0 16px ${cfg.color}20`,
                                    }}
                                >
                                    <span className="text-2xl font-bold" style={{ color: cfg.color }}>
                                        {item.grade}
                                    </span>
                                </div>
                                <p className="text-foreground text-xs font-semibold">{item.name}</p>
                                <p className="text-muted-foreground text-[11px]">{item.brand}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Stats side by side */}
                <ComparisonRow label="Price" valueA={`\u20AC${a.price}`} valueB={`\u20AC${b.price}`} />
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

function ComparisonRow({ label, valueA, valueB }: { label: string; valueA: string; valueB: string }) {
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

function getGradeDistribution(): Record<string, number> {
    const dist: Record<string, number> = {};
    WARDROBE_ITEMS.forEach((item) => {
        dist[item.grade] = (dist[item.grade] || 0) + 1;
    });
    return dist;
}

function getOverallScore() {
    const gradeValues = { A: 5, B: 4, C: 3, D: 2, E: 1 };
    const total = WARDROBE_ITEMS.reduce((sum, item) => sum + gradeValues[item.grade], 0);
    const avg = total / WARDROBE_ITEMS.length;
    let grade: 'A' | 'B' | 'C' | 'D' | 'E' = 'C';
    if (avg >= 4.5) grade = 'A';
    else if (avg >= 3.5) grade = 'B';
    else if (avg >= 2.5) grade = 'C';
    else if (avg >= 1.5) grade = 'D';
    else grade = 'E';

    return { grade, percentage: (avg / 5) * 100 };
}
