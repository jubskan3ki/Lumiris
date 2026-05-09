export {
    type ArtisanWithSlug,
    mockArtisanBySlug as getArtisanBySlug,
    mockArtisanById as getArtisanById,
} from '@lumiris/mock-data';

import { mockArtisansWithSlug } from '@lumiris/mock-data';

export function getAllArtisans() {
    return mockArtisansWithSlug;
}
