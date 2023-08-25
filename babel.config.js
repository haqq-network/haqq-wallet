const currentEnv = process.env.BABEL_ENV || process.env.NODE_ENV || 'development';
const isTestEnv = !!process.env.JEST_WORKER_ID;

const config = {
  presets: [
    'module:metro-react-native-babel-preset',
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@app': './src',
          '@assets': './assets',
        },
      },
    ],
    [
      'module:react-native-dotenv',
      {
        envName: 'APP_ENV',
        moduleName: '@env',
        path: '.env',
        safe: false,
        allowUndefined: true,
        verbose: false,
      },
    ],
    'react-native-reanimated/plugin',
  ],
};

if (currentEnv === 'production' && !isTestEnv) {
  config.env.production = {
     plugins: [
        ["react-remove-properties", {"properties": ["testID"]}]
      ]
  }
}

module.exports = config;