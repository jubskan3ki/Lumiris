/** @type {import('stylelint').Config} */
export default {
    extends: ['stylelint-config-standard', 'stylelint-config-tailwindcss'],
    rules: {
        // Tailwind v4 at-rules
        'at-rule-no-unknown': [
            true,
            {
                ignoreAtRules: [
                    'tailwind',
                    'theme',
                    'apply',
                    'layer',
                    'variants',
                    'responsive',
                    'screen',
                    'custom-variant',
                    'config',
                    'plugin',
                    'utility',
                    'source',
                    'import',
                ],
            },
        ],
        'no-descending-specificity': null,
        'selector-class-pattern': null,
        'custom-property-pattern': null,
        'media-feature-name-no-unknown': [true, { ignoreMediaFeatureNames: ['prefers-reduced-motion'] }],
    },
};
