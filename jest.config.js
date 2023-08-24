module.exports = {
  preset: 'react-native',
  rootDir: '.',
  testTimeout: 120000,
  maxWorkers: 1,
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  transformIgnorePatterns: ["node_modules/(?!(react-native|@haqq|@react-native)/)"],
};
