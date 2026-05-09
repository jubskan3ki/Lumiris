'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowUpRight, ExternalLink } from 'lucide-react';
import { ArtisanCard, IrisGrade } from '@lumiris/scoring-ui';
import { mockArtisans, mockPassports, mockJournalPublic, mockArtisanById } from '@lumiris/mock-data';
import type { Passport } from '@lumiris/types';
import { scorePassport } from '@/lib/passport-score';

const WEB_BASE_URL = 'https://lumiris.fr';

export function Discover() {
    const [now] = useState(() => new Date());

    const featuredPieces = useMemo(() => {
        return mockPassports
            .filter((p) => p.status === 'Published')
            .map((p) => ({ passport: p, score: scorePassport(p, now) }))
            .filter((row) => row.score.grade === 'A' || row.score.grade === 'B')
            .sort((a, b) => new Date(b.passport.updatedAt).getTime() - new Date(a.passport.updatedAt).getTime())
            .slice(0, 8);
    }, [now]);

    const featuredArtisans = useMemo(() => mockArtisans.slice(0, 6), []);
    const articles = mockJournalPublic.slice(0, 3);

    return (
        <div className="bg-background flex h-full flex-col overflow-y-auto pb-24">
            <motion.header className="px-5 pb-4 pt-12" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-2">
                    <h1 className="text-foreground text-xl font-bold">Découvrir</h1>
                    <Sparkles className="text-lumiris-amber h-4 w-4" />
                </div>
                <p className="text-muted-foreground text-sm">Artisans, pièces du moment et journal LUMIRIS.</p>
            </motion.header>

            <Section title="Artisans à découvrir">
                <ul className="-mx-1 flex gap-3 overflow-x-auto px-5 pb-1">
                    {featuredArtisans.map((artisan) => (
                        <li key={artisan.id} className="shrink-0">
                            <Link href={`/artisans/${artisan.id}`} className="block w-72">
                                <ArtisanCard artisan={artisan} truncateStory />
                            </Link>
                        </li>
                    ))}
                </ul>
            </Section>

            <Section title="Pièces du moment" actionLabel="Voir tout" actionHref="#">
                <div className="grid grid-cols-2 gap-3 px-4">
                    {featuredPieces.map(({ passport, score }) => (
                        <FeaturedPiece key={passport.id} passport={passport} grade={score.grade} />
                    ))}
                </div>
            </Section>

            <Section title="Articles">
                <div className="flex flex-col gap-3 px-4">
                    {articles.map((article) => (
                        <button
                            key={article.id}
                            type="button"
                            onClick={() =>
                                typeof window !== 'undefined' &&
                                window.open(`${WEB_BASE_URL}/journal/${article.slug}`, '_blank', 'noopener,noreferrer')
                            }
                            className="border-border/60 bg-card hover:border-border group flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition"
                        >
                            <span className="text-muted-foreground inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider">
                                {article.category}
                                <ExternalLink className="h-3 w-3" />
                            </span>
                            <h3 className="text-foreground text-sm font-semibold leading-snug">{article.title}</h3>
                            <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                                {article.excerpt}
                            </p>
                            <span className="text-muted-foreground group-hover:text-foreground inline-flex items-center gap-1 text-[11px] font-medium transition-colors">
                                Lire l&apos;article
                                <ArrowUpRight className="h-3 w-3" />
                            </span>
                        </button>
                    ))}
                </div>
            </Section>
        </div>
    );
}

function Section({
    title,
    actionLabel,
    actionHref,
    children,
}: {
    title: string;
    actionLabel?: string;
    actionHref?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="mt-2 flex flex-col gap-3 pb-2">
            <div className="flex items-baseline justify-between px-5">
                <h2 className="text-foreground text-sm font-semibold uppercase tracking-wider">{title}</h2>
                {actionLabel && actionHref ? (
                    <Link
                        href={actionHref}
                        className="text-muted-foreground hover:text-foreground text-[11px] font-medium"
                    >
                        {actionLabel}
                    </Link>
                ) : null}
            </div>
            {children}
        </section>
    );
}

function FeaturedPiece({ passport, grade }: { passport: Passport; grade: 'A' | 'B' | 'C' | 'D' | 'E' }) {
    const artisan = mockArtisanById(passport.artisanId);
    return (
        <Link
            href={`/passeport/${passport.id}`}
            className="border-border/60 bg-card flex flex-col overflow-hidden rounded-2xl border"
        >
            <div className="bg-secondary/40 aspect-3/4 relative">
                {passport.garment.mainPhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={passport.garment.mainPhotoUrl}
                        alt={passport.garment.reference}
                        className="h-full w-full object-cover"
                    />
                ) : null}
                <div className="absolute right-2 top-2">
                    <IrisGrade grade={grade} size="sm" tone="solid" />
                </div>
            </div>
            <div className="flex flex-col gap-0.5 p-3">
                <p className="text-foreground truncate text-xs font-semibold">{passport.garment.reference}</p>
                <p className="text-muted-foreground truncate text-[11px]">{artisan?.atelierName ?? '—'}</p>
                <p className="text-foreground/80 font-mono text-[10px]">
                    {passport.garment.retailPrice} {passport.garment.currency}
                </p>
            </div>
        </Link>
    );
}
