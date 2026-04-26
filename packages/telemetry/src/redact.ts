/**
 * Last-line-of-defence PII scrubber for span attributes, Sentry events,
 * and Web Vitals payloads. The contract is: traces NEVER carry email,
 * JWT, or real client SKU. We strip aggressively — false positives are
 * acceptable, leaks are not.
 *
 * Keep patterns conservative: anchor on shape (jwt.jwt.jwt), known prefixes
 * (`Bearer `), and structural hints (`@` + TLD). Do not try to pattern-match
 * SKUs by content; instead, allow callers to mark a key as "client SKU"
 * by routing it through `redactValue('sku.client', value)`.
 */

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const JWT_RE = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;
const BEARER_RE = /Bearer\s+[\w.\-+/=]+/gi;
const PRIVATE_KEY_HINT_RE = /-----BEGIN [A-Z ]+-----[\s\S]*?-----END [A-Z ]+-----/g;

const SENSITIVE_KEYS = new Set([
    'authorization',
    'cookie',
    'set-cookie',
    'x-api-key',
    'email',
    'user.email',
    'password',
    'jwt',
    'token',
    'access_token',
    'refresh_token',
    'sku.client',
    'client_sku',
]);

export function redactString(value: string): string {
    return value
        .replace(PRIVATE_KEY_HINT_RE, '[REDACTED:key]')
        .replace(JWT_RE, '[REDACTED:jwt]')
        .replace(BEARER_RE, 'Bearer [REDACTED]')
        .replace(EMAIL_RE, '[REDACTED:email]');
}

export function redactValue(key: string, value: unknown): unknown {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) return '[REDACTED]';
    if (typeof value === 'string') return redactString(value);
    return value;
}

export function redactPii<T extends Record<string, unknown>>(input: T): T {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input)) {
        if (v && typeof v === 'object' && !Array.isArray(v)) {
            out[k] = redactPii(v as Record<string, unknown>);
        } else {
            out[k] = redactValue(k, v);
        }
    }
    return out as T;
}
