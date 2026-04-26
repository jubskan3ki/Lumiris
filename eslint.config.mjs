import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';

export default tseslint.config(
    // 1. Fichiers et dossiers ignorés globalement
    {
        ignores: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/build/**', '**/.turbo/**', '**/coverage/**'],
    },

    // 2. Base JavaScript & TypeScript (S'applique à tout: NestJS, Scripts, React)
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.node,
                ...globals.browser,
            },
        },
        rules: {
            // --- Règles TypeScript strictes ---
            '@typescript-eslint/no-unused-expressions': ['error', { allowTernary: true, allowShortCircuit: true }],
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-non-null-assertion': 'warn',
            '@typescript-eslint/no-inferrable-types': 'error',
            '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
            '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
            '@typescript-eslint/prefer-as-const': 'error',
            '@typescript-eslint/no-duplicate-enum-values': 'error',

            // --- Règles Générales de Qualité (inspirées de ta config d'origine) ---
            'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
            'prefer-const': 'error',
            'no-var': 'error',
            'object-shorthand': 'error',
            'prefer-arrow-callback': 'error',
            'no-unneeded-ternary': 'error',
            'prefer-template': 'error',
            'no-useless-concat': 'error',
            'no-useless-return': 'error',
            'no-lonely-if': 'error',
            'no-else-return': ['error', { allowElseIf: false }],
            'array-callback-return': 'error',
            'require-await': 'warn',
            eqeqeq: ['error', 'always', { null: 'ignore' }],
            curly: ['error', 'all'],
        },
    },

    // 3. Spécificités React & Accessibilité (Ne s'applique QUE sur les fichiers .jsx et .tsx)
    // -> NestJS ne sera pas pollué par ces règles !
    {
        files: ['**/*.jsx', '**/*.tsx'],
        plugins: {
            react: reactPlugin,
            'react-hooks': reactHooksPlugin,
            'jsx-a11y': jsxA11yPlugin,
        },
        settings: {
            react: { version: 'detect' },
        },
        rules: {
            ...reactPlugin.configs.recommended.rules,
            ...reactPlugin.configs['jsx-runtime'].rules, // Pour React 17+ (désactive le besoin de 'import React')
            ...reactHooksPlugin.configs.recommended.rules,
            ...jsxA11yPlugin.configs.recommended.rules,

            // Règles structurelles React
            'react/self-closing-comp': ['error', { component: true, html: true }],
            'react/no-danger': 'warn',
            'react/jsx-boolean-value': ['warn', 'never'],
            'react/prop-types': 'off', // TypeScript gère déjà les props
            'react/react-in-jsx-scope': 'off',

            // Règles d'accessibilité strictes (transposées)
            'jsx-a11y/alt-text': 'error',
            'jsx-a11y/anchor-has-content': 'error',
            'jsx-a11y/click-events-have-key-events': 'warn',
            'jsx-a11y/control-has-associated-label': 'warn',
            'jsx-a11y/interactive-supports-focus': 'warn',
            'jsx-a11y/label-has-associated-control': [
                'warn',
                {
                    required: { some: ['nesting', 'id'] },
                },
            ],
            'jsx-a11y/no-autofocus': 'warn',
            'jsx-a11y/tabindex-no-positive': 'error',
        },
    },

    // 4. Prettier (Toujours en dernier pour surcharger et désactiver les règles de formatage d'ESLint)
    prettier,
);
