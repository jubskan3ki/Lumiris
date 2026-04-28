// Edge runtime MUST NOT import ./otel-node — use ./sentry-next on Edge, load ./otel-node from instrumentation.ts only when runtime === 'nodejs'.
export { LUMIRIS_SAMPLE_RATE_DEV, LUMIRIS_SAMPLE_RATE_PROD, LUMIRIS_SERVICES, WEB_VITAL_NAMES } from './constants';
export type { ServiceName, TelemetryEnv, WebVitalName, WebVitalPayload } from './types';
export { redactPii, redactString, redactValue } from './redact';
