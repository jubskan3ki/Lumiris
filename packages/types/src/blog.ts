// blog v2 (CMS admin) - succède à JournalArticle, 5 catégories + workflow Draft/Review/Scheduled/Published/Archived

export type BlogCategory = 'regulation' | 'portrait_artisan' | 'savoir_faire' | 'mode_responsable' | 'guide_retouche';

export type BlogStatus = 'Draft' | 'Review' | 'Scheduled' | 'Published' | 'Archived';

export interface BlogArticle {
    id: string;
    title: string;
    slug: string;
    category: BlogCategory;
    status: BlogStatus;
    author: string;
    /** Lien fort vers un Artisan - lui dédie une page auto-générée côté apps/site. */
    artisanId?: string;
    excerpt: string;
    /** Texte long (markdown light). */
    body: string;
    coverImage?: string;
    readTime: string;

    metaTitle: string;
    metaDescription: string;
    ogImage?: string;

    createdAt: string;
    updatedAt: string;
    /** ISO - date de publication effective. */
    publishedAt?: string;
    /** ISO - date programmée. Si > now → status='Scheduled'. */
    scheduledAt?: string;
}

/** Libellés FR pour l'UI admin et site public. */
export const BLOG_CATEGORY_LABEL: Record<BlogCategory, string> = {
    regulation: 'Réglementation',
    portrait_artisan: 'Portrait artisan',
    savoir_faire: 'Savoir-faire & matières',
    mode_responsable: 'Mode responsable',
    guide_retouche: 'Guide retouche',
};
