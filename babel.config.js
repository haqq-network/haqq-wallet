module.exports = function (api) {
  api.cache(true);
  const currentEnv =
    process.env.BABEL_ENV || process.env.NODE_ENV || 'development';
  const isTestEnv = (!!process.env.SDKROOT && process.env.SDKROOT.includes("iPhoneSimulator") || !!process.env.FOR_DETOX);

  const presets = [
    'module:metro-react-native-babel-preset',
    '@babel/preset-typescript',
  ];
  const plugins = [
    [
      'module-resolver',
      {
        alias: {
          '@app': './src',
          '@assets': './assets',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ];

  if (currentEnv === 'production' && !isTestEnv) {
    plugins.push(['react-remove-properties', {properties: ['testID']}]);
  }

  return {
    presets,
    plugins,
  };
};
