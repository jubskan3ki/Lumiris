import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { passportPublicByArtisan, CITY_COORDS } from '@lumiris/mock-data';
import { ArtisanPublicView } from '@/features/artisan-public-view';
import { JsonLd } from '@/features/json-ld';
import { getAllArtisans, getArtisanBySlug } from '@/lib/artisans';

export const dynamicParams = false;

export function generateStaticParams() {
    return getAllArtisans().map((a) => ({ slug: a.slug }));
}

interface RouteProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
    const { slug } = await params;
    const artisan = getArtisanBySlug(slug);
    if (!artisan) return {};

    const title = `${artisan.atelierName} - ${artisan.city} | Artisan textile LUMIRIS`;
    const description = artisan.story.length > 160 ? `${artisan.story.slice(0, 157).trimEnd()}…` : artisan.story;
    const canonical = `/artisans/${artisan.slug}`;

    return {
        title,
        description,
        alternates: { canonical },
        openGraph: {
            type: 'profile',
            url: canonical,
            title,
            description,
            images: artisan.photoUrl ? [{ url: artisan.photoUrl }] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: artisan.photoUrl ? [artisan.photoUrl] : undefined,
        },
    };
}

export default async function ArtisanPage({ params }: RouteProps) {
    const { slug } = await params;
    const artisan = getArtisanBySlug(slug);
    if (!artisan) notFound();

    const passports = passportPublicByArtisan(artisan.id);
    const coords = CITY_COORDS[artisan.city];

    const localBusinessJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': `https://lumiris.fr/artisans/${artisan.slug}`,
        name: artisan.atelierName,
        description: artisan.story,
        url: `https://lumiris.fr/artisans/${artisan.slug}`,
        sameAs: artisan.websiteUrl ? [artisan.websiteUrl] : undefined,
        image: artisan.photoUrl || undefined,
        address: {
            '@type': 'PostalAddress',
            addressLocality: artisan.city,
            addressRegion: artisan.region,
            addressCountry: 'FR',
        },
        geo: coords
            ? {
                  '@type': 'GeoCoordinates',
                  latitude: coords.lat,
                  longitude: coords.lng,
              }
            : undefined,
        founder: { '@type': 'Person', name: artisan.displayName },
    };

    return (
        <>
            <JsonLd data={localBusinessJsonLd} />
            <ArtisanPublicView artisan={artisan} passports={passports} />
        </>
    );
}
