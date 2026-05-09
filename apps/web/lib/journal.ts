// Index statique des articles du journal — tous les articles sont des fichiers .mdx dans
// content/journal/{slug}.mdx. Chaque fichier expose `meta` (frontmatter typé) et `default`
// (composant MDX). On les importe en dur pour que Next.js puisse SSG la liste à la
// génération sans accès filesystem au runtime.

import type { ComponentType } from 'react';
import * as A1 from '@/content/journal/comprendre-le-dpp-textile.mdx';
import * as A2 from '@/content/journal/agec-pour-les-artisans.mdx';
import * as A3 from '@/content/journal/registre-central-dpp-juillet-2026.mdx';
import * as A4 from '@/content/journal/portrait-marie-dubois-couturiere-bretagne.mdx';
import * as A5 from '@/content/journal/savoir-faire-tissage-lozere.mdx';
import * as A6 from '@/content/journal/entretien-laine-naturelle.mdx';
import type { JournalCategory } from '@lumiris/types';

export interface ArticleMeta {
    slug: string;
    title: string;
    category: JournalCategory;
    author: string;
    /** ISO date `YYYY-MM-DD`. */
    publishedAt: string;
    /** Minutes de lecture, arrondi entier. */
    readingTime: number;
    excerpt: string;
    /** URL absolue (placehold.co ou CDN externe). */
    coverImage: string;
}

export interface Article extends ArticleMeta {
    Component: ComponentType;
}

interface MdxModule {
    meta: ArticleMeta;
    default: ComponentType;
}

const MODULES: readonly MdxModule[] = [A1, A2, A3, A4, A5, A6] as unknown as readonly MdxModule[];

const ARTICLES: readonly Article[] = MODULES.map((m) => ({ ...m.meta, Component: m.default })).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
);

const BY_SLUG = new Map<string, Article>(ARTICLES.map((a) => [a.slug, a]));

export function getAllArticles(): readonly Article[] {
    return ARTICLES;
}

export function getArticleBySlug(slug: string): Article | undefined {
    return BY_SLUG.get(slug);
}

export function getRelatedArticles(article: Article, limit = 3): readonly Article[] {
    return ARTICLES.filter((a) => a.slug !== article.slug && a.category === article.category).slice(0, limit);
}
