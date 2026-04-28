/** Import env from this module (not `process.env.NEXT_PUBLIC_*`) so invalid values fail at boot, not at render time. */

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
    NODE_ENV: {
        kind: 'enum',
        values: ['development', 'production', 'test'] as const,
        default: 'development',
    },
});

export type WebEnv = typeof env;
