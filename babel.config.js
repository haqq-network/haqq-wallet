const {FOR_DETOX} = require('dotenv').config();

const IS_DETOX_RUNNIG = FOR_DETOX || !!process.env.FOR_DETOX || !!process.env.JEST_WORKER_ID;

module.exports = function (api) {
  api.cache(true);
  const currentEnv =
    process.env.BABEL_ENV || process.env.NODE_ENV || 'development';
  const isTestEnv =
    (!!process.env.SDKROOT &&
      process.env.SDKROOT.includes('iPhoneSimulator')) || IS_DETOX_RUNNIG;

  const presets = [
    'module:@react-native/babel-preset',
    '@babel/preset-typescript',
  ];
  const plugins = [
    'transform-inline-environment-variables',
    [
      'module-resolver',
      {
        alias: {
          '@app': './src',
          '@assets': './assets',
          '@override': './src/overrides'
        },
      },
    ],
    'react-native-reanimated/plugin'
  ];

  if (currentEnv === 'production' && !isTestEnv) {
    plugins.push(['react-remove-properties', {properties: ['testID']}]);
  }

  return {
    presets,
    plugins,
    overrides: [
      {
        // Fix for "Class private methods are not enabled" after TronWeb installation.
        // If enable `@babel/plugin-transform-private-methods` globally react-native app crashed:
        // ERROR  TypeError: Cannot read property 'getItem' of FlatList
        test: /node_modules[\\/](more-problematic-package-names|tronweb)[\\/].*\.(js|ts|tsx)$/,
        plugins: [
          ['@babel/plugin-proposal-class-properties', {loose: true}],
          ['@babel/plugin-proposal-private-methods', {loose: true}],
          ['@babel/plugin-proposal-private-property-in-object', {loose: true}],
        ],
      },
    ],
  };
};
