// Read env vars only from this file so missing/invalid values fail at boot, not at render.
import { parseEnv } from '@lumiris/utils/env';

export const env = parseEnv({
    NEXT_PUBLIC_API_BASE_URL: {
        kind: 'string',
        required: false,
        default: 'http://localhost:4000',
    },
    NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE: {
        kind: 'number',
        required: false,
        min: 0,
        max: 1,
    },
    NEXT_PUBLIC_TAURI: {
        kind: 'boolean',
        required: false,
        default: false,
    },
    NODE_ENV: {
        kind: 'enum',
        values: ['development', 'production', 'test'] as const,
        default: 'development',
    },
});

export type MobileEnv = typeof env;
