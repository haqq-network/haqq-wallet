import {getAppVersion} from '@app/services/version';

import {captureException} from './capture-exception';

export enum ComparisonResult {
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
): ComparisonResult {
  const currentParsed = parseVersion(current);
  const compareWithParsed = parseVersion(compareWith);

  if (!currentParsed || !compareWithParsed) {
    throw new Error('Invalid version format');
  }

  if (compareWithParsed.major > currentParsed.major) {
    return ComparisonResult.Newer;
  }

  if (compareWithParsed.major < currentParsed.major) {
    return ComparisonResult.Older;
  }

  if (compareWithParsed.minor > currentParsed.minor) {
    return ComparisonResult.Newer;
  }

  if (compareWithParsed.minor < currentParsed.minor) {
    return ComparisonResult.Older;
  }

  if (compareWithParsed.patch > currentParsed.patch) {
    return ComparisonResult.Newer;
  }

  if (compareWithParsed.patch < currentParsed.patch) {
    return ComparisonResult.Older;
  }

  return ComparisonResult.Same;
}

export function checkNeedUpdate() {
  try {
    const appVersion = getAppVersion();
    // TODO: get from remote config
    const remoteVersion = '1.4.6';
    const result = compareVersions(appVersion, remoteVersion);
    console.log('result', result === ComparisonResult.Newer);
    return result === ComparisonResult.Newer;
  } catch (err) {
    captureException(err, 'checkNeedUpdate');
    return false;
  }
}
