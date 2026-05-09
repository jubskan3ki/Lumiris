// Heuristique "LUMIRIS Local" - atelier vérifié et abonné au plan payant Local.
// Le champ `localSubscribed` est aujourd'hui la seule source de vérité côté mock ;
// quand le backend exposera `tier`/`isLumirisLocal`, basculer ici sans toucher l'UI.

import type { Repairer } from '@lumiris/types';

export function isLumirisLocal(repairer: Repairer): boolean {
    return repairer.localSubscribed;
}

export function repairerSlug(repairer: Pick<Repairer, 'id'>): string {
    return repairer.id;
}
