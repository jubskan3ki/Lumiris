const NFC_SIM_LATENCY_MS = 1500;

export function simulateNfcWrite(url: string): Promise<{ ok: true; bytes: number }> {
    return new Promise((resolve) => {
        window.setTimeout(() => {
            resolve({ ok: true, bytes: new TextEncoder().encode(url).length });
        }, NFC_SIM_LATENCY_MS);
    });
}
