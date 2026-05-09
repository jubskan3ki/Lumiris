import type { BlogArticle } from '@lumiris/types';

export function validateForPublish(article: BlogArticle, siblings: readonly BlogArticle[]): readonly string[] {
    const errors: string[] = [];
    if (article.title.length < 10) errors.push('Titre - minimum 10 caractères.');
    if (article.title.length > 80) errors.push('Titre - maximum 80 caractères.');
    if (article.metaTitle.length < 30 || article.metaTitle.length > 60)
        errors.push('Meta title - entre 30 et 60 caractères.');
    if (article.metaDescription.length < 80 || article.metaDescription.length > 160)
        errors.push('Meta description - entre 80 et 160 caractères.');
    if (!article.ogImage || article.ogImage.trim().length === 0)
        errors.push('OG image - URL obligatoire pour le partage social.');
    if (article.body.length < 500) errors.push('Corps - minimum 500 caractères.');
    if (!article.slug.match(/^[a-z0-9-]+$/)) errors.push('Slug - uniquement lettres minuscules, chiffres et tirets.');
    const slugClash = siblings.find((a) => a.id !== article.id && a.slug === article.slug && a.status === 'Published');
    if (slugClash) errors.push(`Slug - déjà utilisé par "${slugClash.title}".`);
    return errors;
}

export function isPublishable(article: BlogArticle, siblings: readonly BlogArticle[]): boolean {
    return validateForPublish(article, siblings).length === 0;
}
