'use client';

import { WebVitals as TelemetryWebVitals } from '@lumiris/telemetry/web-vitals-component';
import { env } from '@/env';

// Default du schema env partagé : tant qu'aucun override, app mock-only sans backend télémetrie → on ne POST pas dans le vide.
const MOCK_ONLY_API_BASE = 'http://localhost:4000';

export function WebVitals() {
    if (env.NEXT_PUBLIC_API_BASE_URL === MOCK_ONLY_API_BASE) return null;

    return (
        <TelemetryWebVitals
            app="lumiris-client"
            endpoint={`${env.NEXT_PUBLIC_API_BASE_URL}/telemetry/web-vitals`}
            sampleRate={env.NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE}
        />
    );
}
