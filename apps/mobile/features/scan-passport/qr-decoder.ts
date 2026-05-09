// Décodage des QR LUMIRIS. Trois formats reconnus :
//   - URL passeport canonique : https://lumiris.fr/passeport/{id}
//   - GS1 Digital Link        : https://id.lumiris.fr/01/{gtin}/21/{serial}
//   - GS1 Digital Link élément : query gtin=… (rare, certains scanners aplatissent)
// Tout autre payload retourne `kind: 'unknown'`. Le caller fait le lookup via mock-data.

import { mockPassportById, mockPassportByGtin } from '@lumiris/mock-data';
import type { Passport } from '@lumiris/types';

export type DecodedScan =
    | { kind: 'passport-id'; id: string }
    | { kind: 'gs1-gtin'; gtin: string; serial?: string }
    | { kind: 'unknown'; raw: string };

export function decodeQrPayload(payload: string): DecodedScan {
    const trimmed = payload.trim();
    if (!trimmed) return { kind: 'unknown', raw: payload };

    // 1. URL passeport canonique
    const passportUrlMatch = trimmed.match(/lumiris\.fr\/passeport\/([\w-]+)/i);
    if (passportUrlMatch?.[1]) {
        return { kind: 'passport-id', id: passportUrlMatch[1] };
    }

    // 2. GS1 Digital Link compact `…/01/<gtin>/21/<serial>`
    const gs1Match = trimmed.match(/\/01\/(\d{8,14})(?:\/21\/([\w-]+))?/i);
    if (gs1Match?.[1]) {
        return { kind: 'gs1-gtin', gtin: gs1Match[1], serial: gs1Match[2] };
    }

    // 3. GS1 element string `…?gtin=…`
    try {
        const url = new URL(trimmed);
        const gtin = url.searchParams.get('gtin');
        if (gtin && /^\d{8,14}$/.test(gtin)) {
            const serial = url.searchParams.get('serial') ?? undefined;
            return { kind: 'gs1-gtin', gtin, serial };
        }
    } catch {
        // payload n'est pas une URL — on continue
    }

    return { kind: 'unknown', raw: trimmed };
}

/** Résout un payload décodé en passeport mock. Renvoie undefined si introuvable. */
export function resolvePassportFromScan(decoded: DecodedScan): Passport | undefined {
    if (decoded.kind === 'passport-id') return mockPassportById(decoded.id);
    if (decoded.kind === 'gs1-gtin') return mockPassportByGtin(decoded.gtin);
    return undefined;
}
