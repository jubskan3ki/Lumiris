// Crash-early env validator: never silently coerce — required-but-missing or parse failure throws EnvValidationError.

export interface EnvSpecBase<TRequired extends boolean> {
    required?: TRequired;
    description?: string;
}

export type StringSpec<R extends boolean> = EnvSpecBase<R> & {
    kind: 'string';
    default?: string;
};

export type NumberSpec<R extends boolean> = EnvSpecBase<R> & {
    kind: 'number';
    default?: number;
    min?: number;
    max?: number;
};

export type BooleanSpec<R extends boolean> = EnvSpecBase<R> & {
    kind: 'boolean';
    default?: boolean;
};

export type EnumSpec<R extends boolean, V extends string> = EnvSpecBase<R> & {
    kind: 'enum';
    values: readonly V[];
    default?: V;
};

export type EnvSpec = StringSpec<boolean> | NumberSpec<boolean> | BooleanSpec<boolean> | EnumSpec<boolean, string>;

export type EnvSchema = Record<string, EnvSpec>;

// fragment partagé Next.js (API base URL + web-vitals sample rate + NODE_ENV) — à étaler par app
export const NEXT_APP_BASE_ENV_SCHEMA = {
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
} as const satisfies EnvSchema;

type Resolve<S extends EnvSpec> =
    S extends StringSpec<infer R>
        ? R extends true
            ? string
            : string | undefined
        : S extends NumberSpec<infer R>
          ? R extends true
              ? number
              : number | undefined
          : S extends BooleanSpec<infer R>
            ? R extends true
                ? boolean
                : boolean | undefined
            : S extends EnumSpec<infer R, infer V>
              ? R extends true
                  ? V
                  : V | undefined
              : never;

export type ParsedEnv<S extends EnvSchema> = {
    [K in keyof S]: Resolve<S[K]>;
};

export class EnvValidationError extends Error {
    constructor(public readonly issues: readonly string[]) {
        super(`Invalid environment:\n  - ${issues.join('\n  - ')}`);
        this.name = 'EnvValidationError';
    }
}

const TRUTHY = new Set(['1', 'true', 'yes', 'on']);
const FALSY = new Set(['0', 'false', 'no', 'off', '']);

export function parseEnv<S extends EnvSchema>(
    schema: S,
    source: NodeJS.ProcessEnv | Record<string, string | undefined> = readProcessEnv(),
): ParsedEnv<S> {
    const out = {} as Record<string, unknown>;
    const issues: string[] = [];

    for (const key of Object.keys(schema)) {
        const spec = schema[key];
        if (!spec) continue;
        const raw = source[key];
        const result = parseOne(key, spec, raw);
        if ('error' in result) {
            issues.push(result.error);
        } else {
            out[key] = result.value;
        }
    }

    if (issues.length > 0) throw new EnvValidationError(issues);
    return out as ParsedEnv<S>;
}

function parseOne(key: string, spec: EnvSpec, raw: string | undefined): { value: unknown } | { error: string } {
    const present = raw !== undefined && raw !== '';

    if (!present) {
        if ('default' in spec && spec.default !== undefined) return { value: spec.default };
        if (spec.required) return { error: `${key} is required but missing` };
        return { value: undefined };
    }

    switch (spec.kind) {
        case 'string':
            return { value: raw };

        case 'number': {
            const n = Number(raw);
            if (!Number.isFinite(n)) return { error: `${key} is not a finite number (got "${raw}")` };
            if (spec.min !== undefined && n < spec.min) return { error: `${key}=${n} is below min ${spec.min}` };
            if (spec.max !== undefined && n > spec.max) return { error: `${key}=${n} is above max ${spec.max}` };
            return { value: n };
        }

        case 'boolean': {
            const v = raw.trim().toLowerCase();
            if (TRUTHY.has(v)) return { value: true };
            if (FALSY.has(v)) return { value: false };
            return { error: `${key} is not a boolean (got "${raw}")` };
        }

        case 'enum': {
            if ((spec.values as readonly string[]).includes(raw)) return { value: raw };
            return {
                error: `${key} must be one of [${spec.values.join(', ')}] (got "${raw}")`,
            };
        }
    }
}

function readProcessEnv(): NodeJS.ProcessEnv | Record<string, string | undefined> {
    if (typeof process !== 'undefined' && process.env) return process.env;
    return {};
}
