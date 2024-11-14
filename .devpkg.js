const path = require('path');
const fs = require('fs');
const config = require('./.devpkg.json');

const extraNodeModules = {};
const watchFolders = [];
const nodeModulesPaths = [];

if (config.enabled) {
  Object.entries(config.packages).forEach(([pkgName, pkgConfig]) => {
    const pkgPath = pkgConfig.path;
    const useDevEntryPoint = pkgConfig.useDevEntryPoint ?? false;
    const packageJsonPath = path.resolve(pkgPath, 'package.json');
    const packageJson = require(packageJsonPath);

    let entryPoint = '';
    if (useDevEntryPoint && packageJson.devEntryPoint) {
      entryPoint = packageJson.devEntryPoint;
    } else if (packageJson.main) {
      entryPoint = packageJson.main;
    }

    if (entryPoint) {
      const fullEntryPath = path.resolve(__dirname, pkgPath, entryPoint);
      if (fs.existsSync(fullEntryPath)) {
        extraNodeModules[pkgName] = fullEntryPath;
        const resolvedPkgPath = path.resolve(__dirname, pkgPath);
        watchFolders.push(resolvedPkgPath);
        nodeModulesPaths.push(resolvedPkgPath);

        console.log(
          '\x1b[32m%s\x1b[0m',
          `✅ [devpkg] ${pkgName} -> ${extraNodeModules[pkgName]}`,
        );
        console.log('\x1b[34m%s\x1b[0m', `📝 ${packageJson.description}`);
      } else {
        console.error(
          '\x1b[31m%s\x1b[0m',
          `❌ [devpkg] Entry point not found for ${pkgName}: ${fullEntryPath}`,
        );
      }
    } else {
      console.error(
        '\x1b[31m%s\x1b[0m',
        `❌ [devpkg] No entry point specified for ${pkgName}`,
      );
    }
  });
}

module.exports = {
  extraNodeModules,
  watchFolders,
  nodeModulesPaths,
};
