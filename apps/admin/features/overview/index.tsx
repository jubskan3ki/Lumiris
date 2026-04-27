'use client';

import { memo, useMemo } from 'react';
import { motion, type Variants } from 'framer-motion';
import { ListChecks, ShieldCheck, BarChart3, FileEdit, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { computeScore } from '@lumiris/core';
import { mockKpi as kpiData } from '@lumiris/mock-data/kpi';
import { mockDpps as dppRecords } from '@lumiris/mock-data/dpp';
import { mockCertificates } from '@lumiris/mock-data/certificates';
import { mockTeamActivity as teamActivity } from '@lumiris/mock-data/team';
import { mockJournalArticles as journalArticles } from '@lumiris/mock-data/journal';
import { cn } from '@lumiris/ui/lib/cn';

const containerAnim: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
};

const itemAnim: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

function OverviewComponent() {
    const scores = useMemo(
        () =>
            dppRecords.map((dpp) =>
                computeScore(dpp, {
                    certificates: mockCertificates.filter((c) => c.factory === dpp.supplierFactory),
                }),
            ),
        [],
    );

    const platformAverage = useMemo(() => {
        if (scores.length === 0) return 0;
        const sum = scores.reduce((acc, s) => acc + s.total, 0);
        return sum / scores.length;
    }, [scores]);

    const gradeEcount = useMemo(() => scores.filter((s) => s.grade === 'E').length, [scores]);

    const silos = [
        {
            label: 'Active Audits',
            value: dppRecords.filter((r) => r.status === 'Audit_Pending' || r.status === 'Draft').length,
            subLabel: 'In pipeline',
            icon: ListChecks,
            accentClass: 'text-lumiris-emerald',
            bgClass: 'bg-lumiris-emerald/6',
            borderClass: 'border-lumiris-emerald/15',
            trend: `${gradeEcount} flagged Grade E`,
            trendUp: gradeEcount === 0,
        },
        {
            label: 'Transparency Score',
            value: `${platformAverage.toFixed(1)}`,
            subLabel: 'Live mean (computeScore)',
            icon: ShieldCheck,
            accentClass: 'text-lumiris-cyan',
            bgClass: 'bg-lumiris-cyan/6',
            borderClass: 'border-lumiris-cyan/15',
            trend: `${scores.length} DPPs scored`,
            trendUp: true,
        },
        {
            label: 'App Traffic',
            value: kpiData.activeScans.toLocaleString(),
            subLabel: 'Scans in 24h',
            icon: BarChart3,
            accentClass: 'text-lumiris-amber',
            bgClass: 'bg-lumiris-amber/6',
            borderClass: 'border-lumiris-amber/15',
            trend: '+340 scans',
            trendUp: true,
        },
        {
            label: 'Content Readiness',
            value: `${journalArticles.filter((a) => a.status === 'Published').length}/${journalArticles.length}`,
            subLabel: 'Articles published',
            icon: FileEdit,
            accentClass: 'text-foreground',
            bgClass: 'bg-muted',
            borderClass: 'border-border',
            trend: `${journalArticles.filter((a) => a.status === 'Draft').length} drafts pending`,
            trendUp: false,
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-foreground text-balance text-xl font-semibold">
                    Good morning. Here&apos;s your platform overview.
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                    Real-time metrics — KPIs derived from{' '}
                    <span className="text-foreground font-mono">computeScore</span>, not stored values.
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
                <div className="border-border border-b px-6 py-4">
                    <h3 className="text-foreground text-sm font-semibold">Team Activity</h3>
                    <p className="text-muted-foreground mt-0.5 text-xs">Recent actions across the platform</p>
                </div>
                <div className="divide-border divide-y">
                    {teamActivity.map((entry, idx) => (
                        <div key={idx} className="flex items-start gap-4 px-6 py-4">
                            <div
                                className={cn(
                                    'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                                    entry.avatar === 'SY'
                                        ? 'bg-muted text-muted-foreground'
                                        : 'bg-lumiris-emerald/8 text-lumiris-emerald',
                                )}
                            >
                                {entry.avatar}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-foreground text-sm font-medium">{entry.user}</span>
                                    <span className="text-muted-foreground text-xs">{entry.role}</span>
                                </div>
                                <p className="text-muted-foreground mt-0.5 text-sm leading-relaxed">{entry.action}</p>
                            </div>
                            <span className="text-muted-foreground/60 flex-shrink-0 text-xs">{entry.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export const Overview = memo(OverviewComponent);
