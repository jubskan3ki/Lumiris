/**
 * Vendor-agnostic analytics interface. Apps inject the concrete client (Vercel
 * Analytics, PostHog, OTel, ...) and library code only ever depends on this
 * interface — so swapping vendors is a single-file change.
 */

export type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

export interface AnalyticsClient {
    /** Fire-and-forget event, e.g. `track('dpp_published', { id })`. */
    track(name: string, properties?: AnalyticsProperties): void;
    /** Bind subsequent events to a user (or anonymise if null). */
    identify(userId: string | null, traits?: AnalyticsProperties): void;
    /** Synthetic page view. Frameworks that auto-track can ignore. */
    page(name?: string, properties?: AnalyticsProperties): void;
}

/**
 * No-op stub. Use everywhere by default so tests, CI, and local dev never need
 * a network round-trip. The real implementation is injected at the app entry.
 */
export const noopAnalytics: AnalyticsClient = {
    track: () => {},
    identify: () => {},
    page: () => {},
};

/**
 * Branch on environment without leaking the production stub into bundles. Most
 * apps will call this once at boot and re-export the client.
 */
export function createAnalytics(isProduction: boolean, prodClient: () => AnalyticsClient): AnalyticsClient {
    return isProduction ? prodClient() : noopAnalytics;
}
