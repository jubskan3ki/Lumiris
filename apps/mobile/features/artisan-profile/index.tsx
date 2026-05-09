'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { ArtisanCard, IrisGrade } from '@lumiris/scoring-ui';
import { mockPassportsByArtisan } from '@lumiris/mock-data';
import type { Artisan } from '@lumiris/types';
import { scorePassport } from '@/lib/passport-score';
import { AtelierMap } from './atelier-map';

export function ArtisanProfile({ artisan }: { artisan: Artisan }) {
    const router = useRouter();
    const [now] = useState(() => new Date());
    const passports = useMemo(() => mockPassportsByArtisan(artisan.id), [artisan.id]);

    const scored = useMemo(
        () =>
            passports
                .filter((p) => p.status === 'Published')
                .map((passport) => ({ passport, score: scorePassport(passport, now) }))
                .sort((a, b) => a.score.grade.localeCompare(b.score.grade)),
        [passports, now],
    );

    return (
        <div className="bg-background flex h-full flex-col overflow-y-auto pb-24">
            <motion.header
                className="flex items-center gap-3 px-4 pb-3 pt-12"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <button
                    type="button"
                    onClick={() => router.back()}
                    aria-label="Retour"
                    className="border-border bg-card text-foreground inline-flex h-9 w-9 items-center justify-center rounded-full border"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="min-w-0 flex-1">
                    <h1 className="text-foreground truncate text-base font-bold">{artisan.atelierName}</h1>
                    <p className="text-muted-foreground truncate text-xs">
                        {artisan.city} · {artisan.region}
                    </p>
                </div>
            </motion.header>

            <div className="flex flex-col gap-5 px-4">
                <ArtisanCard artisan={artisan} />

                <AtelierMap city={artisan.city} atelierName={artisan.atelierName} />

                {artisan.websiteUrl ? (
                    <a
                        href={artisan.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border-border bg-card text-foreground inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-xs font-medium"
                    >
                        Site officiel
                        <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                ) : null}

                <section className="flex flex-col gap-3">
                    <h2 className="text-foreground text-sm font-semibold uppercase tracking-wider">
                        Pièces de l&apos;atelier ({scored.length})
                    </h2>
                    {scored.length === 0 ? (
                        <p className="text-muted-foreground text-sm italic">Aucune pièce publiée pour le moment.</p>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {scored.map(({ passport, score }) => (
                                <Link
                                    key={passport.id}
                                    href={`/passeport/${passport.id}`}
                                    className="border-border/60 bg-card flex flex-col overflow-hidden rounded-2xl border"
                                >
                                    <div className="bg-secondary/40 aspect-3/4 relative">
                                        {passport.garment.mainPhotoUrl ? (
                                            <Image
                                                src={passport.garment.mainPhotoUrl}
                                                alt={passport.garment.reference}
                                                fill
                                                unoptimized
                                                sizes="(max-width: 768px) 50vw, 200px"
                                                className="object-cover"
                                            />
                                        ) : null}
                                        <div className="absolute right-2 top-2">
                                            <IrisGrade grade={score.grade} size="sm" tone="solid" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-0.5 p-3">
                                        <p className="text-foreground truncate text-xs font-semibold">
                                            {passport.garment.reference}
                                        </p>
                                        <p className="text-muted-foreground/80 font-mono text-[10px]">
                                            {passport.garment.retailPrice} {passport.garment.currency}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
