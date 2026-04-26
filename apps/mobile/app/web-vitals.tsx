'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { usePathname } from 'next/navigation';
import { initWebVitals } from '@lumiris/telemetry/web-vitals';
import { env } from '@/env';

const ENDPOINT = `${env.NEXT_PUBLIC_API_BASE_URL}/telemetry/web-vitals`;

export function WebVitals() {
    const route = usePathname() ?? '/';
    const reporter = initWebVitals({
        endpoint: ENDPOINT,
        app: 'lumiris-mobile',
        route,
        sampleRate: env.NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE,
    });
    useReportWebVitals(reporter);
    return null;
}
