import React, {useCallback} from 'react';

import {ProviderSSSReactNative} from '@haqq/provider-sss-react-native';
import {addMinutes} from 'date-fns';

import {BottomPopupContainer} from '@app/components/bottom-popups';
import {BackupSssNotification} from '@app/components/bottom-popups';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {captureException, showModal} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {VariablesDate} from '@app/models/variables-date';
import {Cloud} from '@app/services/cloud';
import {GoogleDrive} from '@app/services/google-drive';
import {SNOOZE_WALLET_BACKUP_MINUTES} from '@app/variables/common';

export const BackupSssNotificationScreen = () => {
  const {goBack} = useTypedNavigation();
  const {accountId} = useTypedRoute<'backupNotification'>().params;

  const onPressBackupGoogle = useCallback(
    async (onDone: () => void) => {
      try {
        if (accountId) {
          const storage = new Cloud();

          const provider = new ProviderSSSReactNative({
            storage,
            account: accountId,
            getPassword: app.getPassword.bind(app),
          });

          const newStorage = new GoogleDrive();

          await provider.tryToSaveShareToStore(newStorage);
          app.emit(Events.onWalletSssSaved, provider.getIdentifier());
          goBack();
          onDone();
        }
      } catch (e) {
        captureException(e, 'save sss backup');
        showModal('transactionError', {
          message: 'backup save error',
        });
      }
    },
    [accountId, goBack],
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
        <BackupSssNotification
          onClickBackup={() => onPressBackupGoogle(onClose)}
          onClickSkip={() => onClickSkip(onClose)}
        />
      )}
    </BottomPopupContainer>
  );
};
