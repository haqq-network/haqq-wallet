module.exports = {
  root: true,
  extends: '@react-native-community',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-native', 'import'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'sort-imports':
          [
            'error',
            {
              'ignoreCase': true,
              'ignoreDeclarationSort': true
            }
          ],
        '@typescript-eslint/no-shadow': ['error'],
        'no-shadow': 'off',
        'no-undef': 'off',
        'import/no-default-export': 'error',
        'react-native/no-unused-styles': 2,
        'react-native/split-platform-components': 'off',
        'react-native/no-inline-styles': 2,
        'react-native/no-color-literals': 2,
        'react-native/no-single-element-style-arrays': 2,
      },
    },
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
};
