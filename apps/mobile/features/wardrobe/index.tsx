'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shirt, Trash2, ScanQrCode } from 'lucide-react';
import { IrisGrade } from '@lumiris/scoring-ui';
import { mockArtisanById, mockPassportById, mockPassports } from '@lumiris/mock-data';
import type { Passport } from '@lumiris/types';
import { useWardrobe, removeFromWardrobe } from '@/lib/wardrobe-storage';
import { scorePassport } from '@/lib/passport-score';

interface WardrobeProps {
    onScanRequested: () => void;
}

export function Wardrobe({ onScanRequested }: WardrobeProps) {
    const entries = useWardrobe();
    const [now] = useState(() => new Date());

    const items = useMemo(
        () =>
            entries
                .map((entry) => {
                    const passport = mockPassportById(entry.passportId);
                    if (!passport) return null;
                    const score = scorePassport(passport, now);
                    const artisan = mockArtisanById(passport.artisanId);
                    return { entry, passport, score, artisan } as const;
                })
                .filter((it): it is NonNullable<typeof it> => it !== null),
        [entries, now],
    );

    const ePieces = items.filter((it) => it.score.grade === 'E');

    if (items.length === 0) {
        return <WardrobeEmpty onScanRequested={onScanRequested} />;
    }

    return (
        <div className="bg-background flex h-full flex-col overflow-y-auto pb-24">
            <motion.header className="px-5 pb-4 pt-12" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-foreground text-xl font-bold">Garde-Robe</h1>
                <p className="text-muted-foreground text-sm">
                    {items.length} pièce{items.length > 1 ? 's' : ''} suivie{items.length > 1 ? 's' : ''}.
                </p>
            </motion.header>

            <div className="grid grid-cols-2 gap-3 px-4">
                {items.map(({ passport, score, artisan }) => (
                    <WardrobeCard
                        key={passport.id}
                        passport={passport}
                        grade={score.grade}
                        score={score.total}
                        artisanName={artisan?.atelierName ?? '—'}
                    />
                ))}
            </div>

            {ePieces.length > 0 ? (
                <section className="mt-6 flex flex-col gap-3 px-4">
                    {ePieces.map(({ passport }) => (
                        <Alternatives key={passport.id} sourcePassport={passport} now={now} />
                    ))}
                </section>
            ) : null}
        </div>
    );
}

function WardrobeEmpty({ onScanRequested }: { onScanRequested: () => void }) {
    return (
        <motion.div
            className="bg-background flex h-full flex-col items-center justify-center gap-4 px-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="border-border/60 bg-card relative flex h-20 w-20 items-center justify-center rounded-3xl border">
                <Shirt className="text-muted-foreground h-8 w-8" />
                <span
                    className="bg-lumiris-cyan/15 absolute -inset-3 -z-10 rounded-3xl blur-xl motion-reduce:hidden"
                    aria-hidden
                />
            </div>
            <div>
                <h1 className="text-foreground text-lg font-semibold">Ta Garde-Robe est vide</h1>
                <p className="text-muted-foreground mt-1 max-w-xs text-sm">
                    Scanne le QR du passeport sur l&apos;étiquette d&apos;une de tes pièces pour la suivre dans LUMIRIS.
                </p>
            </div>
            <button
                type="button"
                onClick={onScanRequested}
                className="bg-foreground text-primary-foreground inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
            >
                <ScanQrCode className="h-4 w-4" />
                Scanner ma première pièce
            </button>
        </motion.div>
    );
}

interface WardrobeCardProps {
    passport: Passport;
    grade: 'A' | 'B' | 'C' | 'D' | 'E';
    score: number;
    artisanName: string;
}

