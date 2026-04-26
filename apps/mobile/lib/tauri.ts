import type { Certificate, DPPRecord, ScoreResult } from '@lumiris/types';
import { computeScore } from '@lumiris/core/scoring';

declare global {
    interface Window {
        __TAURI__?: unknown;
        __TAURI_INTERNALS__?: unknown;
    }
}

/**
 * True when the page is running inside the Tauri webview. The double check
 * covers both legacy (`__TAURI__`) and Tauri 2 (`__TAURI_INTERNALS__`) globals.
 */
export function isTauri(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean(window.__TAURI__ ?? window.__TAURI_INTERNALS__);
}

/**
 * Single entry point used by the mobile UI to run the 50/30/20 algorithm.
 *
 * - In Tauri: the JSON-encoded DPP is sent to the Rust `compute_score` command,
 *   which validates it and returns the parsed payload. The actual scoring then
 *   runs against `@lumiris/core` to keep one source of truth.
 * - In pure web: skip the IPC roundtrip and call `@lumiris/core` directly.
 */
export async function computeScoreBridge(
    dpp: DPPRecord,
    certificates: readonly Certificate[] = [],
): Promise<ScoreResult> {
    if (isTauri()) {
        const { invoke } = await import('@tauri-apps/api/core');
        const parsed = await invoke<DPPRecord>('compute_score', {
            dppJson: JSON.stringify(dpp),
        });
        return computeScore(parsed, { certificates });
    }
    return computeScore(dpp, { certificates });
}
