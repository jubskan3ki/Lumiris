import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { mockArtisans, mockBlogArticles } from '@lumiris/mock-data';
import type { BlogArticle } from '@lumiris/types';
import { BLOG_CATEGORY_LABEL } from '@lumiris/types';
import { Avatar, AvatarFallback, AvatarImage } from '@lumiris/ui/components/avatar';
import { Badge } from '@lumiris/ui/components/badge';
import { Button } from '@lumiris/ui/components/button';

export const dynamic = 'force-dynamic';

interface PreviewBlogPageProps {
    searchParams: Promise<{ id?: string }>;
}

/**
 * Aperçu mock du rendu apps/web pour un article blog. Pas une vraie iframe vers le site —
 * juste une approximation visuelle pour valider le contenu avant publication.
 */
export default async function PreviewBlogPage({ searchParams }: PreviewBlogPageProps) {
    const params = await searchParams;
    const article = params.id ? mockBlogArticles.find((a) => a.id === params.id) : mockBlogArticles[0];

    if (!article) {
        return (
            <main className="bg-background min-h-screen p-8">
                <p className="text-muted-foreground text-sm">Article introuvable.</p>
            </main>
        );
    }

    return <PreviewLayout article={article} />;
}

function PreviewLayout({ article }: { article: BlogArticle }) {
    const linkedArtisan = article.artisanId ? mockArtisans.find((a) => a.id === article.artisanId) : undefined;

    return (
        <main className="bg-background min-h-screen">
            <div className="border-border bg-card border-b px-6 py-3">
                <div className="mx-auto flex max-w-3xl items-center gap-3">
                    <Button asChild size="sm" variant="ghost" className="gap-1.5">
                        <Link href="/">
                            <ArrowLeft className="h-3.5 w-3.5" /> Retour admin
                        </Link>
                    </Button>
                    <Badge variant="outline" className="font-mono text-[10px]">
                        Aperçu site WEB
                    </Badge>
                    <span className="text-muted-foreground/70 ml-auto font-mono text-[10px]">
                        rendu approximatif — pas l&apos;app web réelle
                    </span>
                </div>
            </div>

            <article className="mx-auto max-w-3xl px-6 py-10">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-[11px]">
                        {BLOG_CATEGORY_LABEL[article.category]}
                    </Badge>
                    <span className="text-muted-foreground text-xs">{article.author}</span>
                    {article.publishedAt ? (
                        <>
                            <span className="text-muted-foreground/60">·</span>
                            <span className="text-muted-foreground text-xs">
                                {new Date(article.publishedAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </span>
                        </>
                    ) : null}
                    <span className="text-muted-foreground/60">·</span>
                    <span className="text-muted-foreground text-xs">{article.readTime}</span>
                </div>

                <h1 className="text-foreground text-balance text-3xl font-semibold leading-tight md:text-4xl">
                    {article.title || '(Titre vide)'}
                </h1>
                <p className="text-muted-foreground mt-3 text-lg leading-relaxed">{article.excerpt}</p>

                {article.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={article.coverImage}
                        alt=""
                        className="mt-6 aspect-[16/9] w-full rounded-2xl object-cover"
                    />
                ) : null}

                {linkedArtisan ? (
                    <aside className="border-lumiris-emerald/20 bg-lumiris-emerald/5 mt-6 flex items-center gap-3 rounded-2xl border p-4">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={linkedArtisan.photoUrl} alt="" />
                            <AvatarFallback>{linkedArtisan.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-foreground text-sm font-medium">
                                Article lié à {linkedArtisan.atelierName}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                {linkedArtisan.city} · {linkedArtisan.tier}
                                {linkedArtisan.epvLabeled ? ' · EPV' : ''}
                                {linkedArtisan.ofgLabeled ? ' · OFG' : ''}
                            </p>
                        </div>
                    </aside>
                ) : null}

                <div className="text-foreground prose prose-sm mt-8 max-w-none whitespace-pre-wrap text-base leading-relaxed">
                    {article.body}
                </div>

                <footer className="border-border text-muted-foreground mt-12 border-t pt-6 text-xs">
                    <p>
                        <strong>SEO meta title :</strong> {article.metaTitle || '—'}
                    </p>
                    <p className="mt-1">
                        <strong>SEO meta description :</strong> {article.metaDescription || '—'}
                    </p>
                    <p className="mt-1">
                        <strong>Slug :</strong>{' '}
                        <code className="bg-muted rounded px-1 font-mono">{article.slug || '—'}</code>
                    </p>
                </footer>
            </article>
        </main>
    );
}
