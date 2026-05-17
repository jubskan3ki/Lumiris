'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const ATELIER_AUTH_STORAGE_KEY = 'atelier-auth';

interface AuthState {
    artisanId: string | null;
    signedInAt: number | null;
    signIn: (id: string) => void;
    signOut: () => void;
}

const noopStorage = {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            artisanId: null,
            signedInAt: null,
            signIn: (id) => set({ artisanId: id, signedInAt: Date.now() }),
            signOut: () => {
                set({ artisanId: null, signedInAt: null });
                void useAuthStore.persist.clearStorage();
            },
        }),
        {
            name: ATELIER_AUTH_STORAGE_KEY,
            storage: createJSONStorage(() => (typeof window === 'undefined' ? noopStorage : localStorage)),
            version: 1,
            partialize: (s) => ({ artisanId: s.artisanId, signedInAt: s.signedInAt }),
        },
    ),
);

export const signIn = (id: string) => useAuthStore.getState().signIn(id);
export const signOut = () => useAuthStore.getState().signOut();
