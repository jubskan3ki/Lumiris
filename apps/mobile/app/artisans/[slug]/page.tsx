import { notFound } from 'next/navigation';
import { mockArtisansWithSlug, mockArtisanBySlug } from '@lumiris/mock-data';
import { ArtisanProfile } from '@/features/artisan-profile';

export const dynamicParams = false;

export function generateStaticParams() {
    return mockArtisansWithSlug.map((a) => ({ slug: a.slug }));
}

interface RouteProps {
    params: Promise<{ slug: string }>;
}

export default async function ArtisanRoute({ params }: RouteProps) {
    const { slug } = await params;
    const artisan = mockArtisanBySlug(slug);
    if (!artisan) notFound();
    return (
        <div className="bg-background mx-auto flex h-dvh max-w-md flex-col">
            <ArtisanProfile artisan={artisan} />
        </div>
    );
}
