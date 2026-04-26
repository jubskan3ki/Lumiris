import base from '@lumiris/config/eslint/base';

export default [
    ...base,
    {
        files: ['src/**/*.ts'],
    },
    {
        ignores: ['dist/**', 'node_modules/**'],
    },
];
