import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
    {
        ignores: [
            'assets/vendor/**',
            'node_modules/**',
            'public/**',
            'var/**',
            'vendor/**',
            'graphify-out/**',
        ],
    },
    {
        files: ['assets/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: { ...globals.browser },
        },
        rules: {
            ...js.configs.recommended.rules,
        },
    },
    prettier,
];
