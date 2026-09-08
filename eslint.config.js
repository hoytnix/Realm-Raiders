import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        React: 'readonly'
      }
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }]
    }
  },
  {
    ignores: ['dist/**', 'node_modules/**', '.gemini/**']
  }
];
