/**
 * Sentry init for Next.js apps. Call from `instrumentation.ts`
 * `register()` (server) and from a client-side init script.
 *
 * Each app gets its own DSN. Errors are tagged with `service` so a single
 * Sentry org can host all four projects without cross-talk.
 *
 * `beforeSend`/`beforeBreadcrumb` strip PII (email/JWT/Bearer) defensively;
 * primary mitigation is at the source (don't put PII in logs/spans), this
 * is the safety net.
 */

import * as Sentry from '@sentry/nextjs';

import { LUMIRIS_SAMPLE_RATE_DEV, LUMIRIS_SAMPLE_RATE_PROD } from './constants';
import { redactString } from './redact';
import type { ServiceName, TelemetryEnv } from './types';

export interface InitSentryOptions {
    /** Required. App-specific DSN. Pull from per-app env var (e.g. `SENTRY_DSN_ADMIN`). */
    dsn: string | undefined;
    service: ServiceName;
    env?: TelemetryEnv;
    /** Trace sample rate. Defaults to dev=1.0 / prod=0.1. */
    sampleRate?: number;
    release?: string;
}

let initialized = false;

export function initSentry(options: InitSentryOptions): void {
    if (initialized) return;
    if (!options.dsn) return;

    const env = options.env ?? (process.env.NODE_ENV as TelemetryEnv) ?? 'development';
    const isProd = env === 'production';
    const tracesSampleRate = options.sampleRate ?? (isProd ? LUMIRIS_SAMPLE_RATE_PROD : LUMIRIS_SAMPLE_RATE_DEV);

    Sentry.init({
        dsn: options.dsn,
        environment: env,
        release: options.release ?? process.env.npm_package_version,
        tracesSampleRate,
        sendDefaultPii: false,
        initialScope: { tags: { service: options.service } },
        beforeSend(event) {
            if (event.message) event.message = redactString(event.message);
            if (event.request?.headers) {
                for (const k of Object.keys(event.request.headers)) {
                    if (k.toLowerCase() === 'authorization' || k.toLowerCase() === 'cookie') {
                        event.request.headers[k] = '[REDACTED]';
                    }
                }
            }
            return event;
        },
        beforeBreadcrumb(crumb) {
            if (typeof crumb.message === 'string') crumb.message = redactString(crumb.message);
            return crumb;
        },
    });

    initialized = true;
}

export { Sentry };
