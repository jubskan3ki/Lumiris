'use client';

import Link from 'next/link';
import { AlertCircle, BarChart3, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@lumiris/ui/components/card';
import { Progress } from '@lumiris/ui/components/progress';
import { incompleteReason, resumeHref, type ExpiringCertificate, type QuotaUsage, type ScoredPassport } from './derive';

interface AttentionBlockProps {
    expiring: readonly ExpiringCertificate[];
    incomplete: readonly ScoredPassport[];
    quota: QuotaUsage;
}

const MAX_ROWS = 3;

export function AttentionBlock({ expiring, incomplete, quota }: AttentionBlockProps) {
    return (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ExpiringCard items={expiring} />
            <IncompleteCard items={incomplete} />
            <QuotaCard quota={quota} />
        </section>
    );
}

function ExpiringCard({ items }: { items: readonly ExpiringCertificate[] }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Clock className="h-4 w-4 text-amber-500" />
                    Certifs qui expirent
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {items.length === 0 ? (
                    <p className="text-muted-foreground text-xs">Aucune certification proche de l&apos;expiration.</p>
                ) : (
                    items.slice(0, MAX_ROWS).map(({ certificate, daysRemaining }) => (
                        <Link
                            key={certificate.id}
                            href="/certifications"
                            className="hover:bg-muted/50 -mx-2 flex items-center justify-between rounded-md px-2 py-1.5 transition-colors"
                        >
                            <span className="text-foreground truncate text-xs font-medium">
                                {certificate.kind}
                                {certificate.scope ? ` · ${certificate.scope}` : ''}
                            </span>
                            <span className="text-muted-foreground ml-2 shrink-0 text-xs">{daysRemaining}j</span>
                        </Link>
                    ))
                )}
            </CardContent>
        </Card>
    );
}

function IncompleteCard({ items }: { items: readonly ScoredPassport[] }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    Passeports incomplets
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {items.length === 0 ? (
                    <p className="text-muted-foreground text-xs">Tous vos passeports sont complets.</p>
                ) : (
                    items.slice(0, MAX_ROWS).map((s) => (
                        <Link
                            key={s.passport.id}
                            href={resumeHref(s.passport)}
                            className="hover:bg-muted/50 -mx-2 block rounded-md px-2 py-1.5 transition-colors"
                        >
                            <p className="text-foreground truncate text-xs font-medium">
                                {s.passport.garment.reference || 'Brouillon sans référence'}
                            </p>
                            <p className="text-muted-foreground truncate text-[11px]">{incompleteReason(s)}</p>
                        </Link>
                    ))
                )}
            </CardContent>
        </Card>
    );
}

function QuotaCard({ quota }: { quota: QuotaUsage }) {
    const unlimited = !Number.isFinite(quota.total);
    const totalLabel = unlimited ? '∞' : quota.total.toString();
    const overThreshold = quota.percent > 80;
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <BarChart3 className="h-4 w-4 text-cyan-500" />
                    Quota du plan
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex items-baseline justify-between">
                    <span className="font-mono text-sm tabular-nums">
                        {quota.used} / {totalLabel}
                    </span>
                    {!unlimited && <span className="text-muted-foreground text-xs">atteint à {quota.percent}%</span>}
                </div>
                {!unlimited && <Progress value={Math.min(100, quota.percent)} className="h-1.5" />}
                {overThreshold && (
                    <Link href="/subscription" className="text-lumiris-emerald text-xs hover:underline">
                        Mettre à niveau →
                    </Link>
                )}
            </CardContent>
        </Card>
    );
}
