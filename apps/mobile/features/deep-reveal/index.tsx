'use client';

import { motion } from 'framer-motion';
import {
    X,
    Share2,
    GitCompareArrows,
    Leaf,
    Droplets,
    Zap,
    ShieldCheck,
    FileText,
    ExternalLink,
    Recycle,
    MapPin,
    Tag,
    TrendingUp,
    TrendingDown,
    Minus,
    BadgeCheck,
} from 'lucide-react';
import { IrisGrade, ScoreBreakdown, ScoreReasonsList } from '@lumiris/scoring-ui';
import type { MobileProduct } from '@/lib/lumiris-data';

interface DeepRevealProps {
    product: MobileProduct;
    onClose: () => void;
}

const ENV_ICONS = [Leaf, Droplets, Zap] as const;

export function DeepReveal({ product, onClose }: DeepRevealProps) {
    const isOpaque = product.grade === 'E';

    const ratioIcon =
        product.priceGradeRatio === 'Great Deal' ? (
            <TrendingUp className="text-lumiris-emerald h-3.5 w-3.5" />
        ) : product.priceGradeRatio === 'Overpriced' ? (
            <TrendingDown className="text-lumiris-rose h-3.5 w-3.5" />
        ) : (
            <Minus className="text-lumiris-amber h-3.5 w-3.5" />
        );

    return (
        <motion.div
            className="bg-background flex h-full flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={isOpaque ? { filter: 'saturate(0.3) brightness(0.95)' } : {}}
        >
            <motion.div
                className="relative flex flex-col items-center px-6 pb-5 pt-14"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.15 }}
                >
                    <IrisGrade grade={product.grade} size="lg" className="h-28 w-28 text-5xl" />
                </motion.div>

                <motion.div
                    className="mt-3 flex flex-col items-center gap-0.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <span className="text-foreground font-mono text-xs">{Math.round(product.score)} / 100</span>
                    <h2 className="text-foreground mt-1 text-center text-lg font-bold leading-tight">{product.name}</h2>
                    <p className="text-muted-foreground text-sm">{product.brand}</p>
                </motion.div>
            </motion.div>

            <div className="flex-1 overflow-y-auto px-5 pb-28">
                <LayerSection title="Score" subtitle="50 / 30 / 20 breakdown" delay={0.2}>
                    <div className="border-border/60 bg-card rounded-2xl border p-4">
                        <ScoreBreakdown breakdown={product.breakdown} />
                    </div>
                </LayerSection>

                <LayerSection title="Why this grade" subtitle="Reasons surfaced by the algorithm" delay={0.28}>
                    <div className="border-border/60 bg-card rounded-2xl border p-4">
                        <ScoreReasonsList reasons={product.reasons} limit={6} />
                    </div>
                </LayerSection>

                <LayerSection title="Identity" subtitle="Brand & Value" delay={0.35}>
                    <div className="flex flex-col gap-3">
                        <div className="border-border/60 bg-card flex items-center gap-3 rounded-2xl border p-4">
                            <div className="bg-secondary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                                <Tag className="text-muted-foreground h-4 w-4" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-baseline justify-between">
                                    <div>
                                        <p className="text-foreground text-sm font-semibold">{product.brand}</p>
                                        <p className="text-muted-foreground text-xs">{product.category}</p>
                                    </div>
                                    <span className="text-foreground text-lg font-bold">€{product.price}</span>
                                </div>
                            </div>
                        </div>

                        <motion.div
                            className="border-border/60 bg-card flex items-center gap-3 rounded-2xl border p-4"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45 }}
                        >
                            <div className="bg-secondary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                                {ratioIcon}
                            </div>
                            <div className="flex-1">
                                <p className="text-muted-foreground text-xs font-medium uppercase">
                                    Price / Grade Ratio
                                </p>
                                <p className="text-foreground text-sm font-bold">{product.priceGradeRatio}</p>
                            </div>
                        </motion.div>
                    </div>
                </LayerSection>

                <LayerSection title="Composition" subtitle="Materials & Origins" delay={0.45}>
                    <div className="flex flex-col gap-3">
                        {product.composition.map((item, i) => (
                            <motion.div
                                key={item.material}
                                className="border-border/60 bg-card flex items-center gap-3 rounded-2xl border p-4"
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + i * 0.08 }}
                            >
                                <div className="bg-secondary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                                    {item.isRecycled ? (
                                        <Recycle className="text-lumiris-emerald h-4 w-4" />
                                    ) : (
                                        <Leaf className="text-lumiris-cyan h-4 w-4" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-foreground text-sm font-semibold">
                                                {item.material}
                                            </span>
                                            {item.originFlag && (
                                                <span className="bg-secondary text-muted-foreground rounded px-1.5 py-0.5 text-[10px] font-medium">
                                                    {item.originFlag} {item.origin}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-foreground text-sm font-bold">{item.percentage}%</span>
                                    </div>
                                    <div className="bg-secondary mt-2 h-1.5 w-full overflow-hidden rounded-full">
                                        <motion.div
                                            className={
                                                item.isRecycled
                                                    ? 'bg-lumiris-emerald h-full rounded-full'
                                                    : 'bg-lumiris-cyan h-full rounded-full'
                                            }
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.percentage}%` }}
                                            transition={{ delay: 0.65 + i * 0.08, duration: 0.7 }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </LayerSection>

                <LayerSection title="Impact Story" subtitle="Environmental Footprint" delay={0.6}>
                    <div className="flex flex-col gap-3">
                        {product.environmental.map((stat, i) => {
                            const IconComponent = ENV_ICONS[i % ENV_ICONS.length] ?? Leaf;
                            return (
                                <motion.div
                                    key={stat.label}
                                    className="border-border/60 bg-card flex items-start gap-3 rounded-2xl border p-4"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.65 + i * 0.08 }}
                                >
                                    <div className="bg-secondary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                                        <IconComponent className="text-lumiris-cyan h-4 w-4" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-[0.08em]">
                                            {stat.label}
                                        </span>
                                        <p className="text-foreground mt-0.5 text-xl font-bold">
                                            {stat.value}{' '}
                                            <span className="text-muted-foreground text-sm font-medium">
                                                {stat.unit}
                                            </span>
                                        </p>
                                        <p className="text-muted-foreground mt-0.5 text-xs">{stat.comparison}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </LayerSection>

                <LayerSection title="The Journey" subtitle="Supply Chain Timeline" delay={0.75}>
                    <div className="relative ml-3">
                        <div className="bg-border/40 absolute bottom-2 left-0 top-2 w-px" />

                        {product.journey.map((step, i) => (
                            <motion.div
                                key={`${step.stage}-${i}`}
                                className="relative mb-4 flex items-start gap-4 pl-7 last:mb-0"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 + i * 0.1 }}
                            >
                                <div className="bg-foreground absolute left-0 top-3 -ml-1 h-2 w-2 rounded-full" />

                                <div className="border-border/60 bg-card flex-1 rounded-2xl border p-3.5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="text-muted-foreground h-3 w-3" />
                                            <span className="text-foreground text-xs font-bold uppercase">
                                                {step.stage}
                                            </span>
                                        </div>
                                        <span className="text-muted-foreground text-[10px] font-medium">
                                            {step.date}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
                                        {step.flag && (
                                            <span className="text-foreground/70 text-xs font-medium">{step.flag}</span>
                                        )}
                                        {step.location}
                                        {step.country && `, ${step.country}`}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </LayerSection>

                <LayerSection title="Verified Proofs" subtitle="Certificates & Badges" delay={0.9}>
                    <div className="flex flex-col gap-3">
                        {product.certificates.length === 0 && (
                            <div className="border-border/60 bg-card flex flex-col items-center gap-2 rounded-2xl border py-8 text-center">
                                <FileText className="text-muted-foreground/40 h-6 w-6" />
                                <p className="text-muted-foreground text-sm">No certificates provided</p>
                            </div>
                        )}
                        {product.certificates.map((cert, i) => (
                            <motion.button
                                key={cert.name}
                                className="border-border/60 bg-card hover:bg-secondary/60 flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.95 + i * 0.08 }}
                            >
                                <div className="bg-lumiris-emerald/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                                    {cert.verified ? (
                                        <ShieldCheck className="text-lumiris-emerald h-4 w-4" />
                                    ) : (
                                        <FileText className="text-muted-foreground h-4 w-4" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-foreground text-sm font-semibold">{cert.name}</span>
                                        {cert.verified && (
                                            <span className="bg-lumiris-emerald/10 text-lumiris-emerald rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground mt-0.5 text-xs">{cert.issuer}</p>
                                </div>
                                <ExternalLink className="text-muted-foreground/50 h-3.5 w-3.5 shrink-0" />
                            </motion.button>
                        ))}

                        {product.certificates.length > 0 && (
                            <motion.div
                                className="border-lumiris-emerald/20 bg-lumiris-emerald/5 mt-1 flex items-center justify-center gap-2 rounded-2xl border py-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.1 }}
                            >
                                <BadgeCheck className="text-lumiris-emerald h-4 w-4" />
                                <span className="text-lumiris-emerald text-xs font-bold tracking-wide">
                                    Certified by Lumiris
                                </span>
                            </motion.div>
                        )}
                    </div>
                </LayerSection>

                <motion.div
                    className="border-border/40 bg-secondary/50 mb-4 rounded-2xl border px-4 py-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                >
                    <p className="text-muted-foreground font-mono text-[10px] leading-relaxed">
                        ID: {product.id.toUpperCase()} / DPP: {product.dpp.id} / Scanned:{' '}
                        {new Date(product.scannedAt).toLocaleDateString('en-GB')} / Grade {product.grade}
                    </p>
                </motion.div>
            </div>

            <motion.div
                className="border-border/40 bg-background/80 absolute bottom-0 left-0 right-0 border-t px-5 pb-8 pt-3 backdrop-blur-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="border-border bg-card active:bg-secondary flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-colors"
                    >
                        <X className="text-foreground h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        className="border-border bg-card active:bg-secondary flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border transition-colors"
                    >
                        <Share2 className="text-foreground h-4 w-4" />
                        <span className="text-foreground text-sm font-semibold">Share</span>
                    </button>
                    <button
                        type="button"
                        className="border-border bg-card active:bg-secondary flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border transition-colors"
                    >
                        <GitCompareArrows className="text-foreground h-4 w-4" />
                        <span className="text-foreground text-sm font-semibold">Compare</span>
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

interface LayerSectionProps {
    title: string;
    subtitle: string;
    delay: number;
    children: React.ReactNode;
}

function LayerSection({ title, subtitle, delay, children }: LayerSectionProps) {
    return (
        <motion.section
            className="mb-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <div className="mb-3 flex items-baseline gap-2">
                <h3 className="text-foreground text-sm font-bold tracking-tight">{title}</h3>
                <span className="text-muted-foreground text-[11px]">{subtitle}</span>
            </div>
            {children}
        </motion.section>
    );
}
