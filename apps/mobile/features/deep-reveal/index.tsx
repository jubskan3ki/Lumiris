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
import { type Product, GRADE_CONFIG } from '@/lib/lumiris-data';

interface DeepRevealProps {
    product: Product;
    onClose: () => void;
}

export function DeepReveal({ product, onClose }: DeepRevealProps) {
    const gradeConfig = GRADE_CONFIG[product.grade];
    const isOpaque = product.grade === 'E';

    const ratioIcon =
        product.priceGradeRatio === 'Great Deal' ? (
            <TrendingUp className="text-grade-a h-3.5 w-3.5" />
        ) : product.priceGradeRatio === 'Overpriced' ? (
            <TrendingDown className="text-grade-e h-3.5 w-3.5" />
        ) : (
            <Minus className="text-grade-c h-3.5 w-3.5" />
        );

    const ratioColor =
        product.priceGradeRatio === 'Great Deal'
            ? '#059669'
            : product.priceGradeRatio === 'Overpriced'
              ? '#e11d48'
              : '#f59e0b';

    return (
        <motion.div
            className="bg-background flex h-full flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={isOpaque ? { filter: 'saturate(0.3) brightness(0.95)' } : {}}
        >
            {/* Score Hero */}
            <motion.div
                className="relative flex flex-col items-center px-6 pb-5 pt-14"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Soft iridescent glow behind grade */}
                <div
                    className="absolute top-10 h-32 w-32 rounded-full opacity-15 blur-[50px]"
                    style={{ background: gradeConfig.color }}
                />

                {/* Grade circle - glassmorphism */}
                <motion.div
                    className="relative flex h-28 w-28 items-center justify-center rounded-full"
                    style={{
                        background: 'rgba(255,255,255,0.7)',
                        backdropFilter: 'blur(24px)',
                        border: `2px solid ${gradeConfig.color}`,
                        boxShadow:
                            product.grade === 'A'
                                ? `0 0 24px rgba(5,150,105,0.2), 0 0 48px rgba(5,150,105,0.08)`
                                : `0 4px 24px ${gradeConfig.color}1a`,
                    }}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                        type: 'spring',
                        stiffness: 180,
                        damping: 14,
                        delay: 0.15,
                    }}
                >
                    <span className="text-5xl font-bold" style={{ color: gradeConfig.color }}>
                        {product.grade}
                    </span>
                </motion.div>

                <motion.div
                    className="mt-3 flex flex-col items-center gap-0.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <span
                        className="text-[11px] font-bold uppercase tracking-[0.15em]"
                        style={{ color: gradeConfig.color }}
                    >
                        {gradeConfig.label}
                    </span>
                    <h2 className="text-foreground mt-1 text-center text-lg font-bold leading-tight">{product.name}</h2>
                    <p className="text-muted-foreground text-sm">{product.brand}</p>
                </motion.div>
            </motion.div>

            {/* Scrollable Layers */}
            <div className="flex-1 overflow-y-auto px-5 pb-28">
                {/* Layer 0: Identity */}
                <LayerSection title="Identity" subtitle="Brand & Value" delay={0.25}>
                    <div className="flex flex-col gap-3">
                        <div className="border-border/60 bg-card flex items-center gap-3 rounded-2xl border p-4">
                            <div className="bg-secondary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                                <Tag className="h-4.5 w-4.5 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-baseline justify-between">
                                    <div>
                                        <p className="text-foreground text-sm font-semibold">{product.brand}</p>
                                        <p className="text-muted-foreground text-xs">{product.category}</p>
                                    </div>
                                    <span className="text-foreground text-lg font-bold">
                                        {'\u20AC'}
                                        {product.price}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Deal or No Deal insight */}
                        <motion.div
                            className="border-border/60 bg-card flex items-center gap-3 rounded-2xl border p-4"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                        >
                            <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                style={{ background: `${ratioColor}10` }}
                            >
                                {ratioIcon}
                            </div>
                            <div className="flex-1">
                                <p className="text-muted-foreground text-xs font-medium uppercase">
                                    Price / Grade Ratio
                                </p>
                                <p className="text-sm font-bold" style={{ color: ratioColor }}>
                                    {product.priceGradeRatio}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </LayerSection>

                {/* Layer 1: Composition */}
                <LayerSection title="Composition" subtitle="Materials & Origins" delay={0.35}>
                    <div className="flex flex-col gap-3">
                        {product.composition.map((item, i) => (
                            <motion.div
                                key={item.material}
                                className="border-border/60 bg-card flex items-center gap-3 rounded-2xl border p-4"
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.08 }}
                            >
                                <div className="bg-secondary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                                    {item.isRecycled ? (
                                        <Recycle className="text-grade-a h-4 w-4" />
                                    ) : (
                                        <Leaf className="text-grade-b h-4 w-4" />
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
                                            className="h-full rounded-full"
                                            style={{
                                                background: item.isRecycled
                                                    ? GRADE_CONFIG.A.color
                                                    : GRADE_CONFIG.B.color,
                                            }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.percentage}%` }}
                                            transition={{ delay: 0.55 + i * 0.08, duration: 0.7 }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </LayerSection>

                {/* Layer 2: Impact Story */}
                <LayerSection title="Impact Story" subtitle="Environmental Footprint" delay={0.5}>
                    <div className="flex flex-col gap-3">
                        {product.environmental.map((stat, i) => {
                            const icons = [Leaf, Droplets, Zap];
                            const IconComponent = icons[i % icons.length];
                            return (
                                <motion.div
                                    key={stat.label}
                                    className="border-border/60 bg-card flex items-start gap-3 rounded-2xl border p-4"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.55 + i * 0.08 }}
                                >
                                    <div className="bg-secondary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                                        <IconComponent className="text-grade-b h-4 w-4" />
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

                {/* Layer 3: The Journey (Timeline) */}
                <LayerSection title="The Journey" subtitle="Supply Chain Timeline" delay={0.65}>
                    <div className="relative ml-3">
                        {/* Timeline line */}
                        <div
                            className="absolute bottom-2 left-0 top-2 w-px"
                            style={{ background: `${gradeConfig.color}30` }}
                        />

                        {product.journey.map((step, i) => (
                            <motion.div
                                key={step.stage}
                                className="relative mb-4 flex items-start gap-4 pl-7 last:mb-0"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 + i * 0.1 }}
                            >
                                {/* Timeline dot */}
                                <div
                                    className="absolute left-0 top-3 -ml-[4px] h-2 w-2 rounded-full"
                                    style={{ background: gradeConfig.color }}
                                />

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
                                        {step.location}, {step.country}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </LayerSection>

                {/* Layer 4: Verified Proofs */}
                <LayerSection title="Verified Proofs" subtitle="Certificates & Badges" delay={0.8}>
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
                                transition={{ delay: 0.85 + i * 0.08 }}
                            >
                                <div className="bg-grade-a/8 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                                    {cert.verified ? (
                                        <ShieldCheck className="h-4.5 w-4.5 text-grade-a" />
                                    ) : (
                                        <FileText className="h-4.5 w-4.5 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-foreground text-sm font-semibold">{cert.name}</span>
                                        {cert.verified && (
                                            <span className="bg-grade-a/10 text-grade-a rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground mt-0.5 text-xs">{cert.issuer}</p>
                                </div>
                                <ExternalLink className="text-muted-foreground/50 h-3.5 w-3.5 shrink-0" />
                            </motion.button>
                        ))}

                        {/* Certified by Lumiris badge */}
                        {product.certificates.length > 0 && (
                            <motion.div
                                className="border-grade-a/20 bg-grade-a/5 mt-1 flex items-center justify-center gap-2 rounded-2xl border py-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.0 }}
                            >
                                <BadgeCheck className="text-grade-a h-4 w-4" />
                                <span className="text-grade-a text-xs font-bold tracking-wide">
                                    Certified by Lumiris
                                </span>
                            </motion.div>
                        )}
                    </div>
                </LayerSection>

                {/* Technical ID - Geist Mono */}
                <motion.div
                    className="border-border/40 bg-secondary/50 mb-4 rounded-2xl border px-4 py-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                >
                    <p className="text-muted-foreground font-mono text-[10px] leading-relaxed">
                        ID: {product.id.toUpperCase()} / Scanned:{' '}
                        {new Date(product.scannedAt).toLocaleDateString('en-GB')} / Grade {product.grade} /{' '}
                        {product.brand}
                    </p>
                </motion.div>
            </div>

            {/* Bottom action bar - Thumb Zone */}
            <motion.div
                className="border-border/40 bg-background/80 absolute bottom-0 left-0 right-0 border-t px-5 pb-8 pt-3 backdrop-blur-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="border-border bg-card active:bg-secondary flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-colors"
                    >
                        <X className="text-foreground h-5 w-5" />
                    </button>
                    <button className="border-border bg-card active:bg-secondary flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border transition-colors">
                        <Share2 className="text-foreground h-4 w-4" />
                        <span className="text-foreground text-sm font-semibold">Share</span>
                    </button>
                    <button className="border-border bg-card active:bg-secondary flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border transition-colors">
                        <GitCompareArrows className="text-foreground h-4 w-4" />
                        <span className="text-foreground text-sm font-semibold">Compare</span>
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

function LayerSection({
    title,
    subtitle,
    delay,
    children,
}: {
    title: string;
    subtitle: string;
    delay: number;
    children: React.ReactNode;
}) {
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
