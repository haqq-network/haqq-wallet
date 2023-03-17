import React, {useCallback} from 'react';

import {ProviderMpcReactNative} from '@haqq/provider-mpc-react-native';

import {
  BackupMpcNotification,
  BottomPopupContainer,
} from '@app/components/bottom-popups';
import {Events} from '@app/events';
import {captureException, showModal} from '@app/helpers';
import {useApp, useTypedNavigation, useTypedRoute} from '@app/hooks';
import {Cloud} from '@app/services/cloud';
import {GoogleDrive} from '@app/services/google-drive';

export const BackupMpcNotificationScreen = () => {
  const {goBack} = useTypedNavigation();
  const {accountId} = useTypedRoute<'backupNotification'>().params;

  const app = useApp();

  const onPressBackupGoogle = useCallback(
    async (onDone: () => void) => {
      try {
        if (accountId) {
          const storage = new Cloud();

          const provider = new ProviderMpcReactNative({
            storage,
            account: accountId,
            getPassword: app.getPassword.bind(app),
          });

          const newStorage = new GoogleDrive();

          await provider.tryToSaveShareToStore(newStorage);
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
        />
      )}
    </BottomPopupContainer>
  );
};
