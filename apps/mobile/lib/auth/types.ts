// Mock user - shape locale uniquement, pas couplée au backend (les vrais users
// vivront dans @lumiris/types une fois l'API en place).

export interface MockUser {
    id: string;
    email: string;
    displayName: string;
    city?: string;
    stylePrefs?: string[];
    createdAt: string;
}
