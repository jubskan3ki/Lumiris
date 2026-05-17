'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowRight, FileText, ShieldCheck, Sparkles } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { computeScore } from '@lumiris/core/scoring';
import type { IrisGrade as IrisGradeLetter } from '@lumiris/types';
import { Card, CardContent, CardHeader, CardTitle } from '@lumiris/ui/components/card';
import { ChartContainer, type ChartConfig } from '@lumiris/ui/components/chart';
import { Button } from '@lumiris/ui/components/button';
import { IrisGrade, AtelierStatusBadge, GRADE_COLOR, MissingFieldsBadge } from '@lumiris/scoring-ui';
import { CreatePassportCta } from '@/features/quota-upsell/create-passport-cta';
import { useCurrentArtisan } from '@/lib/current-artisan';
import { PASSPORT_STATUS_DESCRIPTION } from '@/lib/passport-status';
import { usePassports } from '@/lib/passports-source';
import { ESPR_TEXTILE_TIMELINE, isEsprWindowActive } from '@/lib/regulatory';
import { AttentionBlock } from './attention-block';
import {
    expiringCertificates,
    greeting,
    incompletePassports,
    loadMergedCertificates,
    loadMergedInvoices,
    onboardingChecklist,
    publishedThisWeek,
    quotaUsage,
    type ScoredPassport,
} from './derive';
import { EmptyState } from './empty-state';
import { QuickActions } from './quick-actions';

const GRADES: readonly IrisGradeLetter[] = ['A', 'B', 'C', 'D', 'E'];

const CHART_CONFIG: ChartConfig = {
    count: { label: 'Passeports' },
};

