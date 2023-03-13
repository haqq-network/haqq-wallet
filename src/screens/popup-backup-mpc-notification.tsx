import React, {useCallback} from 'react';

import {ProviderMpcReactNative} from '@haqq/provider-mpc-react-native';

import {
  BackupMpcNotification,
  BottomPopupContainer,
} from '@app/components/bottom-popups';
import {Events} from '@app/events';
import {captureException, showModal} from '@app/helpers';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {useApp, useTypedNavigation, useTypedRoute} from '@app/hooks';
import {GoogleDrive} from '@app/services/google-drive';

export const BackupMpcNotificationScreen = () => {
  const {goBack} = useTypedNavigation();
  const {accountId} = useTypedRoute<'backupNotification'>().params;

  const app = useApp();

  const onPressBackupGoogle = useCallback(
    async (onDone: () => void) => {
      try {
        if (accountId) {
          const storage = await getProviderStorage(accountId);

          const provider = new ProviderMpcReactNative({
            storage,
            account: accountId,
            getPassword: app.getPassword.bind(app),
          });

          const newStorage = new GoogleDrive();

          await provider.tryToSaveShareToStore(newStorage);
          app.isGoogleSignedIn = true;
          app.emit(Events.onWalletMpcSaved, provider.getIdentifier());
          goBack();
          onDone();
        }
      } catch (e) {
        captureException(e, 'save mpc backup');
        showModal('transaction-error', {
          message: 'backup save error',
        });
      }
    },
    [accountId, app, goBack],
  );

  const onClickCheckGoogle = useCallback(
    async (onDone: () => void) => {
      try {
        const storage = new GoogleDrive();
        app.isGoogleSignedIn = true;
        const provider = new ProviderMpcReactNative({
          storage,
          account: accountId,
          getPassword: app.getPassword.bind(app),
        });

        const exists = await provider.isShareSaved();

        if (exists) {
          app.emit(Events.onWalletMpcSaved, provider.getIdentifier());
          goBack();
          onDone();
        }
      } catch (e) {
        captureException(e, 'check mpc backup');
        showModal('transaction-error', {
          message: 'something wrong',
        });
      }
    },
    [accountId, app, goBack],
  );

  const onClickSkip = useCallback(
    (onDone: () => void) => {
      app.setSnoozeBackup();
      goBack();
      onDone();

      return Promise.resolve();
    },
    [app, goBack],
  );

  return (
    <BottomPopupContainer>
      {onClose => (
        <BackupMpcNotification
          onClickBackup={() => onPressBackupGoogle(onClose)}
          onClickSkip={() => onClickSkip(onClose)}
          onClickCheck={() => onClickCheckGoogle(onClose)}
        />
      )}
    </BottomPopupContainer>
  );
};
