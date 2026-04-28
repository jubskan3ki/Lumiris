export async function register() {
    // OTel Node SDK is incompatible with the Edge runtime, so guard on NEXT_RUNTIME.
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const [{ initOtel }, { initSentry }] = await Promise.all([
            import('@lumiris/telemetry/otel-node'),
            import('@lumiris/telemetry/sentry-next'),
        ]);
        initOtel({ service: 'lumiris-admin' });
        initSentry({ dsn: process.env.SENTRY_DSN_ADMIN, service: 'lumiris-admin' });
    }
}
