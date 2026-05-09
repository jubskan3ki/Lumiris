'use client';

import { memo, useMemo } from 'react';
import { motion, type Variants } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, BarChart3, Coins, FileText, Sparkles, Store } from 'lucide-react';
import { computeScore } from '@lumiris/core/scoring';
import { mockArtisans, mockPassports } from '@lumiris/mock-data';
import { IRIS_GRADES, type Artisan, type ArtisanTier, type IrisGrade } from '@lumiris/types';
import { cn } from '@lumiris/ui/lib/cn';
import { useAdminAuditLog } from '@/lib/auth';

const containerAnim: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemAnim: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

// MRR by tier - kept inline since billing types live in api-client (roadmap).
const TIER_MRR_EUR: Record<ArtisanTier, number> = {
    Solo: 29,
    Studio: 79,
    Maison: 149,
};

const PLUS_ADDON_MRR = 19; // ATELIER+ add-on per artisan
const LOCAL_AVG_MRR = 12; // Average LUMIRIS Local subscription

const SCORING_NOW = new Date('2026-04-30T08:00:00Z');

function OverviewComponent() {
    const auditLog = useAdminAuditLog();

    // 1. Artisans actifs - split par tier + churn 30j (stub : 0 sur les fixtures actuelles).
    const artisanKpi = useMemo(() => {
        const total = mockArtisans.length;
        const splitByTier: Record<ArtisanTier, number> = {
            Solo: mockArtisans.filter((a: Artisan) => a.tier === 'Solo').length,
            Studio: mockArtisans.filter((a: Artisan) => a.tier === 'Studio').length,
            Maison: mockArtisans.filter((a: Artisan) => a.tier === 'Maison').length,
        };
        return { total, splitByTier, churn30d: 0 };
    }, []);

    // 2. Passeports en file de curation - basé sur Passport.status + moderation.
    const curationKpi = useMemo(() => {
        const pending = mockPassports.filter(
            (p) => p.status !== 'Published' || p.moderation?.status === 'PendingReview',
        );
        const inCompletion = mockPassports.filter((p) => p.status === 'InCompletion').length;
        const draft = mockPassports.filter((p) => p.status === 'Draft').length;
        return { pendingCount: pending.length, inCompletion, draft };
    }, []);

    // 3. Score Iris moyen plateforme + grade dominant + nb plafonnés.
    const irisKpi = useMemo(() => {
        const published = mockPassports.filter((p) => p.status === 'Published');
        if (published.length === 0) {
            const dominantGrade: IrisGrade | '-' = '-';
            return { avg: 0, dominantGrade, cappedCount: 0, sampleSize: 0 };
        }
        const results = published.map((passport) => {
            const artisan = mockArtisans.find((a) => a.id === passport.artisanId);
            return computeScore(passport, {
                certificates: passport.materials.flatMap((m) => m.certifications),
                ...(artisan ? { artisan } : {}),
                now: SCORING_NOW,
            });
        });
        const avg = results.reduce((s, r) => s + r.total, 0) / results.length;
        const cappedCount = results.filter((r) => r.cap?.applied).length;
        const gradeCount: Record<IrisGrade, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
        results.forEach((r) => {
            gradeCount[r.grade] += 1;
        });
        const dominantGrade = IRIS_GRADES.reduce<IrisGrade>(
            (best, g) => (gradeCount[g] > gradeCount[best] ? g : best),
            'A',
        );
        return { avg, dominantGrade, cappedCount, sampleSize: published.length };
    }, []);

    // 4. MRR consolidé (ATELIER + ATELIER+ + Local proxy).
    const mrrKpi = useMemo(() => {
        const tierMrr = mockArtisans.reduce((s: number, a: Artisan) => s + TIER_MRR_EUR[a.tier], 0);
        const plusMrr = mockArtisans.filter((a: Artisan) => a.plus).length * PLUS_ADDON_MRR;
        const localMrrProxy = 15 * LOCAL_AVG_MRR; // 15 retoucheurs abonnés, valeur indicative
        const total = tierMrr + plusMrr + localMrrProxy;
        const arr = total * 12;
        return { mrrTotal: total, arrTotal: arr };
    }, []);

    const silos = [
        {
            label: 'Artisans actifs',
            icon: Store,
            value: `${artisanKpi.total}`,
            subLabel: `${artisanKpi.splitByTier.Solo} Solo · ${artisanKpi.splitByTier.Studio} Studio · ${artisanKpi.splitByTier.Maison} Maison`,
            accentClass: 'text-lumiris-emerald',
            bgClass: 'bg-lumiris-emerald/8',
            borderClass: 'border-lumiris-emerald/15',
            trend: `Churn 30j : ${artisanKpi.churn30d}`,
            trendUp: artisanKpi.churn30d === 0,
        },
        {
            label: 'File de curation',
            icon: FileText,
            value: `${curationKpi.pendingCount}`,
            subLabel: `${curationKpi.draft} draft · ${curationKpi.inCompletion} en complétion`,
            accentClass: 'text-lumiris-amber',
            bgClass: 'bg-lumiris-amber/8',
            borderClass: 'border-lumiris-amber/15',
            trend: 'Délai moyen - à venir',
            trendUp: false,
        },
        {
            label: 'Score Iris moyen',
            icon: Sparkles,
            value: irisKpi.sampleSize === 0 ? '-' : irisKpi.avg.toFixed(1),
            subLabel:
                irisKpi.sampleSize === 0
                    ? 'Aucun passeport publié'
                    : `Grade dominant ${irisKpi.dominantGrade} · ${irisKpi.cappedCount} plafonnés`,
            accentClass: 'text-lumiris-cyan',
            bgClass: 'bg-lumiris-cyan/8',
            borderClass: 'border-lumiris-cyan/15',
            trend: `${irisKpi.sampleSize} passeports notés`,
            trendUp: irisKpi.cappedCount === 0,
        },
        {
            label: 'MRR consolidé',
            icon: Coins,
            value: `${Math.round(mrrKpi.mrrTotal).toLocaleString('fr-FR')} €`,
            subLabel: `ARR projeté ${Math.round(mrrKpi.arrTotal / 1000).toLocaleString('fr-FR')} k€`,
            accentClass: 'text-lumiris-orange',
            bgClass: 'bg-lumiris-orange/8',
            borderClass: 'border-lumiris-orange/15',
            trend: 'Atelier + Plus + Local',
            trendUp: true,
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-foreground text-balance text-xl font-semibold">
                    Bonjour. Voici l&apos;état de la plateforme.
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                    KPIs calculés en direct via <span className="text-foreground font-mono">computeScore</span>, jamais
                    stockés.
                </p>
            </div>

            <motion.div
                variants={containerAnim}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 gap-4 lg:grid-cols-4"
            >
                {silos.map((silo) => (
                    <motion.div
                        key={silo.label}
                        variants={itemAnim}
                        className={cn('opal-shadow bg-card flex flex-col rounded-xl border p-5', silo.borderClass)}
                    >
                        <div className="flex items-center justify-between">
                            <div className={cn('rounded-lg p-2', silo.bgClass)}>
                                <silo.icon className={cn('h-[18px] w-[18px]', silo.accentClass)} />
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className={cn('font-mono text-3xl font-bold tracking-tight', silo.accentClass)}>
                                {silo.value}
                            </span>
                            <p className="text-muted-foreground mt-0.5 text-xs">{silo.subLabel}</p>
                        </div>
                        <div className="mt-3 flex items-center gap-1.5">
                            {silo.trendUp ? (
                                <ArrowUpRight className="text-lumiris-emerald h-3 w-3" />
                            ) : (
                                <ArrowDownRight className="text-muted-foreground h-3 w-3" />
                            )}
                            <span
                                className={cn(
                                    'text-[11px]',
                                    silo.trendUp ? 'text-lumiris-emerald' : 'text-muted-foreground',
                                )}
                            >
                                {silo.trend}
                            </span>
                        </div>
                        <p className="text-foreground mt-auto pt-3 text-[13px] font-medium">{silo.label}</p>
                    </motion.div>
                ))}
            </motion.div>

            <div className="opal-shadow border-border bg-card rounded-xl border">
                <div className="border-border flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <h3 className="text-foreground text-sm font-semibold">Activité de curation</h3>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                            Validations, flags, overrides - alimenté par l&apos;audit log live
                        </p>
                    </div>
                    <BarChart3 className="text-muted-foreground/50 h-4 w-4" aria-hidden />
                </div>
                <div className="divide-border divide-y">
                    {auditLog.slice(0, 8).map((entry) => (
                        <div key={entry.id} className="flex items-start gap-4 px-6 py-3.5">
                            <div className="bg-lumiris-emerald/8 text-lumiris-emerald flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold">
                                {entry.actorRole.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-foreground text-sm">
                                    <span className="font-medium">{entry.actorId}</span>{' '}
                                    <span className="text-muted-foreground">
                                        {entry.action} · {entry.targetType} {entry.targetId}
                                    </span>
                                </p>
                            </div>
                            <span className="text-muted-foreground/60 shrink-0 font-mono text-[10px]">
                                {new Date(entry.ts).toLocaleString('fr-FR', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </div>
                    ))}
                    {auditLog.length === 0 ? (
                        <p className="text-muted-foreground px-6 py-8 text-center text-sm">Aucune activité récente.</p>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export const Overview = memo(OverviewComponent);
