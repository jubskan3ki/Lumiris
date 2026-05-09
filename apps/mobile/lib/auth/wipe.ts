import { STORAGE_PREFIX } from '../storage-keys';

const CHANGE_EVENTS = [
    'lumiris:wardrobe-changed',
    'lumiris:scan-counter-changed',
    'lumiris:auth-changed',
    'lumiris:compare-changed',
    'lumiris:repairs-changed',
] as const;

export function wipeAllUserData(): void {
    if (typeof window === 'undefined') return;

    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key !== null && key.startsWith(STORAGE_PREFIX)) {
            keysToRemove.push(key);
        }
    }
    for (const key of keysToRemove) {
        window.localStorage.removeItem(key);
    }

    for (const event of CHANGE_EVENTS) {
        window.dispatchEvent(new CustomEvent(event));
    }
}
