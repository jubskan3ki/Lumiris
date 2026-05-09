// Persistance locale du flag onboarding (clé `lumiris.onboarding.completed.v1`).
// Stocke uniquement '1' / absence - pas besoin de structure plus riche pour un boolean.

import { STORAGE_KEYS } from '../storage-keys';

const KEY = STORAGE_KEYS.onboardingCompleted;

export function hasCompletedOnboarding(): boolean {
    if (typeof window === 'undefined') return false;
    try {
        return window.localStorage.getItem(KEY) === '1';
    } catch {
        return false;
    }
}

export function markOnboardingCompleted(): void {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(KEY, '1');
    } catch {
        // localStorage indisponible (Safari privé) - silencieux : l'onboarding
        // se rejouera au prochain lancement, ce qui est dégradé mais acceptable.
    }
}
