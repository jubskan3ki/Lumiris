import type { AffiliationEvent } from '@lumiris/types';

export const ANONYMISATION_THRESHOLD_DAYS = 30;
export const NOW_REF = new Date('2026-04-30T08:00:00Z').getTime();

export function anonymiseUserId(userId: string, occurredAt: string): string {
    const ageDays = (NOW_REF - new Date(occurredAt).getTime()) / 86_400_000;
    if (ageDays < ANONYMISATION_THRESHOLD_DAYS) return userId;
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
    }
    return `user_anon_${(hash & 0xfff).toString(16).padStart(3, '0')}`;
}

export interface SuspiciousFlag {
    burst?: { count: number };
    selfBooking?: boolean;
}

export function buildSuspicionMap(events: readonly AffiliationEvent[]): Map<string, SuspiciousFlag> {
    const out = new Map<string, SuspiciousFlag>();

    // burst: > 5 conversions par jour pour le même userId
    const dayKey = (e: AffiliationEvent) => `${e.userId}:${e.occurredAt.slice(0, 10)}`;
    const counts = new Map<string, AffiliationEvent[]>();
    for (const e of events) {
        const k = dayKey(e);
        const list = counts.get(k) ?? [];
        list.push(e);
        counts.set(k, list);
    }
    for (const [, list] of counts) {
        if (list.length > 5) {
            for (const e of list) {
                const flag = out.get(e.id) ?? {};
                flag.burst = { count: list.length };
                out.set(e.id, flag);
            }
        }
    }

    // self-booking: retoucheur === userId
    for (const e of events) {
        if (e.kind === 'repair_booking' && e.userId === e.beneficiaryId) {
            const flag = out.get(e.id) ?? {};
            flag.selfBooking = true;
            out.set(e.id, flag);
        }
    }

    return out;
}
