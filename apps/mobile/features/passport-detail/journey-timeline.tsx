'use client';

import { MapPin } from 'lucide-react';
import type { IrisGrade, ProductionStep } from '@lumiris/types';
import { cn } from '@lumiris/ui/lib/cn';
import { GRADE_LINE, GRADE_BORDER, GRADE_DOT_BG } from './grade-classes';

const COUNTRY_FLAG: Record<string, string> = {
    FR: '🇫🇷',
    IT: '🇮🇹',
    ES: '🇪🇸',
    BE: '🇧🇪',
    PT: '🇵🇹',
    DE: '🇩🇪',
    UK: '🇬🇧',
    GB: '🇬🇧',
    MA: '🇲🇦',
    TN: '🇹🇳',
};

interface JourneyTimelineProps {
    steps: readonly ProductionStep[];
    grade: IrisGrade;
}

export function JourneyTimeline({ steps, grade }: JourneyTimelineProps) {
    if (steps.length === 0) {
        return <p className="text-muted-foreground text-sm italic">Aucune étape renseignée pour cette pièce.</p>;
    }

    return (
        <ol className="relative">
            <span aria-hidden className={cn('absolute bottom-3 left-3 top-3 w-px', GRADE_LINE[grade])} />
            {steps.map((step, idx) => (
                <li key={step.id} className={cn('relative flex gap-4', idx === steps.length - 1 ? 'pb-0' : 'pb-4')}>
                    <span
                        aria-hidden
                        className={cn(
                            'absolute left-3 top-3 -translate-x-1/2 rounded-full border-2',
                            'h-3 w-3',
                            GRADE_BORDER[grade],
                            GRADE_DOT_BG[grade],
                        )}
                    />
                    <div className="border-border bg-card ml-8 flex-1 rounded-xl border p-3">
                        <div className="flex items-baseline justify-between gap-3">
                            <p className="text-foreground inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                                <MapPin className="h-3 w-3" aria-hidden />
                                {step.label}
                            </p>
                            {step.performedAt ? (
                                <span className="text-muted-foreground font-mono text-[10px]">
                                    {formatDate(step.performedAt)}
                                </span>
                            ) : null}
                        </div>
                        <p className="text-muted-foreground mt-1 text-xs">
                            <span className="mr-1">{COUNTRY_FLAG[step.locationCountry] ?? '🏳️'}</span>
                            {step.locationCity}, {step.locationCountry}
                        </p>
                        <p className="text-foreground/70 mt-0.5 text-[11px]">par {step.performedBy}</p>
                    </div>
                </li>
            ))}
        </ol>
    );
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    if (!Number.isFinite(d.getTime())) return iso;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' });
}
