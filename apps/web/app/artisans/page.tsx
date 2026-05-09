import type { Metadata } from 'next';
import { ArtisansDirectory } from '@/features/artisans-directory';
import { getAllArtisans } from '@/lib/artisans';

export const metadata: Metadata = {
    title: 'Annuaire des artisans textiles français',
    description:
        'Tous les ateliers textiles français qui publient leurs passeports DPP sur LUMIRIS. Couture, tissage, bonneterie, cordonnerie, broderie — partout en France.',
    alternates: { canonical: '/artisans' },
};

export default function ArtisansPage() {
    return <ArtisansDirectory artisans={getAllArtisans()} />;
}
