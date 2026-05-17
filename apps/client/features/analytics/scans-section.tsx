'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@lumiris/ui/components/card';
import { ChartContainer, type ChartConfig } from '@lumiris/ui/components/chart';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getScansSeries } from '@/lib/analytics-mock';

const CHART_CONFIG: ChartConfig = {
    total: { label: 'Scans totaux', color: 'var(--lumiris-emerald)' },
    unique: { label: 'Scans uniques', color: 'var(--lumiris-amber)' },
};

export function ScansSection({ artisanId }: { artisanId: string }) {
    const series = useMemo(() => getScansSeries(artisanId, 30), [artisanId]);

    return (
        <section className="space-y-4">
            <header>
                <h2 className="text-foreground text-lg font-semibold tracking-tight">Scans QR</h2>
                <p className="text-muted-foreground text-xs">30 derniers jours — données déterministes (mock).</p>
            </header>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <KpiCard label="Total scans" value={series.totalScans.toLocaleString('fr-FR')} />
                <KpiCard label="Scans uniques" value={series.uniqueScans.toLocaleString('fr-FR')} />
                <KpiCard label="Top pays" value={series.topCountry} />
                <KpiCard label="Top device" value={series.topDevice} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Évolution quotidienne</CardTitle>
                </CardHeader>
                <CardContent>
                    {series.totalScans === 0 ? (
                        <p className="text-muted-foreground py-12 text-center text-sm">
                            Aucun scan enregistré sur les 30 derniers jours.
                        </p>
                    ) : (
                        <ChartContainer config={CHART_CONFIG} className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={series.points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="label"
                                        tickLine={false}
                                        axisLine={false}
                                        minTickGap={20}
                                        fontSize={11}
                                    />
                                    <YAxis
                                        allowDecimals={false}
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
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                    <Line
                                        type="monotone"
                                        dataKey="total"
                                        stroke="var(--color-total)"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="unique"
                                        stroke="var(--color-unique)"
                                        strokeWidth={2}
                                        dot={false}
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

function KpiCard({ label, value }: { label: string; value: string }) {
    return (
        <Card>
            <CardContent className="space-y-1 p-4">
                <p className="text-muted-foreground text-[11px] uppercase tracking-wider">{label}</p>
                <p className="text-foreground text-xl font-semibold tracking-tight">{value}</p>
            </CardContent>
        </Card>
    );
}
