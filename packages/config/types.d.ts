/**
 * Ambient module declarations for ESLint config plugins that ship without
 * their own type definitions. Keeps `tsc --noEmit` happy when `checkJs` walks
 * the flat-config files in `eslint/`.
 */

declare module 'eslint-config-prettier';
declare module 'eslint-plugin-react';
declare module 'eslint-plugin-react-hooks';
declare module 'eslint-plugin-jsx-a11y';
declare module '@next/eslint-plugin-next';
