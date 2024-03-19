module.exports = {
  preset: 'react-native',
  rootDir: '.',
  testTimeout: 120000,
  maxWorkers: 1,
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/$1',
    '^@env$': 'react-native-config',
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@haqq|@react-native)/)',
  ],
  setupFilesAfterEnv: ['./__tests__/init.ts'],
};
