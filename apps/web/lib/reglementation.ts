import type { ComponentType } from 'react';
import * as R1 from '@/content/reglementation/dpp-textile.mdx';
import * as R2 from '@/content/reglementation/agec.mdx';
import * as R3 from '@/content/reglementation/espr-calendrier.mdx';

interface RegulationMeta {
    slug: string;
    title: string;
    summary: string;
    /** ISO date `YYYY-MM-DD`. */
    updatedAt: string;
}

interface Regulation extends RegulationMeta {
    Component: ComponentType;
}

interface MdxModule {
    meta: RegulationMeta;
    default: ComponentType;
}

const MODULES: readonly MdxModule[] = [R1, R2, R3] as unknown as readonly MdxModule[];

const REGULATIONS: readonly Regulation[] = MODULES.map((m) => ({ ...m.meta, Component: m.default }));

const BY_SLUG = new Map<string, Regulation>(REGULATIONS.map((r) => [r.slug, r]));

export function getAllRegulations(): readonly Regulation[] {
    return REGULATIONS;
}

export function getRegulationBySlug(slug: string): Regulation | undefined {
    return BY_SLUG.get(slug);
}
