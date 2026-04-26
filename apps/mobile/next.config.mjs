/**
 * Mobile app — same Next codebase serves the web port (3002) AND
 * the future Tauri shell (static export to `out/`).
 * Toggle via `BUILD_TARGET=tauri bun run build:tauri`.
 */
const isTauri = process.env.BUILD_TARGET === 'tauri';

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@lumiris/ui', '@lumiris/core', '@lumiris/types', '@lumiris/telemetry'],
    serverExternalPackages: [
        '@opentelemetry/sdk-node',
        '@opentelemetry/auto-instrumentations-node',
        '@opentelemetry/exporter-trace-otlp-http',
        '@opentelemetry/exporter-metrics-otlp-http',
    ],
    experimental: {
        optimizePackageImports: ['lucide-react', '@lumiris/ui'],
    },
    ...(isTauri && {
        output: 'export',
        distDir: 'out',
        images: { unoptimized: true },
        trailingSlash: true,
    }),
    ...(!isTauri && {
        output: 'standalone',
        outputFileTracingRoot: new URL('../../', import.meta.url).pathname,
        images: { unoptimized: true },
    }),
};

export default nextConfig;
