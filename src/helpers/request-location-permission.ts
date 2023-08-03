import {Permission, PermissionsAndroid, Platform} from 'react-native';

import {SystemDialog} from '@app/services/system-dialog';

const {PERMISSIONS, RESULTS} = PermissionsAndroid;

/**
 * https://developer.android.com/guide/topics/connectivity/bluetooth/permissions#declare
 */
const locationPermission: Permission | undefined =
  Platform.OS === 'android'
    ? Platform.Version <= 28
      ? PERMISSIONS.ACCESS_COARSE_LOCATION
      : PERMISSIONS.ACCESS_FINE_LOCATION
    : undefined;

export type LocationRequestResult = {
  granted: boolean;
  status: (typeof RESULTS)[number];
};

export async function requestLocationPermission(): Promise<LocationRequestResult> {
  if (!locationPermission) {
    return {granted: true, status: RESULTS.GRANTED};
  }

  const status = await SystemDialog.permissionsAndroidRequest(
    locationPermission,
  );

  Logger.log(
    'requestLocationPermission status: ',
    status,
    'granded: ',
    status === RESULTS.GRANTED,
  );

  return {
    granted: status === RESULTS.GRANTED,
    status,
  };
}
