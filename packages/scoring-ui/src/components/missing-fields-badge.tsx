'use client';

import { useMemo, type HTMLAttributes } from 'react';
import { MANDATORY_DPP_FIELDS } from '@lumiris/core/constants';
import type { DPPRecord } from '@lumiris/types';
import { cn } from '@lumiris/ui/lib/cn';

export interface MissingFieldsBadgeProps extends HTMLAttributes<HTMLSpanElement> {
    dpp: DPPRecord;
    /** When true, renders the 0/N counter even at zero missing — useful in tables. */
    showWhenComplete?: boolean;
}

/**
 * Counts EU ESPR mandatory fields missing from the DPP raw payload — derived
 * from the canonical `MANDATORY_DPP_FIELDS` list, never from the DPP's own
 * `missingFields` array (which can drift).
 */
export function MissingFieldsBadge({ dpp, showWhenComplete = false, className, ...rest }: MissingFieldsBadgeProps) {
    const { missing, total } = useMemo(() => computeMissing(dpp), [dpp]);

    if (missing === 0 && !showWhenComplete) return null;

    const tone =
        missing === 0
            ? 'border-lumiris-emerald/30 bg-lumiris-emerald/10 text-lumiris-emerald'
            : missing <= 2
              ? 'border-lumiris-amber/30 bg-lumiris-amber/10 text-lumiris-amber'
              : 'border-lumiris-rose/30 bg-lumiris-rose/10 text-lumiris-rose';

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[11px] font-medium',
                tone,
                className,
            )}
            title={
                missing === 0
                    ? 'All EU ESPR mandatory fields present'
                    : `${missing} mandatory field${missing > 1 ? 's' : ''} missing`
            }
            {...rest}
        >
            {missing}/{total}
        </span>
    );
}

function computeMissing(dpp: DPPRecord): { missing: number; total: number } {
    const raw = (dpp.rawData ?? {}) as Record<string, unknown>;
    let missing = 0;
    for (const field of MANDATORY_DPP_FIELDS) {
        const value = raw[field];
        if (value === null || value === undefined || value === '') missing += 1;
    }
    return { missing, total: MANDATORY_DPP_FIELDS.length };
}
