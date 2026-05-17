'use client';

import { useSyncExternalStore } from 'react';
import { readUser } from './auth/storage';
import { USER_KEYS, userScopedKey } from './storage-keys';

const EVENT = 'lumiris:scan-counter-changed';
const USER_CHANGED = 'lumiris:user-changed';

const subscribers = new Set<() => void>();

function currentKey(): string {
    return userScopedKey(readUser()?.id ?? null, USER_KEYS.scanCounter);
}

function read(): number {
    if (typeof window === 'undefined') return 0;
    const raw = window.localStorage.getItem(currentKey());
    const n = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
}

function notify() {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(EVENT));
    subscribers.forEach((cb) => cb());
}

export function incrementScanCounter(): void {
    if (typeof window === 'undefined') return;
    const next = read() + 1;
    window.localStorage.setItem(currentKey(), String(next));
    notify();
}

function subscribe(cb: () => void): () => void {
    subscribers.add(cb);
    if (typeof window !== 'undefined') {
        window.addEventListener(EVENT, cb);
        window.addEventListener('storage', cb);
        window.addEventListener(USER_CHANGED, cb);
    }
    return () => {
        subscribers.delete(cb);
        if (typeof window !== 'undefined') {
            window.removeEventListener(EVENT, cb);
            window.removeEventListener('storage', cb);
            window.removeEventListener(USER_CHANGED, cb);
        }
    };
}

export function useScanCount(): number {
    return useSyncExternalStore(subscribe, read, () => 0);
}
