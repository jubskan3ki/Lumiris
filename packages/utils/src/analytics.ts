// Vendor-agnostic interface so swapping the concrete client (Vercel, PostHog, OTel, ...) is a single-file change.

export type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

export interface AnalyticsClient {
    track(name: string, properties?: AnalyticsProperties): void;
    /** Pass `null` to anonymise subsequent events. */
    identify(userId: string | null, traits?: AnalyticsProperties): void;
    /** Frameworks with built-in page tracking can ignore. */
    page(name?: string, properties?: AnalyticsProperties): void;
}

// Default everywhere so tests/CI/local dev never hit the network; production client is injected at boot.
export const noopAnalytics: AnalyticsClient = {
    track: () => {},
    identify: () => {},
    page: () => {},
};

export function createAnalytics(isProduction: boolean, prodClient: () => AnalyticsClient): AnalyticsClient {
    return isProduction ? prodClient() : noopAnalytics;
}
