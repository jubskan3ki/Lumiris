import type { AtelierAddOn, AtelierPlan, LocalPlan } from '@lumiris/types';

export const ATELIER_PLANS: readonly AtelierPlan[] = [
    {
        tier: 'solo',
        label: 'Solo',
        monthlyEur: 29,
        yearlyEur: 290,
        maxPassports: 50,
        maxSeats: 1,
        tagline: "Pour l'artisan qui démarre son passeport.",
        features: [
            "Jusqu'à 50 passeports actifs",
            'Compte unique',
            'Score Iris pré-calculé sur chaque pièce',
            "Page d'atelier publique",
            "Accès à l'annuaire local",
        ],
    },
    {
        tier: 'studio',
        label: 'Studio',
        monthlyEur: 79,
        yearlyEur: 790,
        maxPassports: 300,
        maxSeats: 5,
        popular: true,
        tagline: "L'atelier qui produit en série courte.",
        features: [
            "Jusqu'à 300 passeports actifs",
            "Jusqu'à 5 collaborateurs",
            'Import CSV des composants',
            'Photos haute résolution',
            'Page produit personnalisable',
            'Support prioritaire',
        ],
    },
    {
        tier: 'maison',
        label: 'Maison',
        monthlyEur: 149,
        yearlyEur: 1490,
        maxPassports: null,
        maxSeats: null,
        tagline: 'Maisons et collectifs avec plusieurs lignes.',
        features: [
            'Passeports illimités',
            'Collaborateurs illimités',
            'API & exports GS1',
            'Multi-marques',
            'Single Sign-On',
            'Accompagnement dédié',
        ],
    },
] as const;

export const ATELIER_ADD_ONS: readonly AtelierAddOn[] = [
    {
        id: 'atelier-plus',
        label: 'ATELIER+',
        monthlyEur: 19,
        yearlyEur: 190,
        description:
            "Visibilité renforcée dans l'annuaire LUMIRIS - sans jamais influencer le score Iris. Aucun acteur n'achète son score.",
    },
] as const;

export const LOCAL_PLANS: readonly LocalPlan[] = [
    {
        tier: 'free',
        label: 'Local Gratuit',
        monthlyEur: 0,
        yearlyEur: 0,
        description: "Fiche retoucheur de base dans l'annuaire local LUMIRIS.",
    },
    {
        tier: 'local',
        label: 'Local',
        monthlyEur: 19,
        yearlyEur: 190,
        description: 'Fiche détaillée, photos, créneaux, mise en avant locale, badges certifications.',
    },
] as const;

export const popularAtelierPlan: AtelierPlan =
    ATELIER_PLANS.find((p) => p.popular) ?? (ATELIER_PLANS[1] as AtelierPlan);
