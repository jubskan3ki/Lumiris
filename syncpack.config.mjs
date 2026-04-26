// @ts-check
/**
 * Syncpack policy — keep cross-workspace versions aligned.
 * Run `bun run check:deps` (read-only) and `bun run check:deps:fix` (rewrites).
 *
 * Reasoning per group:
 *  - "react"            : single React runtime across the monorepo, no exception.
 *  - "next"             : Next must be identical to avoid type drift in app router.
 *  - "@lumiris/*"       : workspace deps stay on `workspace:*` — never numeric.
 *  - "lockstep tooling" : Tailwind, eslint, typescript pinned together.
 */

export default {
    source: ['package.json', 'apps/*/package.json', 'packages/*/package.json'],
    versionGroups: [
        {
            label: 'Workspace siblings must use workspace:*',
            dependencies: ['@lumiris/**'],
            pinVersion: 'workspace:*',
        },
        {
            label: 'React runtime must match across the monorepo',
            dependencies: ['react', 'react-dom', '@types/react', '@types/react-dom'],
            policy: 'sameRange',
        },
        {
            label: 'Next.js must match across apps',
            dependencies: ['next', 'eslint-config-next', '@next/eslint-plugin-next'],
            policy: 'sameRange',
        },
        {
            label: 'Tailwind v4 toolchain stays in lockstep',
            dependencies: ['tailwindcss', '@tailwindcss/postcss'],
            policy: 'sameRange',
        },
        {
            label: 'TypeScript / ESLint stays in lockstep',
            dependencies: ['typescript', 'eslint', 'typescript-eslint'],
            policy: 'sameRange',
        },
    ],
    semverGroups: [
        {
            label: 'Workspace ranges use a caret',
            dependencyTypes: ['dev', 'prod', 'peer'],
            packages: ['**'],
            dependencies: ['**'],
            range: '^',
        },
    ],
};
