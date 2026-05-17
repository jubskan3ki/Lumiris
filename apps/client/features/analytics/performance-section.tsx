'use client';

import { useMemo } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@lumiris/ui/components/card';
import { ChartContainer, type ChartConfig } from '@lumiris/ui/components/chart';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { cn } from '@lumiris/ui/lib/cn';
import { getMarketBenchmark, getPerformance } from '@/lib/analytics-mock';

const CHART_CONFIG: ChartConfig = {
    score: { label: 'Score Iris', color: 'var(--lumiris-emerald)' },
};

export function PerformanceSection({ artisanId }: { artisanId: string }) {
    const perf = useMemo(() => getPerformance(artisanId), [artisanId]);
    const benchmark = useMemo(() => getMarketBenchmark(), []);
    const delta = Math.round((perf.currentAvg - benchmark.avgScore) * 10) / 10;
    const deltaPositive = delta >= 0;

    return (
        <section className="space-y-4">
            <header>
                <h2 className="text-foreground text-lg font-semibold tracking-tight">Performance Iris</h2>
                <p className="text-muted-foreground text-xs">
                    Score moyen vs marché (moyenne marché : {benchmark.avgScore} / 100).
                </p>
            </header>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="space-y-1 p-4">
                        <p className="text-muted-foreground text-[11px] uppercase tracking-wider">Score moyen</p>
                        <p className="text-foreground text-3xl font-semibold tracking-tight">
                            {perf.currentAvg || '—'}
                            <span className="text-muted-foreground ml-1 text-sm">/ 100</span>
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="space-y-1 p-4">
                        <p className="text-muted-foreground text-[11px] uppercase tracking-wider">vs marché</p>
                        <div
                            className={cn(
                                'flex items-center gap-1.5 text-3xl font-semibold tracking-tight',
                                deltaPositive ? 'text-lumiris-emerald' : 'text-lumiris-amber',
                            )}
                        >
                            {deltaPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                            {delta > 0 ? `+${delta}` : delta} pts
                        </div>
                        <p className="text-muted-foreground text-xs">
                            {deltaPositive
                                ? `Vous performez mieux que la moyenne marché.`
                                : `La moyenne marché vous dépasse — viser le top tier (${benchmark.topScore}).`}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="space-y-1 p-4">
                        <p className="text-muted-foreground text-[11px] uppercase tracking-wider">Top tier marché</p>
                        <p className="text-foreground text-3xl font-semibold tracking-tight">
                            {benchmark.topScore}
                            <span className="text-muted-foreground ml-1 text-sm">/ 100</span>
                        </p>
                        <p className="text-muted-foreground text-xs">90ᵉ percentile (figé).</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Évolution sur 6 mois</CardTitle>
                </CardHeader>
                <CardContent>
                    {perf.currentAvg === 0 ? (
                        <p className="text-muted-foreground py-12 text-center text-sm">
                            Aucune pièce publiée — la moyenne Iris s’affichera dès la première publication.
                        </p>
                    ) : (
                        <ChartContainer config={CHART_CONFIG} className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={perf.series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                    <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                                    <YAxis
                                        domain={[0, 100]}
                                        tickLine={false}
                                        axisLine={false}
                                        width={32}
                                        fontSize={11}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'var(--popover)',
                                            border: '1px solid var(--border)',
                                            borderRadius: 8,
                                            fontSize: 12,
                                        }}
                                    />
                                    <ReferenceLine
                                        y={benchmark.avgScore}
                                        stroke="var(--muted-foreground)"
                                        strokeDasharray="4 4"
                                        label={{
                                            value: `marché (${benchmark.avgScore})`,
                                            position: 'right',
                                            fontSize: 10,
                                            fill: 'var(--muted-foreground)',
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="var(--color-score)"
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>
        </section>
    );
}
