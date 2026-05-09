// identités côté consumer - back-office utilise AdminUserRole (cf. admin-rbac.ts)

export type UserRole = 'consumer' | 'artisan' | 'admin';

export interface User {
    id: string;
    /** Optionnel pour les consumers anonymes (Vision pré-auth). */
    email?: string;
    role: UserRole;
    name?: string;
    avatar?: string;
    anon?: boolean;
    createdAt: string;
    lastSeenAt?: string;
}

export interface ConsumerProfile extends User {
    role: 'consumer';
    /** Garde-Robe : IDs des passeports scannés / sauvegardés. */
    wardrobePassportIds: readonly string[];
    scansCount: number;
    consentNewsletter?: boolean;
    consentAffiliation?: boolean;
}

export interface ArtisanProfile extends User {
    role: 'artisan';
    artisanId: string;
}

export interface AdminProfile extends User {
    role: 'admin';
}
