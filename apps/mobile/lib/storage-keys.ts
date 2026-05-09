// Tous les écrans Vision partagent le même préfixe `lumiris.*` pour rendre l'effacement
// "Effacer toutes mes données" du Profil exhaustif et auditable d'un coup d'œil.

export const STORAGE_KEYS = {
    wardrobe: 'lumiris.wardrobe.v1',
    scanCounter: 'lumiris.scans.v1',
} as const;

export const STORAGE_PREFIX = 'lumiris.';
