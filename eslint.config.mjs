import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: ['dist/**', '.tsbuild/**', 'node_modules/**'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended.map(config => ({
        ...config,
        files: ['lib/**/*.ts', 'scripts/**/*.ts'],
    })),
    {
        files: ['lib/**/*.ts'],
        languageOptions: {
            globals: globals.browser,
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-expressions': 'off',
            'prefer-const': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', {
                argsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^ignore',
            }],
        },
    },
    {
        files: ['lib/Css.ts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
    {
        files: ['scripts/**/*.ts'],
        languageOptions: {
            globals: globals.node,
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'warn',
        },
    },
    {
        files: ['scripts/**/*.js', 'eslint.config.mjs'],
        languageOptions: {
            globals: globals.node,
        },
        rules: {
            'no-unused-vars': ['warn', {
                argsIgnorePattern: '^_',
            }],
        },
    },
    {
        rules: {
            semi: ['warn', 'always'],
            'comma-dangle': ['warn', 'always-multiline'],
            'no-fallthrough': 'error',
            'no-console': 'warn',
        },
    },
);
