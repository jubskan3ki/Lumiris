/** @type {import('@commitlint/types').UserConfig} */
export default {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'ci', 'revert', 'build'],
        ],
        'scope-enum': [
            1,
            'always',
            [
                'admin',
                'site',
                'mobile',
                'ui',
                'core',
                'types',
                'config',
                'monorepo',
                'deps',
                'ci',
                'docs',
                'tauri',
                'scoring',
            ],
        ],
        'subject-max-length': [2, 'always', 100],
        'header-max-length': [2, 'always', 120],
        'body-max-line-length': [1, 'always', 200],
    },
};
