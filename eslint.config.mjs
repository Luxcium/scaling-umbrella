import js from '@eslint/js';
import * as tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import jestPlugin from 'eslint-plugin-jest';

const tsPlugin = tseslint.plugin;

export default [
  // Configuration for source files
  ...tseslint.config({
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      sourceType: 'module',
      parserOptions: {
        project: ['./tsconfig.json'],
        ecmaVersion: 2022,
      },
      globals: {
        process: 'readonly',
        console: 'readonly',
      },
    },
    plugins: {
      '@stylistic': stylistic,
      prettier,
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      '@stylistic/indent': ['error', 2],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/quotes': ['error', 'single'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'no-redeclare': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/ban-types': 'off',
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          args: 'none',
          ignoreRestSiblings: true,
          caughtErrors: 'none',
        },
      ],
    },
    settings: {
      node: {
        tryExtensions: ['.ts', '.js', '.json', '.node'],
      },
    },
    env: {
      node: true,
      es2022: true,
    },
  }),
  // Configuration for test files
  ...tseslint.config({
    files: ['tests/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      sourceType: 'module',
      parserOptions: {
        project: ['./tsconfig.json'],
        ecmaVersion: 2022,
      },
      globals: {
        process: 'readonly',
        console: 'readonly',
      },
    },
    plugins: {
      '@stylistic': stylistic,
      prettier,
      jest: jestPlugin,
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      '@stylistic/indent': ['error', 2],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/quotes': ['error', 'single'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['off'],
      'no-unused-vars': 'off',
      'jest/expect-expect': [
        'error',
        {
          assertFunctionNames: ['expect', 'assertType'],
        },
      ],
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/valid-expect': 'error',
      'no-undef': 'off', // TypeScript handles this
      'jest/no-undef': 'off', // TypeScript handles this
    },
    settings: {
      node: {
        tryExtensions: ['.ts', '.js', '.json', '.node'],
      },
    },
    env: {
      node: true,
      es2022: true,
      jest: true,
    },
  }),
];
