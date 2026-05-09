import { mockArtisanById } from '@lumiris/mock-data';
import type { Artisan } from '@lumiris/types';

const MARIE = mockArtisanById('art-marie');
if (!MARIE) {
    throw new Error('Mock data missing persona art-marie - atelier dev expects Marie Le Goff.');
}

// Persona Marie est le profil par défaut côté ATELIER en dev (cf. cahier v6.1).
// Le vrai ID artisan viendra du JWT côté apps/api en V5.
export const currentArtisan: Artisan = MARIE;
