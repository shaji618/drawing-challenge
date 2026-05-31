import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import preferArrowFunctions from 'eslint-plugin-prefer-arrow-functions';

export default defineConfig([
  {
    files: ['**/*.{js,ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.strict,
      ...tseslint.configs.stylistic
    ],
    rules: {
      indent: ['error', 4],
      semi: ['error', 'always'],
      quotes: ['error', 'single', { "avoidEscape": true }],
      "@typescript-eslint/explicit-function-return-type": "error"
    }
  }
]);