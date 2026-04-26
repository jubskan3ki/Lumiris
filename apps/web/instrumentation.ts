export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const [{ initOtel }, { initSentry }] = await Promise.all([
            import('@lumiris/telemetry/otel-node'),
            import('@lumiris/telemetry/sentry-next'),
        ]);
        initOtel({ service: 'lumiris-web' });
        initSentry({ dsn: process.env.SENTRY_DSN_WEB, service: 'lumiris-web' });
    }
}
