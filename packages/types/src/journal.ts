// contenu éditorial public partagé admin (CMS) ↔ web (vitrine) - 4 catégories + body MDX

export type JournalStatus = 'Draft' | 'Published' | 'Scheduled';

export type JournalCategory = 'reglementation' | 'portrait-artisan' | 'savoir-faire' | 'entretien';

/** Libellés FR canoniques - utilisés par les UIs admin et public. */
export const JOURNAL_CATEGORY_LABEL: Record<JournalCategory, string> = {
    reglementation: 'Réglementation',
    'portrait-artisan': "Portrait d'artisan",
    'savoir-faire': 'Savoir-faire',
    entretien: 'Entretien',
};

export interface JournalArticle {
    id: string;
    title: string;
    category: JournalCategory;
    status: JournalStatus;
    author: string;
    createdAt: string;
    updatedAt: string;
    excerpt: string;
    readTime: string;
    /** Corps MDX - requis dès qu'un article est `Published`. Toléré vide en `Draft`. */
    body: string;
    coverImage?: string;
    /** URL-safe slug humain. Optionnel : dérivable du titre côté consumer s'il est absent. */
    slug?: string;
}
