'use client';

import type { HTMLAttributes } from 'react';
import type { Material } from '@lumiris/types';
import { CompositionList, type CompositionListProps } from './composition-list';

export interface MaterialBreakdownProps extends Omit<CompositionListProps, 'composition'> {
    /** Spec textile artisanal v1 - alias canonique du paramètre `composition`. */
    materials: readonly Material[];
}

// alias sémantique sur CompositionList - vocabulaire `materials`, rendu partagé
export function MaterialBreakdown({ materials, ...rest }: MaterialBreakdownProps & HTMLAttributes<HTMLDivElement>) {
    return <CompositionList composition={materials} {...rest} />;
}
