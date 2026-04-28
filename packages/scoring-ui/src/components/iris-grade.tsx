'use client';

import type { HTMLAttributes } from 'react';
import type { IrisGrade as IrisGradeLetter } from '@lumiris/types';
import { cn } from '@lumiris/ui/lib/cn';
import { gradeBackground, gradeBackgroundSolid, gradeBorder, gradeColor } from '../theme/grade-color';

export type IrisGradeSize = 'sm' | 'md' | 'lg';
export type IrisGradeTone = 'soft' | 'solid';

export interface IrisGradeProps extends HTMLAttributes<HTMLDivElement> {
    grade: IrisGradeLetter;
    size?: IrisGradeSize;
    /** `soft` for dense surfaces, `solid` (full fill, white letter) for cards that need to pop. */
    tone?: IrisGradeTone;
}

const SIZE: Record<IrisGradeSize, string> = {
    sm: 'h-6 w-6 text-[11px]',
    md: 'h-9 w-9 text-sm',
    lg: 'h-14 w-14 text-xl',
};

// Never derives the grade — caller passes it in (computed by `@lumiris/core`).
export function IrisGrade({ grade, size = 'md', tone = 'soft', className, ...rest }: IrisGradeProps) {
    const toneClasses =
        tone === 'solid'
            ? cn(gradeBackgroundSolid(grade), 'text-primary-foreground border-transparent')
            : cn(gradeColor(grade), gradeBackground(grade), gradeBorder(grade));

    return (
        <div
            role="img"
            aria-label={`Iris grade ${grade}`}
            className={cn(
                'inline-flex items-center justify-center rounded-full border font-mono font-semibold tracking-tight',
                SIZE[size],
                toneClasses,
                className,
            )}
            {...rest}
        >
            {grade}
        </div>
    );
}
