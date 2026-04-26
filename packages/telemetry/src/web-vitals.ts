/**
 * Browser-side Web Vitals collector. Mounted by each Next app via the
 * App Router `useReportWebVitals` hook (see `app/web-vitals.tsx` per app).
 *
 * Posts a JSON payload to the LUMIRIS API `/telemetry/web-vitals` endpoint
 * using `navigator.sendBeacon` when available so vitals survive page
 * unload. Sampling is gated on `NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE`.
 *
 * Important — PII contract:
 *   - sessionId is a per-tab random uuid, NEVER tied to a user identity
 *   - route is the templated path (e.g. `/dpp/[id]`), not the raw URL
 */

import type { Metric } from 'web-vitals';

import { LUMIRIS_SAMPLE_RATE_DEV, LUMIRIS_SAMPLE_RATE_PROD } from './constants';
import type { ServiceName, WebVitalName, WebVitalPayload } from './types';

export interface InitWebVitalsOptions {
    endpoint: string;
    app: ServiceName;
    /** App-router pathname template (e.g. `/dpp/[id]`). */
    route: string;
    /** 0..1. Defaults to dev=1.0 / prod=0.1 from NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE. */
    sampleRate?: number;
}

const SESSION_KEY = '__lumiris_session_id__';

function getSessionId(): string {
    if (typeof window === 'undefined') return 'ssr';
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_KEY, id);
    return id;
}

function shouldSample(rate: number): boolean {
    if (rate >= 1) return true;
    if (rate <= 0) return false;
    return Math.random() < rate;
}

function send(endpoint: string, payload: WebVitalPayload): void {
    const body = JSON.stringify(payload);
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        const blob = new Blob([body], { type: 'application/json' });
        if (navigator.sendBeacon(endpoint, blob)) return;
    }
    void fetch(endpoint, {
        method: 'POST',
        body,
        headers: { 'content-type': 'application/json' },
        keepalive: true,
    }).catch(() => {
        /* swallow — telemetry must never break UX */
    });
}

/**
 * Convert a `web-vitals` Metric to our wire payload.
 * Exposed so callers can pre-filter or batch.
 */
export function toPayload(metric: Metric, app: ServiceName, route: string, sessionId: string): WebVitalPayload {
    return {
        name: metric.name as WebVitalName,
        value: Math.round(metric.value * 1000) / 1000,
        rating: metric.rating,
        sessionId,
        app,
        route,
        navigationType: metric.navigationType,
        timestamp: Date.now(),
    };
}

/**
 * Returns a callback to plug into Next's `useReportWebVitals(cb)`.
 * The hook fires once per metric per page; the callback decides whether
 * to ship based on the sample rate.
 */
export function initWebVitals(options: InitWebVitalsOptions): (metric: Metric) => void {
    const isProd = process.env.NODE_ENV === 'production';
    const fallback = isProd ? LUMIRIS_SAMPLE_RATE_PROD : LUMIRIS_SAMPLE_RATE_DEV;
    const envRate = Number(process.env.NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE ?? '');
    const rate = options.sampleRate ?? (Number.isFinite(envRate) && envRate > 0 ? envRate : fallback);
    const sessionId = getSessionId();

    return (metric: Metric) => {
        if (!shouldSample(rate)) return;
        send(options.endpoint, toPayload(metric, options.app, options.route, sessionId));
    };
}
