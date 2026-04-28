// Long-form content shared between admin (CMS) and web (public).

export type JournalStatus = 'Draft' | 'Published' | 'Scheduled';
export type JournalCategory = 'Regulation' | 'Lifestyle' | 'Audit' | 'Sustainability';

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
    body?: string;
    coverImage?: string;
}
