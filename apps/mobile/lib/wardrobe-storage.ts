'use client';

// Garde-Robe locale - persistance localStorage anonyme. Pas de sync, pas d'auth.
// Format versionné (`lumiris.wardrobe.v1`) pour pouvoir migrer plus tard sans casser
// l'historique d'un utilisateur.

import { useSyncExternalStore } from 'react';
import { STORAGE_KEYS } from './storage-keys';

export interface CareLogEntry {
    date: string;
    action: string;
}

export interface WardrobeEntry {
    passportId: string;
    addedAt: string;
    careLog: readonly CareLogEntry[];
}

const KEY = STORAGE_KEYS.wardrobe;
const EVENT = 'lumiris:wardrobe-changed';

const subscribers = new Set<() => void>();

function notify() {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(EVENT));
    subscribers.forEach((cb) => cb());
}

function isCareLogEntry(value: unknown): value is CareLogEntry {
    if (!value || typeof value !== 'object') return false;
    const v = value as Record<string, unknown>;
    return typeof v.date === 'string' && typeof v.action === 'string';
}

function isWardrobeEntry(value: unknown): value is WardrobeEntry {
    if (!value || typeof value !== 'object') return false;
    const v = value as Record<string, unknown>;
    return (
        typeof v.passportId === 'string' &&
        typeof v.addedAt === 'string' &&
        Array.isArray(v.careLog) &&
        v.careLog.every(isCareLogEntry)
    );
}

function read(): WardrobeEntry[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = window.localStorage.getItem(KEY);
        if (!raw) return [];
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(isWardrobeEntry);
    } catch {
        return [];
    }
}

function write(entries: readonly WardrobeEntry[]): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(KEY, JSON.stringify(entries));
    notify();
}

export function addToWardrobe(passportId: string): void {
    const current = read();
    if (current.some((entry) => entry.passportId === passportId)) return;
    write([...current, { passportId, addedAt: new Date().toISOString(), careLog: [] }]);
}

export function removeFromWardrobe(passportId: string): void {
    write(read().filter((entry) => entry.passportId !== passportId));
}

// Snapshot stable - useSyncExternalStore re-render seulement si la référence change.
let snapshotCache: readonly WardrobeEntry[] = [];
let snapshotSerialized = '';

function getSnapshot(): readonly WardrobeEntry[] {
    const current = read();
    const serialized = JSON.stringify(current);
    if (serialized !== snapshotSerialized) {
        snapshotCache = current;
        snapshotSerialized = serialized;
    }
    return snapshotCache;
}

function getServerSnapshot(): readonly WardrobeEntry[] {
    return [];
}

function subscribe(cb: () => void): () => void {
    subscribers.add(cb);
    if (typeof window !== 'undefined') {
        window.addEventListener(EVENT, cb);
        // `storage` event = sync entre onglets, propre côté web.
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

export function useWardrobe(): readonly WardrobeEntry[] {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
