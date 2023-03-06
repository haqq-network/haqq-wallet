import React, {useCallback} from 'react';

import {
  BackupMpcNotification,
  BottomPopupContainer,
} from '@app/components/bottom-popups';
import {captureException, showModal} from '@app/helpers';
import {useApp, useTypedNavigation, useTypedRoute} from '@app/hooks';
import {GoogleDrive} from '@app/services/google-drive';
import {ProviderMpcReactNative} from '@app/services/provider-mpc';

export const BackupMpcNotificationScreen = () => {
  const {goBack} = useTypedNavigation();
  const {accountId} = useTypedRoute<'backupNotification'>().params;

  const app = useApp();

  const onClickBackup = useCallback(async () => {
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
        goBack();
      }
    } catch (e) {
      captureException(e, 'save mpc backup');
      showModal('transaction-error', {
        message: 'backup save error',
      });
    }
  }, [accountId, app, goBack]);

  const onClickSkip = useCallback(() => {
    app.setSnoozeBackup();
    goBack();
  }, [app, goBack]);

  return (
    <BottomPopupContainer>
      {onClose => (
        <BackupMpcNotification
          onClickBackup={() => onClose(onClickBackup)}
          onClickSkip={() => onClose(onClickSkip)}
        />
      )}
    </BottomPopupContainer>
  );
};
