import type { Artisan } from '@lumiris/types';
import { mockArtisans } from '@lumiris/mock-data';
import { slugify } from '@lumiris/utils';

export const MOCK_PASSWORD = 'demo';

function mockEmailFor(artisan: Artisan): string {
    const local = slugify(artisan.displayName).replace(/-/g, '.');
    const domain = slugify(artisan.atelierName);
    return `${local}@${domain}.fr`;
}

interface DemoCredential {
    artisan: Artisan;
    email: string;
}

export const DEMO_CREDENTIALS: readonly DemoCredential[] = mockArtisans.map((artisan) => ({
    artisan,
    email: mockEmailFor(artisan),
}));

const EMAIL_INDEX = new Map(DEMO_CREDENTIALS.map(({ artisan, email }) => [email, artisan]));

export function findArtisanByEmail(email: string): Artisan | null {
    const normalized = email.trim().toLowerCase();
    return EMAIL_INDEX.get(normalized) ?? null;
}
