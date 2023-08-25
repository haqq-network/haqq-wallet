module.exports = function (api) {
  api.cache(true);
  const currentEnv = process.env.BABEL_ENV || process.env.NODE_ENV || 'development';
  const isTestEnv = !!process.env.JEST_WORKER_ID;

  const presets = [
    'module:metro-react-native-babel-preset',
    '@babel/preset-typescript'
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
  ];

  if (currentEnv === 'production' && !isTestEnv) {
    plugins.push(["react-remove-properties", {"properties": ["testID"]}]);
  }

  return {
    presets,
    plugins
  };
}