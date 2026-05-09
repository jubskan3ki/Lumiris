'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { AdminAuditLogEntry } from '@lumiris/types';
import { mockAdminAuditLog } from '@lumiris/mock-data';
import { useCurrentUser } from './current-user';

// Mutable in-memory store backing the audit log. When the backend lands, this becomes a thin
// wrapper around POST /admin/audit; for now we accumulate entries in React state.

type LogActionInput = Omit<AdminAuditLogEntry, 'id' | 'ts' | 'actorId' | 'actorRole' | 'ipMock'>;

interface AuditContextValue {
    entries: readonly AdminAuditLogEntry[];
    push: (entry: AdminAuditLogEntry) => void;
}

const AuditContext = createContext<AuditContextValue | null>(null);

export function AuditLogProvider({ children }: { children: ReactNode }) {
    const [entries, setEntries] = useState<AdminAuditLogEntry[]>(() => [...mockAdminAuditLog]);

    const push = useCallback((entry: AdminAuditLogEntry) => {
        setEntries((prev) => [entry, ...prev]);
    }, []);

    const value = useMemo<AuditContextValue>(() => ({ entries, push }), [entries, push]);

    return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}

export function useAdminAuditLog(): readonly AdminAuditLogEntry[] {
    const ctx = useContext(AuditContext);
    if (!ctx) throw new Error('useAdminAuditLog must be used inside <AuditLogProvider>.');
    return ctx.entries;
}

let nextId = 0;
function generateId(): string {
    nextId += 1;
    return `LOG-RT-${Date.now().toString(36)}-${nextId}`;
}

// Logger curried pré-bindé sur le current admin user - à appeler depuis les event handlers.
export function useLogAction(): (input: LogActionInput) => AdminAuditLogEntry {
    const ctx = useContext(AuditContext);
    if (!ctx) throw new Error('useLogAction must be used inside <AuditLogProvider>.');
    const user = useCurrentUser();

    return useCallback(
        (input: LogActionInput) => {
            const entry: AdminAuditLogEntry = {
                id: generateId(),
                ts: new Date().toISOString(),
                actorId: user.id,
                actorRole: user.role,
                ipMock: '127.0.0.1',
                ...input,
            };
            ctx.push(entry);
            return entry;
        },
        [ctx, user.id, user.role],
    );
}
