import react from '@lumiris/config/eslint/react';

export default [
    ...react,
    {
        files: ['src/**/*.{ts,tsx}'],
    },
    {
        ignores: ['dist/**', 'node_modules/**'],
    },
];
