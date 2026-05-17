'use client';

// Hook React qui résout le score d'un passeport via le bridge Tauri.
// - mode web : valeur synchrone immédiate (mémoïsée), pas d'IPC.
// - mode Tauri : preview sync immédiat (déterministe via `scorePassport`) puis refresh
//   après IPC ; comme la commande Rust valide le JSON et renvoie le même DPP, le
//   résultat post-refresh est identique → pas de flicker ni saut de layout.
// Tolère un passeport `null` pour les call sites conditionnels (ex. modale de scan).

import { useEffect, useMemo, useState } from 'react';
import type { Passport, ScoreResult } from '@lumiris/types';
import { scorePassport } from '../passport-score';
import { isTauri, scoreViaBridge } from '../tauri';

export function usePassportScore(passport: Passport, now: Date): ScoreResult;
export function usePassportScore(passport: Passport | null, now: Date): ScoreResult | null;
export function usePassportScore(passport: Passport | null, now: Date): ScoreResult | null {
    const syncScore = useMemo(() => (passport ? scorePassport(passport, now) : null), [passport, now]);
    const [bridgeScore, setBridgeScore] = useState<ScoreResult | null>(null);

    useEffect(() => {
        if (!passport || !isTauri()) {
            setBridgeScore(null);
            return;
        }
        let cancelled = false;
        void scoreViaBridge(passport, now).then((result) => {
            if (!cancelled) setBridgeScore(result);
        });
        return () => {
            cancelled = true;
        };
    }, [passport, now]);

    return bridgeScore ?? syncScore;
}
