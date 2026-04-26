import type { LUMIRIS_SERVICES, WEB_VITAL_NAMES } from './constants';

export type TelemetryEnv = 'development' | 'production' | 'test';
export type ServiceName = (typeof LUMIRIS_SERVICES)[number];
export type WebVitalName = (typeof WEB_VITAL_NAMES)[number];

export interface WebVitalPayload {
    name: WebVitalName;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    /** Anonymous, non-PII identifier scoped to a single browser session. */
    sessionId: string;
    /** App emitting the vital. */
    app: ServiceName;
    /** Page route as captured by Next router (template form, e.g. `/dpp/[id]`). */
    route: string;
    navigationType?: string;
    /** Wall-clock ms — never tied to identifying user data. */
    timestamp: number;
}
