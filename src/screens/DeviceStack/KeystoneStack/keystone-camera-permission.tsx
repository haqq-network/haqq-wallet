import React, {useCallback, useState} from 'react';

import {Linking} from 'react-native';

import {KeystoneCameraPermission} from '@app/components/keystone/keystone-camera-permission';
import {
  QRScannerTypeEnum,
  awaitForScanQr,
} from '@app/helpers/await-for-scan-qr';
import {useTypedNavigation} from '@app/hooks';
import {KeystoneStackRoutes} from '@app/route-types';
import {requestCameraPermissions} from '@app/utils';

const logger = Logger.create('KeystoneCameraPermissionScreen');

export const KeystoneCameraPermissionScreen = () => {
  const navigation = useTypedNavigation();
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);

  const onPressContinue = useCallback(async () => {
    try {
      if (syncInProgress) {
        return;
      }
      setSyncInProgress(true);

      const result = await requestCameraPermissions();

      if (result) {
        const qrCBORHex = await awaitForScanQr({
          variant: QRScannerTypeEnum.keystone,
          purpose: 'sync',
        });
        navigation.navigate(KeystoneStackRoutes.KeystoneAccounts, {
          qrCBORHex,
        });
      } else {
        setIsPermissionDenied(true);
      }
    } catch (err) {
      logger.error(err);
    } finally {
      setSyncInProgress(false);
    }
  }, []);

  const onPressSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  return (
    <KeystoneCameraPermission
      syncInProgress={syncInProgress}
      isPermissionDenied={isPermissionDenied}
      onPressContinue={onPressContinue}
      onPressSettings={onPressSettings}
    />
  );
};
