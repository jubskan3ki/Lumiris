'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { usePathname } from 'next/navigation';
import { initWebVitals } from './web-vitals';
import type { ServiceName } from './types';

export interface WebVitalsProps {
    /** Service name reported with each beacon — `lumiris-admin`, `lumiris-web`, etc. */
    app: ServiceName;
    /** Telemetry endpoint (e.g. `${API}/telemetry/web-vitals`). */
    endpoint: string;
    /** 0..1; defaults to dev=1.0 / prod=0.1. */
    sampleRate?: number;
}

export function WebVitals({ app, endpoint, sampleRate }: WebVitalsProps) {
    const route = usePathname() ?? '/';
    const reporter = initWebVitals({
        endpoint,
        app,
        route,
        ...(sampleRate !== undefined ? { sampleRate } : {}),
    });
    useReportWebVitals(reporter);
    return null;
}