export function Dashboard() {
    const artisan = useCurrentArtisan();
    const passports = usePassports(artisan.id);

    const now = useMemo(() => new Date(), []);
    const certificates = useMemo(() => loadMergedCertificates(artisan.id), [artisan.id]);
    const invoices = useMemo(() => loadMergedInvoices(artisan.id), [artisan.id]);

    const scored: readonly ScoredPassport[] = useMemo(
        () =>
            passports.map((passport) => ({
                passport,
                score: computeScore(passport, {
                    artisan,
                    certificates,
                    now,
                }),
            })),
        [artisan, passports, certificates, now],
    );

    const isEmpty = passports.length === 0;
    const checklist = useMemo(() => onboardingChecklist(artisan, passports, invoices), [artisan, passports, invoices]);

    const expiring = useMemo(() => expiringCertificates(certificates, now), [certificates, now]);
    const incomplete = useMemo(() => incompletePassports(scored), [scored]);
    const quota = useMemo(() => quotaUsage(passports, artisan.tier), [passports, artisan.tier]);
    const showAttention = !isEmpty && (expiring.length > 0 || incomplete.length > 0 || quota.percent > 80);

    const stats = useMemo(() => {
        const published = scored.filter((s) => s.passport.status === 'Published');
        const incompletion = scored.filter((s) => s.passport.status === 'InCompletion');
        const drafts = scored.filter((s) => s.passport.status === 'Draft');
        const publishedAvg =
            published.length === 0 ? 0 : published.reduce((acc, s) => acc + s.score.total, 0) / published.length;

        return {
            published: published.length,
            incompletion: incompletion.length,
            drafts: drafts.length,
            avgScore: Math.round(publishedAvg * 10) / 10,
        };
    }, [scored]);

    const distribution = useMemo(() => {
        const buckets: Record<IrisGradeLetter, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
        for (const { score, passport } of scored) {
            if (passport.status === 'Draft') continue;
            buckets[score.grade] += 1;
        }
        return GRADES.map((grade) => ({
            grade,
            count: buckets[grade],
            fill: `var(--${GRADE_COLOR[grade]})`,
        }));
    }, [scored]);

    const recent = useMemo(
        () => [...scored].sort((a, b) => (a.passport.updatedAt < b.passport.updatedAt ? 1 : -1)).slice(0, 5),
        [scored],
    );

    const firstName = artisan.displayName.split(' ')[0];
    const weeklyPublished = useMemo(() => publishedThisWeek(passports, now), [passports, now]);
    const showEsprWindow = isEsprWindowActive(now);

    if (isEmpty) {
        return (
            <div className="space-y-6 p-8">
                <EmptyState artisan={artisan} items={checklist} />
                {showEsprWindow && <EsprWindowCard />}
            </div>
        );
    }

    return (
        <div className="space-y-6 p-8">
            <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="text-lumiris-emerald h-4 w-4" />
                            {greeting(now)} {firstName}
                        </CardTitle>
                        <p className="text-muted-foreground mt-1 text-xs">
                            {artisan.atelierName} · {artisan.city}
                        </p>
                        <p className="text-muted-foreground mt-2 text-sm">
                            {weeklyPublished === 0
                                ? 'Aucun passeport publié cette semaine.'
                                : `${weeklyPublished} passeport${weeklyPublished > 1 ? 's' : ''} publié${weeklyPublished > 1 ? 's' : ''} cette semaine.`}
                        </p>
                    </div>
                    <CreatePassportCta className="bg-lumiris-emerald hover:bg-lumiris-emerald/90 text-white">
                        Créer un passeport
                    </CreatePassportCta>
                </CardHeader>
            </Card>

            <QuickActions />

            {showEsprWindow && (
                <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="text-lumiris-emerald h-3.5 w-3.5" />
                    Mi-2028 : DPP textile obligatoire. Vous avez {stats.published} passeport
                    {stats.published > 1 ? 's' : ''} prêt{stats.published > 1 ? 's' : ''}.
                </p>
            )}

            {showAttention && <AttentionBlock expiring={expiring} incomplete={incomplete} quota={quota} />}

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <KpiCard label="Publiés" value={stats.published} hint="Passeports vivants" />
                <KpiCard
                    label="En complétion"
                    value={stats.incompletion}
                    hint={PASSPORT_STATUS_DESCRIPTION.InCompletion}
                />
                <KpiCard label="Brouillons" value={stats.drafts} hint="En cours de création" />
                <KpiCard
                    label="Score Iris moyen"
                    value={stats.avgScore}
                    hint="Sur les passeports publiés"
                    suffix={stats.published === 0 ? '' : ' / 100'}
                />
            </section>

            <section>
                <Card>
                    <CardHeader>
                        <CardTitle>Distribution des grades</CardTitle>
                        <p className="text-muted-foreground text-xs">A → E sur l’ensemble des passeports actifs</p>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={CHART_CONFIG} className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={distribution} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                    <XAxis dataKey="grade" tickLine={false} axisLine={false} />
                                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
                                    <Bar dataKey="count" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </section>

            <section>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Derniers passeports</CardTitle>
                            <p className="text-muted-foreground text-xs">5 plus récemment modifiés</p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/passports">
                                Tout voir <ArrowRight className="ml-1 h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="divide-border divide-y">
                        {recent.length === 0 && (
                            <p className="text-muted-foreground py-6 text-center text-sm">
                                <FileText className="mx-auto mb-2 h-6 w-6 opacity-40" />
                                Aucun passeport - démarrez par la création.
                            </p>
                        )}
                        {recent.map(({ passport, score }) => (
                            <Link
                                key={passport.id}
                                href={`/passports/${passport.id}`}
                                className="hover:bg-muted/50 -mx-3 flex items-center gap-4 rounded-md px-3 py-3 transition-colors"
                            >
                                <IrisGrade grade={score.grade} size="sm" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-foreground truncate text-sm font-medium">
                                        {passport.garment.reference || 'Brouillon sans référence'}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                        {passport.garment.kind} · modifié le{' '}
                                        {new Date(passport.updatedAt).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                                <AtelierStatusBadge status={passport.status} />
                                <MissingFieldsBadge passport={passport} className="hidden lg:inline-flex" />
                                <span className="text-muted-foreground hidden font-mono text-xs sm:inline">
                                    {score.total.toFixed(1)}/100
                                </span>
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}

interface KpiCardProps {
    label: string;
    value: number;
    hint: string;
    suffix?: string;
}

function EsprWindowCard() {
    return (
        <Card className="border-lumiris-emerald/20 bg-lumiris-emerald/5 mx-auto max-w-2xl">
            <CardContent className="space-y-4 p-6">
                <div className="flex items-start gap-3">
                    <div className="bg-lumiris-emerald/15 text-lumiris-emerald flex h-9 w-9 shrink-0 items-center justify-center rounded-md">
                        <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-foreground text-sm font-semibold">Pourquoi LUMIRIS, pourquoi maintenant</h3>
                        <p className="text-muted-foreground mt-1 text-xs">
                            Anticipez la conformité ESPR — chaque passeport créé maintenant sera prêt pour
                            l&apos;obligation 2028.
                        </p>
                    </div>
                </div>
                <ol className="border-border divide-border divide-y border-y">
                    {ESPR_TEXTILE_TIMELINE.map((milestone) => (
                        <li key={milestone.date} className="flex items-center gap-4 py-2.5">
                            <span className="text-lumiris-emerald w-20 shrink-0 font-mono text-xs font-semibold">
                                {milestone.date}
                            </span>
                            <span className="text-foreground flex-1 text-xs leading-relaxed">{milestone.label}</span>
                            <span className="text-muted-foreground shrink-0 font-mono text-[10px] uppercase tracking-wider">
                                {milestone.scope}
                            </span>
                        </li>
                    ))}
                </ol>
            </CardContent>
        </Card>
    );
}

function KpiCard({ label, value, hint, suffix = '' }: KpiCardProps) {
    return (
        <Card>
            <CardContent className="p-5">
                <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">{label}</p>
                <p className="text-foreground mt-2 font-mono text-3xl font-semibold tabular-nums">
                    {value}
                    {suffix && <span className="text-muted-foreground/70 ml-1 text-sm font-normal">{suffix}</span>}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">{hint}</p>
            </CardContent>
        </Card>
    );
}
