'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, MapPin, Store, Wrench } from 'lucide-react';
import { cn } from '@lumiris/ui/lib/cn';
import type { LocalPoint } from './types';

interface PointCardProps {
    point: LocalPoint;
    index: number;
}

export function PointCard({ point, index }: PointCardProps) {
    const prefersReduced = useReducedMotion();
    const isArtisan = point.kind === 'artisan';
    const href = isArtisan ? `/artisans/${point.slug}` : `/retoucheurs/${point.slug}`;
    const ariaLabel = `${isArtisan ? 'Atelier' : 'Retoucheur'} ${point.name}, ${point.city}, ${point.region}${point.distanceKm !== undefined ? `, a ${formatDistance(point.distanceKm)}` : ''}`;

    return (
        <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * index }}
        >
            <Link
                href={href}
                aria-label={ariaLabel}
                className={cn(
                    'bg-card border-border/40 group relative block overflow-hidden rounded-3xl border shadow-sm',
                    'transition-all duration-200 active:scale-[0.985]',
                    'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                    'hover:shadow-md',
                )}
            >
                <article className="relative">
                    <div className="aspect-16/10 relative w-full overflow-hidden">
                        <HeroBackdrop isArtisan={isArtisan} prefersReduced={prefersReduced ?? false} />

                        <div
                            aria-hidden
                            className="bg-linear-to-t absolute inset-0 from-black/60 via-black/5 to-transparent"
                        />

                        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
                            <span
                                className={cn(
                                    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold',
                                    'text-foreground bg-white/85 shadow-sm backdrop-blur-md',
                                )}
                            >
                                {isArtisan ? (
                                    <Store className="text-lumiris-emerald h-3 w-3" aria-hidden />
                                ) : (
                                    <Wrench className="text-lumiris-cyan h-3 w-3" aria-hidden />
                                )}
                                {isArtisan ? 'Atelier' : 'Retoucheur'}
                            </span>

                            {point.distanceKm !== undefined ? (
                                <span className="text-foreground inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur-md">
                                    <MapPin className="h-3 w-3" aria-hidden />
                                    {formatDistance(point.distanceKm)}
                                </span>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 px-4 py-3.5">
                        <div className="min-w-0 flex-1">
                            <h3 className="text-foreground line-clamp-1 text-[15px] font-semibold leading-tight tracking-tight">
                                {point.name}
                            </h3>
                            <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
                                {formatSpecialties(point.specialties) ?? `${point.city}, ${point.region}`}
                            </p>
                        </div>
                        <span
                            aria-hidden
                            className={cn(
                                'border-border/60 text-muted-foreground inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all',
                                'group-hover:border-foreground group-hover:text-foreground group-hover:bg-foreground/[0.04]',
                                prefersReduced ? '' : 'group-hover:rotate-12',
                            )}
                        >
                            <ArrowUpRight className="h-4 w-4" aria-hidden />
                        </span>
                    </div>
                </article>
            </Link>
        </motion.div>
    );
}

function HeroBackdrop({ isArtisan, prefersReduced }: { isArtisan: boolean; prefersReduced: boolean }) {
    if (isArtisan) {
        return (
            <div aria-hidden className="absolute inset-0 overflow-hidden bg-[#0a0f14]">
                <div
                    className="absolute -left-1/4 -top-1/3 h-[150%] w-[80%] rounded-full opacity-80 blur-3xl"
                    style={{ background: 'radial-gradient(circle, var(--lumiris-emerald), transparent 65%)' }}
                />
                <div
                    className="absolute -bottom-1/3 -right-1/4 h-[140%] w-[75%] rounded-full opacity-70 blur-3xl"
                    style={{ background: 'radial-gradient(circle, var(--lumiris-amber), transparent 65%)' }}
                />
                <div
                    className="absolute left-1/3 top-1/4 h-[60%] w-[60%] rounded-full opacity-50 blur-2xl"
                    style={{ background: 'radial-gradient(circle, var(--lumiris-cyan), transparent 60%)' }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#0a0f14_120%)]" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Store
                        className={cn(
                            'h-16 w-16 text-white/90 drop-shadow-2xl',
                            prefersReduced ? '' : 'transition-transform duration-500 group-hover:scale-110',
                        )}
                        strokeWidth={1.4}
                        aria-hidden
                    />
                </div>
            </div>
        );
    }

    return (
        <div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center overflow-hidden"
            style={{ background: 'linear-gradient(135deg, var(--lumiris-cyan), var(--lumiris-amber))' }}
        >
            <div className="absolute inset-0 opacity-50 mix-blend-overlay [background:radial-gradient(circle_at_30%_20%,white,transparent_55%)]" />
            <div className="absolute inset-0 opacity-30 mix-blend-soft-light [background:radial-gradient(circle_at_80%_85%,white,transparent_55%)]" />
            <Wrench
                className={cn(
                    'relative h-14 w-14 text-white/95 drop-shadow-md',
                    prefersReduced ? '' : 'transition-transform duration-500 group-hover:scale-110',
                )}
                strokeWidth={1.5}
                aria-hidden
            />
        </div>
    );
}

function formatSpecialties(specialties?: readonly string[]): string | null {
    if (!specialties || specialties.length === 0) return null;
    const first = specialties.slice(0, 3);
    const extra = specialties.length - first.length;
    return extra > 0 ? `${first.join(' · ')} · +${extra}` : first.join(' · ');
}

function formatDistance(km: number): string {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    if (km < 10) return `${km.toFixed(1)} km`;
    return `${Math.round(km)} km`;
}
