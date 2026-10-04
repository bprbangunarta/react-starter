import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Rules that need a parser (hooks, accessibility, promises). Mechanical house rules live in scripts/check-standards.mjs.
export default tseslint.config(
    { ignores: ['dist', 'node_modules'] },
    {
        files: ['src/**/*.{ts,tsx}'],
        extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked, jsxA11y.flatConfigs.recommended, reactHooks.configs.flat.recommended],
        languageOptions: {
            globals: globals.browser,
            parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }],
            '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { attributes: false } }],
            '@typescript-eslint/consistent-type-imports': 'error',
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'error',
            // Loading on mount (session, useResource, network probe) is the sanctioned effect; this React-Compiler-oriented rule flags it.
            'react-hooks/set-state-in-effect': 'off',
            // Login and dialogs focus their first field on purpose; the dialog focus trap (Radix) manages the rest.
            'jsx-a11y/no-autofocus': 'off',
        },
    },
);
