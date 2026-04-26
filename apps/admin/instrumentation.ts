/**
 * Next.js instrumentation entrypoint — runs once per server boot, before
 * any route handler. Guarded on NEXT_RUNTIME so OTel's Node SDK never
 * loads in the Edge runtime (incompatible).
 */
export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const [{ initOtel }, { initSentry }] = await Promise.all([
            import('@lumiris/telemetry/otel-node'),
            import('@lumiris/telemetry/sentry-next'),
        ]);
        initOtel({ service: 'lumiris-admin' });
        initSentry({ dsn: process.env.SENTRY_DSN_ADMIN, service: 'lumiris-admin' });
    }
}
