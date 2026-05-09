// Tous les écrans Vision partagent le même préfixe `lumiris.*` pour rendre l'effacement
// "Effacer toutes mes données" du Profil exhaustif et auditable d'un coup d'œil.

export const STORAGE_KEYS = {
    wardrobe: 'lumiris.wardrobe.v1',
    scanCounter: 'lumiris.scans.v1',
    authUser: 'lumiris.auth.user.v1',
    compare: 'lumiris.compare.v1',
    settings: 'lumiris.settings.v1',
    affiliateClicks: 'lumiris.affiliate.clicks.v1',
    onboardingCompleted: 'lumiris.onboarding.completed.v1',
    repairs: 'lumiris.repairs.v1',
    cameraPromptSeen: 'lumiris.camera.prompt-seen.v1',
    geolocPromptSeen: 'lumiris.geoloc.prompt-seen.v1',
} as const;

export const STORAGE_PREFIX = 'lumiris.';
