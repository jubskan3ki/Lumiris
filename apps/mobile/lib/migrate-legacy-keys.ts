'use client';

// Migration unique des buckets localStorage NON-scopés (`lumiris.<suffix>`) vers
// le format scopé par user (`lumiris.users.{userId}.<suffix>`) introduit pour éviter
// qu'un persona voie les données d'un autre persona connecté ensuite sur le même
// appareil. Idempotente : ne touche pas aux clés déjà migrées et ne réécrase rien.

import { readUser } from './auth/storage';
import { USER_KEYS, userScopedKey } from './storage-keys';

interface LegacyMapping {
    legacyKey: string;
    suffix: (typeof USER_KEYS)[keyof typeof USER_KEYS];
}

// L'ancienne clé wardrobe vivait en `v1` (textile-only) ; le nouveau bucket est `v2`
// (multi-secteur). Les autres buckets gardent leur version mais changent juste de
// namespace. On ne les liste que pour le déplacement, le shape lui-même est inchangé.
const LEGACY_MAPPINGS: readonly LegacyMapping[] = [
    { legacyKey: 'lumiris.wardrobe.v1', suffix: USER_KEYS.wardrobe },
    { legacyKey: 'lumiris.scans.v1', suffix: USER_KEYS.scanCounter },
    { legacyKey: 'lumiris.compare.v1', suffix: USER_KEYS.compare },
    { legacyKey: 'lumiris.settings.v1', suffix: USER_KEYS.settings },
    { legacyKey: 'lumiris.affiliate.clicks.v1', suffix: USER_KEYS.affiliateClicks },
    { legacyKey: 'lumiris.repairs.v1', suffix: USER_KEYS.repairs },
];

/**
 * À appeler une fois au mount de l'app. Pour chaque bucket per-user ayant encore
 * une clé legacy non-scopée, on la déplace vers le scope du user courant (ou `anon`
 * s'il n'y a pas d'user). Si le scope cible existe déjà, on n'écrase pas - on
 * supprime simplement la clé legacy pour ne pas la voir resurgir.
 */
export function migrateLegacyKeys(): void {
    if (typeof window === 'undefined') return;

    const userId = readUser()?.id ?? null;

    for (const { legacyKey, suffix } of LEGACY_MAPPINGS) {
        const legacyValue = window.localStorage.getItem(legacyKey);
        if (legacyValue === null) continue;

        const targetKey = userScopedKey(userId, suffix);
        const alreadyHasTarget = window.localStorage.getItem(targetKey) !== null;

        if (!alreadyHasTarget) {
            window.localStorage.setItem(targetKey, legacyValue);
        }
        window.localStorage.removeItem(legacyKey);
    }
}
