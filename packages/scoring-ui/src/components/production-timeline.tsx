'use client';

import type { HTMLAttributes } from 'react';
import type { ProductionStep } from '@lumiris/types';
import { ManufacturingTimeline, type ManufacturingTimelineProps } from './manufacturing-timeline';

export interface ProductionTimelineProps extends Omit<ManufacturingTimelineProps, 'steps'> {
    /** Spec textile artisanal v1 — alias canonique du paramètre `steps`. */
    steps: readonly ProductionStep[];
}

// alias sémantique sur ManufacturingTimeline — rendu partagé
export function ProductionTimeline({ steps, ...rest }: ProductionTimelineProps & HTMLAttributes<HTMLDivElement>) {
    return <ManufacturingTimeline steps={steps} {...rest} />;
}
