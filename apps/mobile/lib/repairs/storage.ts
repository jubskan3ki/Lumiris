'use client';

// Demandes de retouche locales - persistance localStorage anonyme. Pas de sync,
// pas d'auth. Format versionné (`lumiris.repairs.v1`) pour permettre une migration
// ultérieure sans casser l'historique d'un utilisateur.

import { useSyncExternalStore } from 'react';
import type { RepairerSpecialty } from '@lumiris/types';
import { STORAGE_KEYS } from '../storage-keys';

export type RepairRequestStatus = 'pending' | 'cancelled' | 'completed';

export interface RepairRequest {
    id: string;
    repairerId: string;
    /** Null when the user submitted without selecting a passport. */
    passportId: string | null;
    specialty: RepairerSpecialty;
    description: string;
    /** Base64 data URLs (max 3, ≤1MB each). */
    photos: readonly string[];
    createdAt: string;
    status: RepairRequestStatus;
}

const KEY = STORAGE_KEYS.repairs;
const EVENT = 'lumiris:repairs-changed';
const SPECIALTIES: readonly RepairerSpecialty[] = ['alteration', 'embroidery', 'shoe-repair', 'leather', 'lining'];
const STATUSES: readonly RepairRequestStatus[] = ['pending', 'cancelled', 'completed'];

const subscribers = new Set<() => void>();

function notify(): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(EVENT));
    subscribers.forEach((cb) => cb());
}

function isRepairRequest(value: unknown): value is RepairRequest {
    if (!value || typeof value !== 'object') return false;
    const v = value as Record<string, unknown>;
    return (
        typeof v.id === 'string' &&
        typeof v.repairerId === 'string' &&
        (v.passportId === null || typeof v.passportId === 'string') &&
        typeof v.specialty === 'string' &&
        SPECIALTIES.includes(v.specialty as RepairerSpecialty) &&
        typeof v.description === 'string' &&
        Array.isArray(v.photos) &&
        v.photos.every((p) => typeof p === 'string') &&
        typeof v.createdAt === 'string' &&
        typeof v.status === 'string' &&
        STATUSES.includes(v.status as RepairRequestStatus)
    );
}

function read(): RepairRequest[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = window.localStorage.getItem(KEY);
        if (!raw) return [];
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(isRepairRequest);
    } catch {
        return [];
    }
}

function write(requests: readonly RepairRequest[]): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(KEY, JSON.stringify(requests));
    notify();
}

export function getRepairRequests(): readonly RepairRequest[] {
    return read();
}

export function addRepairRequest(request: RepairRequest): void {
    const current = read();
    write([...current, request]);
}

export function updateRepairRequest(id: string, patch: Partial<Omit<RepairRequest, 'id'>>): void {
    const current = read();
    const next = current.map((r) => (r.id === id ? { ...r, ...patch } : r));
    write(next);
}

// Snapshot stable - useSyncExternalStore re-render seulement si la référence change.
let snapshotCache: readonly RepairRequest[] = [];
let snapshotSerialized = '';

function getSnapshot(): readonly RepairRequest[] {
    const current = read();
    const serialized = JSON.stringify(current);
    if (serialized !== snapshotSerialized) {
        snapshotCache = current;
        snapshotSerialized = serialized;
    }
    return snapshotCache;
}

function getServerSnapshot(): readonly RepairRequest[] {
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

export function useRepairRequests(): readonly RepairRequest[] {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
