/**
 * @lumiris/telemetry — single entry point for the three signal types.
 *
 * Sub-paths exist (`./otel-node`, `./sentry-next`, `./sentry-node`,
 * `./web-vitals`, `./redact`) so callers can pull only what their runtime
 * supports. The Next.js Edge runtime, in particular, must NOT import the
 * Node OTel SDK — use `./sentry-next` there and load `./otel-node` from
 * `instrumentation.ts` only when `runtime === 'nodejs'`.
 */
export { LUMIRIS_SAMPLE_RATE_DEV, LUMIRIS_SAMPLE_RATE_PROD, LUMIRIS_SERVICES, WEB_VITAL_NAMES } from './constants';
export type { ServiceName, TelemetryEnv, WebVitalName, WebVitalPayload } from './types';
export { redactPii, redactString, redactValue } from './redact';
