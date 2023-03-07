import React, {useCallback} from 'react';

import {
  BackupMpcNotification,
  BottomPopupContainer,
} from '@app/components/bottom-popups';
import {Events} from '@app/events';
import {captureException, showModal} from '@app/helpers';
import {useApp, useTypedNavigation, useTypedRoute} from '@app/hooks';
import {GoogleDrive} from '@app/services/google-drive';
import {ProviderMpcReactNative} from '@app/services/provider-mpc';

export const BackupMpcNotificationScreen = () => {
  const {goBack} = useTypedNavigation();
  const {accountId} = useTypedRoute<'backupNotification'>().params;

  const app = useApp();

  const onClickBackup = useCallback(
    async (onDone: () => void) => {
      try {
        if (accountId) {
          const storage = await GoogleDrive.initialize();

          const provider = new ProviderMpcReactNative({
            storage,
            account: accountId,
            getPassword: app.getPassword.bind(app),
          });

          await provider.tryToSaveShare();
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

  const onClickCheck = useCallback(
    async (onDone: () => void) => {
      try {
        const storage = await GoogleDrive.initialize();
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
          onClickBackup={() => onClickBackup(onClose)}
          onClickSkip={() => onClickSkip(onClose)}
          onClickCheck={() => onClickCheck(onClose)}
        />
      )}
    </BottomPopupContainer>
  );
};
