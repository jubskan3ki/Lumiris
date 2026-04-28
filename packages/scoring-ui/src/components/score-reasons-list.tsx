'use client';

import type { HTMLAttributes } from 'react';
import { cn } from '@lumiris/ui/lib/cn';

export interface ScoreReasonsListProps extends HTMLAttributes<HTMLUListElement> {
    reasons: readonly string[];
    /** Optional cap on rendered items; remainder collapsed into a counter. */
    limit?: number;
    emptyLabel?: string;
}

// No I18n here — callers translate `reasons` before passing in.
export function ScoreReasonsList({
    reasons,
    limit,
    emptyLabel = 'No issues detected.',
    className,
    ...rest
}: ScoreReasonsListProps) {
    if (reasons.length === 0) {
        return <p className={cn('text-muted-foreground text-sm', className as string)}>{emptyLabel}</p>;
    }

    const visible = limit ? reasons.slice(0, limit) : reasons;
    const overflow = limit ? Math.max(0, reasons.length - limit) : 0;

    return (
        <ul className={cn('text-muted-foreground space-y-1 text-sm', className)} {...rest}>
            {visible.map((reason, i) => (
                <li key={`${i}-${reason}`} className="flex gap-2">
                    <span aria-hidden className="bg-lumiris-amber mt-1 h-1 w-1 shrink-0 rounded-full" />
                    <span>{reason}</span>
                </li>
            ))}
            {overflow > 0 ? <li className="pl-3 text-xs italic">+ {overflow} more</li> : null}
        </ul>
    );
}
