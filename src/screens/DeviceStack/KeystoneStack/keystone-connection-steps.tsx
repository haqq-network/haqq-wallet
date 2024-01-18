import React, {useCallback, useState} from 'react';

import {Platform} from 'react-native';
import {PERMISSIONS, RESULTS, check} from 'react-native-permissions';

import {KeystoneConnectionSteps} from '@app/components/keystone';
import {
  QRScannerTypeEnum,
  awaitForScanQr,
} from '@app/helpers/await-for-scan-qr';
import {useTypedNavigation} from '@app/hooks';
import {KeystoneStackRoutes} from '@app/route-types';
import {RemoteConfig} from '@app/services/remote-config';
import {openInAppBrowser} from '@app/utils';

const logger = Logger.create('KeystoneConnectionStepsScreen');

export const KeystoneConnectionStepsScreen = () => {
  const navigation = useTypedNavigation();
  const [syncInProgress, setSyncInProgress] = useState(false);

  const onPressSync = useCallback(async () => {
    try {
      if (syncInProgress) {
        return;
      }
      setSyncInProgress(true);
      const status = await check(
        Platform.select({
          android: PERMISSIONS.ANDROID.CAMERA,
          default: PERMISSIONS.IOS.CAMERA,
        }),
      );

      if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
        const qrCBORHex = await awaitForScanQr({
          variant: QRScannerTypeEnum.keystone,
          purpose: 'sync',
        });
        navigation.navigate(KeystoneStackRoutes.KeystoneAccounts, {
          qrCBORHex,
        });
      } else {
        navigation.navigate(KeystoneStackRoutes.KeystoneCameraPermission);
      }
    } catch (err) {
      logger.error(err);
    } finally {
      setSyncInProgress(false);
    }
  }, []);

  const onPressTutorial = useCallback(() => {
    openInAppBrowser(RemoteConfig.safeGet('keystone_tutorial_url'));
  }, []);

  return (
    <KeystoneConnectionSteps
      onPressSync={onPressSync}
      onPressTutorial={onPressTutorial}
      syncInProgress={syncInProgress}
    />
  );
};
