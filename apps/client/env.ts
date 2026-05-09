// Read env via this module (never process.env directly) so invalid values fail at boot, not at render.
import { NEXT_APP_BASE_ENV_SCHEMA, parseEnv } from '@lumiris/utils/env';

export const env = parseEnv({
    ...NEXT_APP_BASE_ENV_SCHEMA,
});
