'use client';

// Préférences UI (apparence + notifs) - persistance localStorage en mode démo.
// L'identité utilisateur (`displayName`, `email`, `city`) reste dans `lib/auth`
// (cf. `MockUser`) ; ce module ne stocke que ce qui n'a pas de propriétaire backend.

import { useSyncExternalStore } from 'react';
import { STORAGE_KEYS } from './storage-keys';

export type ThemePref = 'system' | 'light' | 'dark';

export interface Settings {
    theme: ThemePref;
    reduceMotion: boolean;
    notifNewArticles: boolean;
    notifNewArtisans: boolean;
    notifReminders: boolean;
}

const DEFAULT_SETTINGS: Settings = {
    theme: 'system',
    reduceMotion: false,
    notifNewArticles: true,
    notifNewArtisans: true,
    notifReminders: false,
};

const KEY = STORAGE_KEYS.settings;
const EVENT = 'lumiris:settings-changed';

const subscribers = new Set<() => void>();

function notify(): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(EVENT));
    subscribers.forEach((cb) => cb());
}

const VALID_THEMES: readonly ThemePref[] = ['system', 'light', 'dark'];

function isThemePref(value: unknown): value is ThemePref {
    return typeof value === 'string' && (VALID_THEMES as readonly string[]).includes(value);
}

function pickSettings(value: unknown): Partial<Settings> {
    if (!value || typeof value !== 'object') return {};
    const v = value as Record<string, unknown>;
    const out: Partial<Settings> = {};
    if (isThemePref(v.theme)) out.theme = v.theme;
    if (typeof v.reduceMotion === 'boolean') out.reduceMotion = v.reduceMotion;
    if (typeof v.notifNewArticles === 'boolean') out.notifNewArticles = v.notifNewArticles;
    if (typeof v.notifNewArtisans === 'boolean') out.notifNewArtisans = v.notifNewArtisans;
    if (typeof v.notifReminders === 'boolean') out.notifReminders = v.notifReminders;
    return out;
}

function read(): Settings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
        const raw = window.localStorage.getItem(KEY);
        if (!raw) return DEFAULT_SETTINGS;
        const parsed: unknown = JSON.parse(raw);
        // Merge avec les defaults - préserve forward-compat si une nouvelle clé est ajoutée.
        return { ...DEFAULT_SETTINGS, ...pickSettings(parsed) };
    } catch {
        return DEFAULT_SETTINGS;
    }
}

function write(settings: Settings): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(KEY, JSON.stringify(settings));
    notify();
}

export function updateSettings(patch: Partial<Settings>): void {
    write({ ...read(), ...patch });
}

let snapshotCache: Settings = DEFAULT_SETTINGS;
let snapshotSerialized = '';

function getSnapshot(): Settings {
    const current = read();
    const serialized = JSON.stringify(current);
    if (serialized !== snapshotSerialized) {
        snapshotCache = current;
        snapshotSerialized = serialized;
    }
    return snapshotCache;
}

function getServerSnapshot(): Settings {
    return DEFAULT_SETTINGS;
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

export function useSettings(): Settings {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
