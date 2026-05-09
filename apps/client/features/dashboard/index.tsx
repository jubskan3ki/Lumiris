'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowRight, FileText, Sparkles } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { computeScore } from '@lumiris/core/scoring';
import { mockCertificates } from '@lumiris/mock-data';
import type { Passport, IrisGrade as IrisGradeLetter, ScoreResult } from '@lumiris/types';
import { Card, CardContent, CardHeader, CardTitle } from '@lumiris/ui/components/card';
import { ChartContainer, type ChartConfig } from '@lumiris/ui/components/chart';
import { Button } from '@lumiris/ui/components/button';
import { IrisGrade, AtelierStatusBadge, GRADE_COLOR } from '@lumiris/scoring-ui';
import { currentArtisan } from '@/lib/current-artisan';
import { usePassports } from '@/lib/passports-source';

interface ScoredPassport {
    passport: Passport;
    score: ScoreResult;
}

const GRADES: readonly IrisGradeLetter[] = ['A', 'B', 'C', 'D', 'E'];

const CHART_CONFIG: ChartConfig = {
    count: { label: 'Passeports' },
};

export function Dashboard() {
    const passports = usePassports(currentArtisan.id);

    const scored: readonly ScoredPassport[] = useMemo(() => {
        const now = new Date();
        return passports.map((passport) => ({
            passport,
            score: computeScore(passport, {
                artisan: currentArtisan,
                certificates: mockCertificates,
                now,
            }),
        }));
    }, [passports]);

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

    return (
        <div className="space-y-6 p-8">
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <KpiCard label="Publiés" value={stats.published} hint="Passeports vivants" />
                <KpiCard label="En complétion" value={stats.incompletion} hint="Plafonnés D - à compléter" />
                <KpiCard label="Brouillons" value={stats.drafts} hint="En cours de création" />
                <KpiCard
                    label="Score Iris moyen"
                    value={stats.avgScore}
                    hint="Sur les passeports publiés"
                    suffix={stats.published === 0 ? '' : ' / 100'}
                />
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Distribution des grades</CardTitle>
                            <p className="text-muted-foreground text-xs">A → E sur l’ensemble des passeports actifs</p>
                        </div>
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

                <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="text-lumiris-emerald h-4 w-4" />
                                Bienvenue {currentArtisan.displayName.split(' ')[0]}
                            </CardTitle>
                            <p className="text-muted-foreground mt-1 text-xs">
                                {currentArtisan.atelierName} - {currentArtisan.city}
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Continuez vos passeports en cours, ou créez-en un nouveau. Le score Iris se calcule en temps
                            réel à chaque étape.
                        </p>
                        <Button asChild className="bg-lumiris-emerald hover:bg-lumiris-emerald/90 w-full text-white">
                            <Link href="/create">Créer un passeport</Link>
                        </Button>
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
