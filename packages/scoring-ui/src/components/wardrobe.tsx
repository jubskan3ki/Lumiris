'use client';

import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { Shirt } from 'lucide-react';
import type { IrisGrade as IrisGradeLetter } from '@lumiris/types';
import { cn } from '@lumiris/ui/lib/cn';
import { gradeBackground, gradeBorder, gradeColor } from '../theme/grade-color';

export interface WardrobeItem {
    id: string;
    name: string;
    brand: string;
    grade: IrisGradeLetter;
    /** 0–100. Drives the secondary copy and the bar fill. */
    score: number;
    /** Optional metadata rendered when present. */
    price?: number;
    currencySymbol?: string;
}

export interface WardrobeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
    items: readonly WardrobeItem[];
    /** Single-row marketing variant — mobile vault uses the default 2-col grid. */
    density?: 'compact' | 'cozy';
    /** When set, an item click reports back. */
    onSelect?: (item: WardrobeItem) => void;
    /** Compare-mode plumbing — selection is owned by the caller. */
    selectedIds?: readonly string[];
    selectionLabel?: ReactNode;
}

const DENSITY_GRID: Record<NonNullable<WardrobeProps['density']>, string> = {
    compact: 'flex gap-2 overflow-x-auto pb-1',
    cozy: 'grid grid-cols-2 gap-3',
};

/**
 * The unified Vault card grid. The mobile app uses it directly; the web
 * marketing Wardrobe wraps it inside a phone mockup. Per-grade colour comes
 * from the canonical Tailwind tokens in @lumiris/scoring-ui's grade-color
 * helper — there is no per-app GRADE_CONFIG.
 */
export function Wardrobe({
    items,
    density = 'cozy',
    onSelect,
    selectedIds,
    selectionLabel,
    className,
    ...rest
}: WardrobeProps) {
    return (
        <div className={cn('flex flex-col gap-3', className)} {...rest}>
            {selectionLabel ? (
                <div className="border-lumiris-cyan/25 bg-lumiris-cyan/5 text-lumiris-cyan rounded-xl border px-3 py-2 text-center text-xs font-medium">
                    {selectionLabel}
                </div>
            ) : null}

            <div className={DENSITY_GRID[density]}>
                {items.map((item) => {
                    const isSelected = selectedIds?.includes(item.id) ?? false;
                    return <WardrobeCard key={item.id} item={item} isSelected={isSelected} onSelect={onSelect} />;
                })}
            </div>
        </div>
    );
}

interface WardrobeCardProps {
    item: WardrobeItem;
    isSelected: boolean;
    onSelect?: (item: WardrobeItem) => void;
}

function WardrobeCard({ item, isSelected, onSelect }: WardrobeCardProps) {
    const selectable = typeof onSelect === 'function';
    const Tag = selectable ? 'button' : 'div';

    const animation: CSSProperties =
        item.grade === 'A' || item.grade === 'A+'
            ? { animation: 'grade-a-glow 3s ease-in-out infinite' }
            : item.grade === 'E'
              ? { filter: 'saturate(0.4) brightness(0.95)' }
              : {};

    return (
        <Tag
            type={selectable ? 'button' : undefined}
            onClick={selectable ? () => onSelect?.(item) : undefined}
            className={cn(
                'bg-card group relative flex min-w-[150px] flex-col overflow-hidden rounded-2xl border text-left transition-all',
                isSelected ? 'border-lumiris-cyan ring-lumiris-cyan/20 ring-2' : 'border-border/60 hover:border-border',
            )}
            style={animation}
        >
            <div className="bg-secondary/50 relative flex h-24 items-center justify-center">
                <Shirt className="text-muted-foreground/25 h-7 w-7" aria-hidden />
                <div
                    className={cn(
                        'absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full border font-mono text-[11px] font-bold',
                        gradeBackground(item.grade),
                        gradeBorder(item.grade),
                        gradeColor(item.grade),
                    )}
                    aria-label={`Iris grade ${item.grade}`}
                >
                    {item.grade}
                </div>
            </div>

            <div className="p-3">
                <p className="text-foreground truncate text-xs font-semibold leading-tight">{item.name}</p>
                <p className="text-muted-foreground mt-0.5 truncate text-[11px]">{item.brand}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="bg-secondary h-1 flex-1 overflow-hidden rounded-full">
                        <div
                            className={cn('h-full rounded-full', gradeColor(item.grade).replace('text-', 'bg-'))}
                            style={{ width: `${Math.max(0, Math.min(100, item.score))}%` }}
                        />
                    </div>
                    <span className="text-muted-foreground font-mono text-[10px]">{Math.round(item.score)}</span>
                </div>
                {typeof item.price === 'number' ? (
                    <p className="text-foreground mt-1.5 text-xs font-bold">
                        {item.currencySymbol ?? '€'}
                        {item.price}
                    </p>
                ) : null}
            </div>
        </Tag>
    );
}
