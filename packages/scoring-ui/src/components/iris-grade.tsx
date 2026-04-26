'use client';

import type { HTMLAttributes } from 'react';
import type { IrisGrade as IrisGradeLetter } from '@lumiris/types';
import { cn } from '@lumiris/ui/lib/cn';
import { gradeBackground, gradeBorder, gradeColor } from '../theme/grade-color';

export type IrisGradeSize = 'sm' | 'md' | 'lg';

export interface IrisGradeProps extends HTMLAttributes<HTMLDivElement> {
    grade: IrisGradeLetter;
    size?: IrisGradeSize;
}

const SIZE: Record<IrisGradeSize, string> = {
    sm: 'h-6 w-6 text-[11px]',
    md: 'h-9 w-9 text-sm',
    lg: 'h-14 w-14 text-xl',
};

/**
 * Pastille A+/A/.../E rendered with the canonical grade palette. Pure visual
 * — never derives the grade itself; pass it in (computed by `@lumiris/core`).
 */
export function IrisGrade({ grade, size = 'md', className, ...rest }: IrisGradeProps) {
    return (
        <div
            role="img"
            aria-label={`Iris grade ${grade}`}
            className={cn(
                'inline-flex items-center justify-center rounded-full border font-mono font-semibold tracking-tight',
                SIZE[size],
                gradeColor(grade),
                gradeBackground(grade),
                gradeBorder(grade),
                className,
            )}
            {...rest}
        >
            {grade}
        </div>
    );
}
