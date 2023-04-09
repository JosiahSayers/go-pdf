/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    'prettier',
    '@remix-run/eslint-config',
    '@remix-run/eslint-config/node',
  ],
  plugins: ['prettier'],
  parserOptions: {
    parser: '@typescript-eslint/parser',
    project: './tsconfig.json'
  },
  rules: {
    'prettier/prettier': ['error'],
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    'react-hooks/exhaustive-deps': 'off',
    '@typescript-eslint/no-unused-vars': 'error'
  },
};
