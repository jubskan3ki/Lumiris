'use client';

import { useSyncExternalStore } from 'react';

// `navigator.onLine` n'existe pas côté serveur. Pour éviter tout mismatch
// d'hydratation Next 16, on renvoie `true` (online) avant la première frame
// puis on bascule sur la valeur réelle dès que React a hydraté côté client.
function getSnapshot(): boolean {
    return typeof navigator === 'undefined' ? true : navigator.onLine;
}

function getServerSnapshot(): boolean {
    return true;
}

function subscribe(notify: () => void): () => void {
    if (typeof window === 'undefined') return () => undefined;
    window.addEventListener('online', notify);
    window.addEventListener('offline', notify);
    return () => {
        window.removeEventListener('online', notify);
        window.removeEventListener('offline', notify);
    };
}

export function useOnlineStatus(): boolean {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
