/**
 * Vendor-agnostic web-vitals plumbing. The actual `web-vitals` library is loaded
 * by the consuming app (it imports `web-vitals` itself); this module only
 * provides the shape and a tiny dispatcher so admin/web/mobile feed the same
 * callback regardless of where the metric ends up (OTel, Sentry, console, ...).
 */

export type WebVitalsName = 'CLS' | 'FCP' | 'INP' | 'LCP' | 'TTFB';
export type WebVitalsRating = 'good' | 'needs-improvement' | 'poor';

export interface WebVitalsMetric {
    name: WebVitalsName;
    value: number;
    rating: WebVitalsRating;
    id: string;
    delta: number;
    navigationType?: string;
}

export type WebVitalsHandler = (metric: WebVitalsMetric) => void;

export interface WebVitalsReporterOptions {
    /** Drop a fraction of events. 1 = report everything; 0 = silent. */
    sampleRate?: number;
    /** Tag every metric (e.g. `app: 'web'`). Useful for downstream filtering. */
    tags?: Record<string, string>;
}

/**
 * Wrap a handler with sampling + tagging. Returns a function that should be
 * passed to web-vitals's `onCLS`, `onLCP`, etc.
 */
export function createWebVitalsReporter(
    handler: WebVitalsHandler,
    options: WebVitalsReporterOptions = {},
): WebVitalsHandler {
    const { sampleRate = 1, tags } = options;
    const rate = clamp01(sampleRate);

    return (metric) => {
        if (rate < 1 && Math.random() > rate) return;
        if (tags) {
            handler({ ...metric, ...tagMetric(metric, tags) });
            return;
        }
        handler(metric);
    };
}

/**
 * Convenience no-op handler — useful as a default when an app has not wired a
 * sink yet, so calls type-check without exploding.
 */
export const noopWebVitalsHandler: WebVitalsHandler = () => {};

function clamp01(n: number): number {
    if (!Number.isFinite(n)) return 1;
    return Math.max(0, Math.min(1, n));
}

function tagMetric(metric: WebVitalsMetric, tags: Record<string, string>): Partial<WebVitalsMetric> {
    return {
        id: tags['app'] ? `${tags['app']}:${metric.id}` : metric.id,
    };
}
