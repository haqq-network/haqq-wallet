const {FOR_DETOX} = require('dotenv').config();
const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const blacklist = require('metro-config/src/defaults/exclusionList');

const IS_DETOX_RUNNIG = FOR_DETOX || !!process.env.FOR_DETOX || !!process.env.JEST_WORKER_ID;

// used for local development
const devpkg = require('./.devpkg.js');

const defaultModuleResolver =
  getDefaultConfig(__dirname).resolver.resolveRequest;
  
const defaultSourceExts = require('metro-config/src/defaults/defaults').sourceExts;

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
    sourceExts: IS_DETOX_RUNNIG
      ? ['.mock.ts', '.mock.js', ...defaultSourceExts]
      : defaultSourceExts,
    extraNodeModules: {
      ...require('node-libs-react-native'),
      ...devpkg.extraNodeModules,
    },
    blacklistRE: blacklist([
      /ios\/build\/SourcePackages\/checkouts\/grpc-ios\/native_src\/.*/,
    ]),
    nodeModulesPaths: [
     ...devpkg.nodeModulesPaths,
    ].filter(Boolean),
    resolveRequest: (context, moduleName, platform) => {
      try {
       if(devpkg.extraNodeModules[moduleName]) {
        return {
          filePath: devpkg.extraNodeModules[moduleName],
          type: 'sourceFile',
        };
       }
      } catch (error) {}

      try {
        return context.resolveRequest(context, moduleName, platform);
      } catch (error) {
        console.warn(
          '\n1️⃣ context.resolveRequest cannot resolve: ',
          moduleName,
        );
      }

      try {
        const resolution = require.resolve(moduleName, {
          paths: [
            path.dirname(context.originModulePath),
            ...config.resolver.nodeModulesPaths,
          ],
        });

        if (path.isAbsolute(resolution)) {
          return {
            filePath: resolution,
            type: 'sourceFile',
          };
        }
      } catch (error) {
        console.warn('\n2️⃣ require.resolve cannot resolve: ', moduleName);
      }

      try {
        return defaultModuleResolver(context, moduleName, platform);
      } catch (error) {
        console.warn('\n3️⃣ defaultModuleResolver cannot resolve: ', moduleName);
      }

      try {
        return {
          filePath: require.resolve(moduleName),
          type: 'sourceFile',
        };
      } catch (error) {
        console.warn('\n4️⃣ require.resolve cannot resolve: ', moduleName);
      }

      try {
        const resolution = getDefaultConfig(require.resolve(moduleName))
          .resolver?.resolveRequest;
        return resolution(context, moduleName, platform);
      } catch (error) {
        console.warn('\n5️⃣ getDefaultConfig cannot resolve: ', moduleName);
      }
    },
  },
  watchFolders: [
    ...devpkg.watchFolders,
  ].filter(Boolean),
  watcher: {
    healthCheck: {
      enabled: true,
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
