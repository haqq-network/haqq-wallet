/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: true,
        inlineRequires: true,
      },
    }),
    minifierPath: 'metro-minify-terser',
    // plugins: ['@babel/plugin-proposal-numeric-separator'],
  },
  // resolver: {
  //   extraNodeModules: {
  //     crypto: require.resolve('react-native-crypto'),
  //   },
  // },
};