function WardrobeCard({ passport, grade, score, artisanName }: WardrobeCardProps) {
    return (
        <Link
            href={`/passeport/${passport.id}`}
            className="border-border/60 bg-card group relative flex flex-col overflow-hidden rounded-2xl border transition-all"
            style={grade === 'E' ? { filter: 'saturate(0.4) brightness(0.95)' } : undefined}
        >
            <div className="bg-secondary/40 aspect-3/4 relative">
                {passport.garment.mainPhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={passport.garment.mainPhotoUrl}
                        alt={passport.garment.reference}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="text-muted-foreground/40 flex h-full w-full items-center justify-center">
                        <Shirt className="h-8 w-8" />
                    </div>
                )}
                <div className="absolute right-2 top-2">
                    <IrisGrade grade={grade} size="sm" tone="solid" />
                </div>
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFromWardrobe(passport.id);
                    }}
                    aria-label="Retirer de la Garde-Robe"
                    className="border-border bg-card/80 text-muted-foreground hover:text-foreground absolute left-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full border opacity-0 transition group-hover:opacity-100"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>
            <div className="flex flex-col gap-0.5 p-3">
                <p className="text-foreground truncate text-xs font-semibold">{passport.garment.reference}</p>
                <p className="text-muted-foreground truncate text-[11px]">{artisanName}</p>
                <div className="text-muted-foreground/80 mt-1 inline-flex items-center justify-between font-mono text-[10px]">
                    <span>Iris {score}</span>
                    <span>
                        {passport.garment.retailPrice} {passport.garment.currency}
                    </span>
                </div>
            </div>
        </Link>
    );
}

// Suggestions alternatives — pour chaque E, on cherche dans le catalogue mock les pièces
// du même `garment.kind` notées A ou B, triées grade puis prix croissant. Lien vers
// `/passeport/[id]` (en attendant un futur `/artisans/[slug]` côté web).
function Alternatives({ sourcePassport, now }: { sourcePassport: Passport; now: Date }) {
    const alternatives = useMemo(() => {
        return mockPassports
            .filter(
                (p) =>
                    p.id !== sourcePassport.id &&
                    p.garment.kind === sourcePassport.garment.kind &&
                    p.status === 'Published',
            )
            .map((p) => ({ passport: p, score: scorePassport(p, now) }))
            .filter((row) => row.score.grade === 'A' || row.score.grade === 'B')
            .sort((a, b) => {
                if (a.score.grade !== b.score.grade) return a.score.grade.localeCompare(b.score.grade);
                return a.passport.garment.retailPrice - b.passport.garment.retailPrice;
            })
            .slice(0, 6);
    }, [sourcePassport, now]);

    if (alternatives.length === 0) return null;

    return (
        <div className="border-lumiris-cyan/20 bg-lumiris-cyan/5 flex flex-col gap-2 rounded-2xl border p-3">
            <div className="flex items-baseline justify-between">
                <p className="text-foreground text-xs font-semibold uppercase tracking-wider">
                    Mieux que {sourcePassport.garment.reference}
                </p>
                <p className="text-muted-foreground text-[11px]">artisans français A/B</p>
            </div>
            <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {alternatives.map(({ passport, score }) => {
                    const artisan = mockArtisanById(passport.artisanId);
                    return (
                        <li key={passport.id} className="shrink-0">
                            <Link
                                href={`/passeport/${passport.id}`}
                                className="border-border/60 bg-card flex w-40 flex-col gap-1 rounded-xl border p-2"
                            >
                                <div className="bg-secondary/40 relative h-24 overflow-hidden rounded-lg">
                                    {passport.garment.mainPhotoUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={passport.garment.mainPhotoUrl}
                                            alt={passport.garment.reference}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : null}
                                    <div className="absolute right-1.5 top-1.5">
                                        <IrisGrade grade={score.grade} size="sm" tone="solid" />
                                    </div>
                                </div>
                                <p className="text-foreground truncate text-[11px] font-semibold">
                                    {passport.garment.reference}
                                </p>
                                <p className="text-muted-foreground truncate text-[10px]">
                                    {artisan?.atelierName ?? '—'}
                                </p>
                                <p className="text-foreground/80 font-mono text-[10px]">
                                    {passport.garment.retailPrice} €
                                </p>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
