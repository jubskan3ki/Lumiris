'use client';

import { useSyncExternalStore } from 'react';
import { STORAGE_KEYS } from './storage-keys';

const KEY = STORAGE_KEYS.scanCounter;
const EVENT = 'lumiris:scan-counter-changed';

const subscribers = new Set<() => void>();

function read(): number {
    if (typeof window === 'undefined') return 0;
    const raw = window.localStorage.getItem(KEY);
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
    window.localStorage.setItem(KEY, String(next));
    notify();
}

export function getScanCount(): number {
    return read();
}

function subscribe(cb: () => void): () => void {
    subscribers.add(cb);
    if (typeof window !== 'undefined') {
        window.addEventListener(EVENT, cb);
        window.addEventListener('storage', cb);
    }
    return () => {
        subscribers.delete(cb);
        if (typeof window !== 'undefined') {
            window.removeEventListener(EVENT, cb);
            window.removeEventListener('storage', cb);
        }
    };
}

export function useScanCount(): number {
    return useSyncExternalStore(subscribe, read, () => 0);
}
