import type { ComponentType } from 'react';

export interface MdxArticleModule<TMeta> {
    readonly meta: TMeta;
    readonly default: ComponentType;
}

export function asMdxArticleModule<TMeta>(
    value: unknown,
    isMeta: (meta: unknown) => meta is TMeta,
): MdxArticleModule<TMeta> | null {
    if (!value || typeof value !== 'object') return null;
    const v = value as Record<string, unknown>;
    if (typeof v.default !== 'function' || !isMeta(v.meta)) return null;
    return { meta: v.meta, default: v.default as ComponentType };
}
