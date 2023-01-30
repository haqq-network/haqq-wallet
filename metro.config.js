/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const blacklist = require('metro-config/src/defaults/exclusionList');
require('dotenv').config();

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
  resolver: {
    blacklistRE: blacklist([
      /ios\/build\/SourcePackages\/checkouts\/grpc-ios\/native_src\/.*/,
    ]),
    nodeModulesPaths: [
      process.env.PROVIDER_BASE_PACKAGE,
      process.env.ENCRYPTION_RN_PACKAGE,
      process.env.PROVIDER_WEB3_UTILS,
      // process.env.PROVIDER_LEDGER_RN_PACKAGE,
    ].filter(Boolean),
  },
  watchFolders: [
    process.env.PROVIDER_BASE_PACKAGE,
    process.env.ENCRYPTION_RN_PACKAGE,
    process.env.PROVIDER_WEB3_UTILS,
    // process.env.PROVIDER_LEDGER_RN_PACKAGE,
  ].filter(Boolean),
};
