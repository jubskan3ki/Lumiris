import next from '@lumiris/config/eslint/next';
import react from '@lumiris/config/eslint/react';

// double-load react/jsx-a11y rules.
const nextLayer = next.find((entry) => entry?.plugins?.['@next/next']);

export default [
    ...react,
    { ...nextLayer, files: ['apps/**/*.{ts,tsx,js,jsx}'] },
    {
        files: ['packages/ui/src/components/ui/**/*.{ts,tsx}'],
        rules: {
            'jsx-a11y/anchor-has-content': 'off',
            'jsx-a11y/click-events-have-key-events': 'off',
            'jsx-a11y/no-noninteractive-element-interactions': 'off',
            'jsx-a11y/no-static-element-interactions': 'off',
            'react/no-danger': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_|^[A-Z]' }],
        },
    },
    {
        ignores: [
            '**/node_modules/**',
            '**/.next/**',
            '**/dist/**',
            '**/build/**',
            '**/.turbo/**',
            '**/coverage/**',
            '**/out/**',
            '**/src-tauri/target/**',
        ],
    },
];
