/**
 * Lighthouse CI — Web Vitals budget for the LUMIRIS public surfaces.
 * Runs against `bun start` of @lumiris/web by default; admin & mobile
 * can be added via the `urls` array as they reach a stable preview.
 */
module.exports = {
    ci: {
        collect: {
            startServerCommand: 'bun --filter @lumiris/web start',
            startServerReadyPattern: 'Ready in',
            url: ['http://localhost:3000/'],
            numberOfRuns: 3,
            settings: {
                preset: 'desktop',
            },
        },
        assert: {
            assertions: {
                'categories:performance': ['error', { minScore: 0.9 }],
                'categories:accessibility': ['error', { minScore: 0.95 }],
                'categories:best-practices': ['error', { minScore: 0.95 }],
                'categories:seo': ['error', { minScore: 0.95 }],
                'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
                'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
                'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
                'total-blocking-time': ['warn', { maxNumericValue: 200 }],
            },
        },
        upload: {
            target: 'temporary-public-storage',
        },
    },
};
