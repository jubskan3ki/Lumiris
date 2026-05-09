import { mockJournalPublic, journalArticleBySlug } from '@lumiris/mock-data';
import { JournalArticle, JournalArticleNotFound } from '@/features/journal-article';

// `output: 'export'` (Tauri) exige que les paramètres dynamiques soient pré-générés.
export const dynamicParams = false;

export function generateStaticParams() {
    return mockJournalPublic.map((a) => ({ slug: a.slug }));
}

interface RouteProps {
    params: Promise<{ slug: string }>;
}

export default async function JournalArticleRoute({ params }: RouteProps) {
    const { slug } = await params;
    const article = journalArticleBySlug(slug);
    return article ? <JournalArticle article={article} /> : <JournalArticleNotFound />;
}
