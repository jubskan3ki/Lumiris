'use client';

import { WebVitals as TelemetryWebVitals } from '@lumiris/telemetry/web-vitals-component';
import { env } from '@/env';

export function WebVitals() {
    return (
        <TelemetryWebVitals
            app="lumiris-client"
            endpoint={`${env.NEXT_PUBLIC_API_BASE_URL}/telemetry/web-vitals`}
            sampleRate={env.NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE}
        />
    );
}
