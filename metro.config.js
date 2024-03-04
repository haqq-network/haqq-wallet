require('dotenv').config();
const path = require("path");
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const blacklist = require('metro-config/src/defaults/exclusionList');

const defaultModuleResolver = getDefaultConfig(__dirname).resolver.resolveRequest;

const config = {
  resetCache: true,
  stickyWorkers: false,
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
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
      // process.env.PROVIDER_BASE_PACKAGE,
      // process.env.PROVIDER_HOT_PACKAGE,
      // process.env.ENCRYPTION_RN_PACKAGE,
      // process.env.PROVIDER_WEB3_UTILS,
      // process.env.PROVIDER_LEDGER_RN_PACKAGE,
    ].filter(Boolean),
    resolveRequest: (context, moduleName, platform) => {
      try {
        return context.resolveRequest(context, moduleName, platform);
      } catch (error) {
        console.warn('\n1️⃣ context.resolveRequest cannot resolve: ', moduleName);
      }

      try {
        const resolution = require.resolve(moduleName, {
          paths: [path.dirname(context.originModulePath), ...config.resolver.nodeModulesPaths],
        });

        if (path.isAbsolute(resolution)){
          return {
            filePath: resolution,
            type: "sourceFile",
          };
        } 
      } catch(error) {
        console.warn('\n2️⃣ require.resolve cannot resolve: ', moduleName);
      }

      return defaultModuleResolver(context, moduleName, platform);
    },
  },
  watchFolders: [
    // process.env.PROVIDER_BASE_PACKAGE,
    // process.env.PROVIDER_HOT_PACKAGE,
    // process.env.ENCRYPTION_RN_PACKAGE,
    // process.env.PROVIDER_WEB3_UTILS,
    // process.env.PROVIDER_LEDGER_RN_PACKAGE,
  ].filter(Boolean),
  watcher: {
    healthCheck: {
      enabled: true,
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
