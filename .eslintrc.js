module.exports = {
  root: true,
  extends: '@react-native-community',
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'react',
    'react-native',
    'import',
    'prettier',
    'jest',
  ],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'no-console': 'error',
        'import/order': [
          'error',
          {
            groups: ['builtin', 'external', 'internal', 'sibling'],
            pathGroups: [
              {
                pattern: 'react',
                group: 'builtin',
                position: 'before',
              },
              {
                pattern: '@app/**',
                group: 'external',
                position: 'after',
              },
            ],
            pathGroupsExcludedImportTypes: ['react'],
            'newlines-between': 'always',
            alphabetize: {
              order: 'asc',
              caseInsensitive: true,
            },
          },
        ],
        'sort-imports': [
          'error',
          {
            ignoreDeclarationSort: true,
          },
        ],
        '@typescript-eslint/no-shadow': ['error'],
        'no-shadow': 'off',
        'no-undef': 'off',
        'import/no-default-export': 'error',
        'react/react-in-jsx-scope': 0,
        'react-native/no-unused-styles': 2,
        'react-native/split-platform-components': 'off',
        'react-native/no-inline-styles': 2,
        'react-native/no-color-literals': 2,
        'react-native/no-single-element-style-arrays': 2,
        'react-hooks/exhaustive-deps': 'off'
      },
    },
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  globals: {
    Logger: 'readonly',
  },
};
