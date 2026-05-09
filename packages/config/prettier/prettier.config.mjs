/** @type {import('prettier').Config} */
export default {
    printWidth: 120,
    tabWidth: 4,
    useTabs: false,
    semi: true,
    singleQuote: true,
    quoteProps: 'as-needed',
    jsxSingleQuote: false,
    trailingComma: 'all',
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: 'always',
    endOfLine: 'lf',
    plugins: ['prettier-plugin-tailwindcss'],
    tailwindFunctions: ['clsx', 'cn', 'cva', 'twMerge'],
};
