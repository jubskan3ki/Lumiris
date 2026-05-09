import type { AdminProfile } from '@lumiris/types';

// équipe interne pour timeline d'activité back-office — User.role limité à 3 valeurs (cf. AdminUserRole)

export interface MockTeamActivityEntry {
    id: string;
    actorId: string;
    actorName: string;
    /** Rôle d'affichage interne — distinct de UserRole, sert à la timeline. */
    role: 'admin';
    action: string;
    targetType: 'passport' | 'artisan' | 'journal' | 'repairer';
    targetLabel: string;
    timestamp: string;
}

export const mockAdmins: readonly AdminProfile[] = [
    {
        id: 'usr-fdr-juba',
        email: 'juba@lumiris.fr',
        role: 'admin',
        name: 'Juba Aït-Adda',
        avatar: 'https://placehold.co/128x128/png?text=Juba',
        createdAt: '2024-04-10T08:00:00Z',
        lastSeenAt: '2026-04-29T20:00:00Z',
    },
    {
        id: 'usr-adm-ops',
        email: 'ops@lumiris.fr',
        role: 'admin',
        name: 'Camille — DevOps',
        avatar: 'https://placehold.co/128x128/png?text=Ops',
        createdAt: '2024-05-15T08:00:00Z',
        lastSeenAt: '2026-04-29T17:30:00Z',
    },
    {
        id: 'usr-cm-elise',
        email: 'elise@lumiris.fr',
        role: 'admin',
        name: 'Élise Garnier',
        avatar: 'https://placehold.co/128x128/png?text=Elise',
        createdAt: '2024-09-02T08:00:00Z',
        lastSeenAt: '2026-04-29T18:45:00Z',
    },
];

export const mockTeamActivity: readonly MockTeamActivityEntry[] = [
    {
        id: 'act-001',
        actorId: 'usr-fdr-juba',
        actorName: 'Juba Aït-Adda',
        role: 'admin',
        action: 'Approbation modération',
        targetType: 'passport',
        targetLabel: 'CHE-MAR-001 (Atelier de Marie)',
        timestamp: '2026-04-29T16:42:00Z',
    },
    {
        id: 'act-002',
        actorId: 'usr-cm-elise',
        actorName: 'Élise Garnier',
        role: 'admin',
        action: 'Publication article',
        targetType: 'journal',
        targetLabel: 'Le lin breton — circuit court',
        timestamp: '2026-04-29T14:08:00Z',
    },
    {
        id: 'act-003',
        actorId: 'usr-fdr-juba',
        actorName: 'Juba Aït-Adda',
        role: 'admin',
        action: 'Mise en revue',
        targetType: 'passport',
        targetLabel: 'PAN-LEI-002 (Leïla Couture)',
        timestamp: '2026-04-29T11:20:00Z',
    },
    {
        id: 'act-004',
        actorId: 'usr-adm-ops',
        actorName: 'Camille — DevOps',
        role: 'admin',
        action: 'Validation KYC retoucheur',
        targetType: 'repairer',
        targetLabel: 'Mehdi Bouzid — Lyon',
        timestamp: '2026-04-28T09:55:00Z',
    },
    {
        id: 'act-005',
        actorId: 'usr-fdr-juba',
        actorName: 'Juba Aït-Adda',
        role: 'admin',
        action: 'Onboarding artisan',
        targetType: 'artisan',
        targetLabel: 'Pauline Roux Mode — Nantes',
        timestamp: '2026-04-27T15:14:00Z',
    },
];
