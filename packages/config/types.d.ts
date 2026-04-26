/**
 * Ambient module declarations for ESLint config plugins that ship without
 * their own type definitions. Keeps `tsc --noEmit` happy when `checkJs` walks
 * the flat-config files in `eslint/`.
 */

declare module 'eslint-config-prettier';
