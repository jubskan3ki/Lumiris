/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    outputFileTracingRoot: new URL('../../', import.meta.url).pathname,
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
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
