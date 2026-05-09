'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { Award, ExternalLink, MapPin } from 'lucide-react';
import { Badge } from '@lumiris/ui/components/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@lumiris/ui/components/card';
import { IrisGrade } from '@lumiris/scoring-ui/components/iris-grade';
import { type PassportPublicView, CITY_COORDS } from '@lumiris/mock-data';
import type { ArtisanWithSlug } from '@/lib/artisans';

const AtelierMap = dynamic(() => import('./atelier-map').then((m) => m.AtelierMap), {
    ssr: false,
    loading: () => (
        <div className="border-border bg-card text-muted-foreground flex h-72 items-center justify-center rounded-2xl border text-xs italic">
            Chargement de la carte…
        </div>
    ),
});

const KIND_LABEL: Record<string, string> = {
    sweater: 'Pull',
    shirt: 'Chemise',
    shoe: 'Chaussures',
    jacket: 'Veste',
    trouser: 'Pantalon',
    accessory: 'Accessoire',
    other: 'Pièce textile',
};

interface Props {
    artisan: ArtisanWithSlug;
    passports: readonly PassportPublicView[];
}

function PieceCard({ view }: { view: PassportPublicView }) {
    const kind = KIND_LABEL[view.passport.garment.kind] ?? KIND_LABEL.other;
    const photo = view.passport.garment.mainPhotoUrl;
    return (
        <Link
            href={`/passeport/${view.passport.id}`}
            className="border-border bg-card hover:border-grade-a/40 group block overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md"
        >
            <div className="bg-muted relative aspect-[4/5] w-full overflow-hidden">
                {photo ? (
                    <Image
                        src={photo}
                        alt={`${kind} ${view.passport.garment.reference}`}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                ) : null}
                {view.irisScore ? (
                    <div className="absolute right-3 top-3">
                        <IrisGrade grade={view.irisScore.grade} size="md" tone="solid" shape="square" />
                    </div>
                ) : null}
            </div>
            <div className="p-4">
                <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider">{kind}</p>
                <h3 className="text-foreground text-sm font-semibold leading-snug">
                    {view.passport.garment.reference}
                </h3>
                <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">{view.excerpt}</p>
            </div>
        </Link>
    );
}

export function ArtisanPublicView({ artisan, passports }: Props) {
    const coords = CITY_COORDS[artisan.city];

    return (
        <article className="pb-20 pt-28">
            <header className="mx-auto max-w-5xl px-6">
                <Link
                    href="/artisans"
                    className="text-muted-foreground hover:text-foreground inline-flex items-center text-xs"
                >
                    ← Tous les artisans
                </Link>
                <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
                    <Image
                        src={artisan.photoUrl}
                        alt={`Portrait de ${artisan.displayName}`}
                        width={160}
                        height={160}
                        className="border-border h-32 w-32 shrink-0 rounded-2xl border object-cover sm:h-40 sm:w-40"
                        priority
                    />
                    <div>
                        <p className="text-muted-foreground text-xs font-medium uppercase tracking-[0.25em]">
                            Atelier · {artisan.tier}
                        </p>
                        <h1 className="text-foreground mt-2 text-balance text-4xl font-bold tracking-tight">
                            {artisan.atelierName}
                        </h1>
                        <p className="text-muted-foreground mt-2 text-base">
                            {artisan.displayName} ·{' '}
                            <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {artisan.city}, {artisan.region}
                            </span>
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {artisan.epvLabeled && (
                                <Badge variant="secondary" className="gap-1">
                                    <Award className="h-3 w-3" /> Entreprise du Patrimoine Vivant
                                </Badge>
                            )}
                            {artisan.ofgLabeled && <Badge variant="secondary">Origine France Garantie</Badge>}
                            {artisan.specialities.map((s) => (
                                <Badge key={s} variant="outline">
                                    {s}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            <section className="mx-auto mt-10 grid max-w-5xl gap-6 px-6 lg:grid-cols-[1fr_360px]">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Méthode et savoir-faire</CardTitle>
                    </CardHeader>
                    <CardContent className="text-foreground/90 text-sm leading-relaxed">{artisan.story}</CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Identité</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Plafond passeports</span>
                            <span className="text-foreground font-mono">
                                {Number.isFinite(artisan.passportLimit) ? artisan.passportLimit : '∞'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Inscription LUMIRIS</span>
                            <span className="text-foreground font-mono">
                                {new Date(artisan.joinedAt).toLocaleDateString('fr-FR')}
                            </span>
                        </div>
                        {artisan.websiteUrl ? (
                            <a
                                href={artisan.websiteUrl}
                                className="text-grade-a mt-3 inline-flex items-center gap-1.5 text-sm hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Site externe <ExternalLink className="h-3 w-3" />
                            </a>
                        ) : null}
                    </CardContent>
                </Card>
            </section>

            <section className="mx-auto mt-12 max-w-5xl px-6">
                <h2 className="text-foreground mb-4 text-2xl font-semibold tracking-tight">
                    Pièces de l’artisan ({passports.length})
                </h2>
                {passports.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                        Cet atelier n’a pas encore publié de pièce. Revenez bientôt.
                    </p>
                ) : (
                    <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {passports.map((view) => (
                            <li key={view.passport.id}>
                                <PieceCard view={view} />
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {(artisan.epvLabeled || artisan.ofgLabeled) && (
                <section className="mx-auto mt-12 max-w-5xl px-6">
                    <h2 className="text-foreground mb-4 text-2xl font-semibold tracking-tight">Certifications</h2>
                    <ul className="flex flex-wrap gap-3">
                        {artisan.epvLabeled && (
                            <li className="border-border bg-card flex items-center gap-2 rounded-2xl border p-4">
                                <Award className="text-grade-a h-4 w-4" />
                                <div>
                                    <p className="text-foreground text-sm font-semibold">
                                        Entreprise du Patrimoine Vivant
                                    </p>
                                    <p className="text-muted-foreground text-xs">Label État français - savoir-faire</p>
                                </div>
                            </li>
                        )}
                        {artisan.ofgLabeled && (
                            <li className="border-border bg-card flex items-center gap-2 rounded-2xl border p-4">
                                <Award className="text-grade-b h-4 w-4" />
                                <div>
                                    <p className="text-foreground text-sm font-semibold">Origine France Garantie</p>
                                    <p className="text-muted-foreground text-xs">≥ 50 % du prix de revient en France</p>
                                </div>
                            </li>
                        )}
                    </ul>
                </section>
            )}

            {coords ? (
                <section className="mx-auto mt-12 max-w-5xl px-6">
                    <h2 className="text-foreground mb-4 text-2xl font-semibold tracking-tight">Localisation</h2>
                    <AtelierMap
                        lat={coords.lat}
                        lng={coords.lng}
                        label={artisan.atelierName}
                        sublabel={`${artisan.city} · ${artisan.region}`}
                    />
                </section>
            ) : null}
        </article>
    );
}
