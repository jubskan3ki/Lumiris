// Adapter mock-data → format consommé par le feed Discover.
// Sert à la fois la route server-rendered (/discover) et le fallback client (AppShell tab).

import type { IrisGrade, JournalCategory } from '@lumiris/types';
import { mockJournalPublic, type JournalArticlePublic } from '@lumiris/mock-data';

export interface DiscoverFeedItem {
    slug: string;
    title: string;
    subtitle: string;
    category: JournalCategory;
    grade: IrisGrade;
    publishedAt: string;
    readTime: string;
    author: string;
    coverImage?: string;
}

// Mapping éditorial : portrait > savoir-faire > entretien > réglementation.
// Quatre catégories => quatre grades visibles (E reste pour les contenus dépréciés / archives futurs).
const CATEGORY_GRADE: Record<JournalCategory, IrisGrade> = {
    'portrait-artisan': 'A',
    'savoir-faire': 'B',
    entretien: 'C',
    reglementation: 'D',
};

const GRADE_RANK: Record<IrisGrade, number> = { A: 0, B: 1, C: 2, D: 3, E: 4 };

export function articleToFeedItem(article: JournalArticlePublic): DiscoverFeedItem {
    return {
        slug: article.slug,
        title: article.title,
        subtitle: article.excerpt,
        category: article.category,
        grade: CATEGORY_GRADE[article.category],
        publishedAt: article.updatedAt,
        readTime: article.readTime,
        author: article.author,
        coverImage: article.coverImage,
    };
}

export function getDiscoverFeed(): DiscoverFeedItem[] {
    return mockJournalPublic.map(articleToFeedItem).sort((a, b) => {
        const rankDiff = GRADE_RANK[a.grade] - GRADE_RANK[b.grade];
        if (rankDiff !== 0) return rankDiff;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
}

export function gradeForCategory(category: JournalCategory): IrisGrade {
    return CATEGORY_GRADE[category];
}

// Ordre canonique des catégories (A→D) pour grouper hero + sections sans dépendre
// de l'ordre d'apparition dans le feed.
export const JOURNAL_CATEGORIES_ORDERED: readonly JournalCategory[] = [
    'portrait-artisan',
    'savoir-faire',
    'entretien',
    'reglementation',
];
