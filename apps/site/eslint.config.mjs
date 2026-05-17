import next from '@lumiris/config/eslint/next';

export default [
    ...next,
    {
        ignores: ['.next/**', 'node_modules/**', 'public/**'],
    },
    {
        files: ['features/json-ld/index.tsx'],
        rules: { 'react/no-danger': 'off' },
    },
];
