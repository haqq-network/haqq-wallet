import {Platform} from 'react-native';

import {RemoteConfig} from '@app/services/remote-config';
import {getAppVersion} from '@app/services/version';

export enum VersionComparisonResult {
  Older = -1,
  Same = 0,
  Newer = 1,
}

export type Version = {
  major: number;
  minor: number;
  patch: number;
};

export function parseVersion(version: string): Version | null {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);

  if (!match) {
    return null;
  }

  const [major, minor, patch] = match.slice(1).map(Number);

  return {major, minor, patch};
}

export function compareVersions(
  current: string,
  compareWith: string,
): VersionComparisonResult {
  const currentParsed = parseVersion(current);
  const compareWithParsed = parseVersion(compareWith);

  if (!currentParsed || !compareWithParsed) {
    throw new Error('Invalid version format');
  }

  if (compareWithParsed.major > currentParsed.major) {
    return VersionComparisonResult.Newer;
  }

  if (compareWithParsed.major < currentParsed.major) {
    return VersionComparisonResult.Older;
  }

  if (compareWithParsed.minor > currentParsed.minor) {
    return VersionComparisonResult.Newer;
  }

  if (compareWithParsed.minor < currentParsed.minor) {
    return VersionComparisonResult.Older;
  }

  if (compareWithParsed.patch > currentParsed.patch) {
    return VersionComparisonResult.Newer;
  }

  if (compareWithParsed.patch < currentParsed.patch) {
    return VersionComparisonResult.Older;
  }

  return VersionComparisonResult.Same;
}

export function checkNeedUpdate() {
  try {
    const appVersion = getAppVersion();
    const remoteVersion = Platform.select({
      ios: RemoteConfig.get('ios_version'),
      android: RemoteConfig.get('android_version'),
    });
    const result = compareVersions(appVersion, remoteVersion!);
    return result === VersionComparisonResult.Newer;
  } catch (err) {
    Logger.captureException(err, 'checkNeedUpdate');
    return false;
  }
}
