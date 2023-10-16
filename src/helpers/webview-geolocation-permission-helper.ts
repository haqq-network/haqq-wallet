import {Platform} from 'react-native';
import {
  PERMISSIONS,
  PermissionStatus,
  check,
  request,
} from 'react-native-permissions';

import {SystemDialog} from '@app/services/system-dialog';

const awaitForPermsissionStatus = async (
  permission: Promise<PermissionStatus>,
) => {
  switch (await permission) {
    case 'granted':
    case 'limited':
      return true;
    default:
      return false;
  }
};

/**
 * @returns true if all permissions are granted correctly
 */ export const enableGeoPermissions = async () => {
  try {
    const fn = Platform.select({
      ios: enableIOSGeolocationPermissions,
      android: enableAndroidGeolocationPermissions,
      default: () => Promise.resolve(false),
    });

    return await SystemDialog.getResult(fn);
  } catch (e) {
    Logger.error('🔴 geolocation-permission-helper:checkGeoPermissions:', e);
    return await checkGeoPermissions();
  }
};

/**
 * @returns true if all permissions are granted correctly
 */
export const checkGeoPermissions = async () => {
  try {
    const fn = Platform.select({
      ios: checkIOSGeolocationPermissions,
      android: checkAndroidGeolocationPermissions,
      default: () => Promise.resolve(false),
    });

    return await fn();
  } catch (e) {
    Logger.error('🔴 geolocation-permission-helper:checkGeoPermissions:', e);
  }
  return false;
};

const enableAndroidGeolocationPermissions = async () => {
  const isGranted = await checkAndroidGeolocationPermissions();

  if (isGranted) {
    return true;
  }

  return await awaitForPermsissionStatus(
    request(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION),
  );
};

const enableIOSGeolocationPermissions = async () => {
  const isGranted = await checkIOSGeolocationPermissions();

  if (isGranted) {
    return true;
  }

  return awaitForPermsissionStatus(
    request?.(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE),
  );
};

const checkAndroidGeolocationPermissions = () => {
  return awaitForPermsissionStatus(
    check(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION),
  );
};

const checkIOSGeolocationPermissions = () => {
  return awaitForPermsissionStatus(check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE));
};
