import React, {useCallback} from 'react';

import {ProviderMpcReactNative} from '@haqq/provider-mpc-react-native';
import {addMinutes} from 'date-fns';

import {
  BackupMpcNotification,
  BottomPopupContainer,
} from '@app/components/bottom-popups';
import {Events} from '@app/events';
import {captureException, showModal} from '@app/helpers';
import {useApp, useTypedNavigation, useTypedRoute} from '@app/hooks';
import {VariablesDate} from '@app/models/variables-date';
import {Cloud} from '@app/services/cloud';
import {GoogleDrive} from '@app/services/google-drive';
import {SNOOZE_WALLET_BACKUP_MINUTES} from '@app/variables/common';

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
      VariablesDate.set(
        'appBackupSnooze',
        addMinutes(new Date(), SNOOZE_WALLET_BACKUP_MINUTES),
      );

      goBack();
      onDone();

      return Promise.resolve();
    },
    [goBack],
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
