'use client';

import type { HTMLAttributes } from 'react';
import { LUMIRIS_WEIGHTS } from '@lumiris/core/constants';
import type { ScoreBreakdown as ScoreBreakdownData, ScoreWeights } from '@lumiris/types';
import { cn } from '@lumiris/ui/lib/cn';
import { formatPercent } from '@lumiris/utils/format';

export interface ScoreBreakdownProps extends HTMLAttributes<HTMLDivElement> {
    breakdown: ScoreBreakdownData;
    weights?: ScoreWeights;
}

const AXES: Array<{ key: keyof ScoreBreakdownData; label: string; tone: string }> = [
    { key: 'integrity', label: 'Integrity', tone: 'bg-lumiris-emerald' },
    { key: 'trust', label: 'Trust', tone: 'bg-lumiris-cyan' },
    { key: 'impact', label: 'Impact', tone: 'bg-lumiris-amber' },
];

// Bar widths are score × weight, so the three axes compose visually into the total.
export function ScoreBreakdown({ breakdown, weights = LUMIRIS_WEIGHTS, className, ...rest }: ScoreBreakdownProps) {
    return (
        <div className={cn('space-y-2', className)} {...rest}>
            {AXES.map(({ key, label, tone }) => {
                const score = breakdown[key];
                const cap = weights[key] * 100;
                const weighted = (score * weights[key]).toFixed(1);
                return (
                    <div key={key} className="space-y-1">
                        <div className="flex items-baseline justify-between text-xs">
                            <span className="text-foreground font-medium">{label}</span>
                            <span className="text-muted-foreground font-mono">
                                {weighted} / {cap.toFixed(0)} · {formatPercent(score)}
                            </span>
                        </div>
                        <div
                            className="bg-muted h-2 overflow-hidden rounded-full"
                            role="progressbar"
                            aria-valuenow={score}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${label} sub-score`}
                        >
                            <div
                                className={cn('h-full rounded-full transition-[width]', tone)}
                                style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
