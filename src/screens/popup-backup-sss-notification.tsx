import React, {memo, useCallback} from 'react';

import {ProviderSSSBase} from '@haqq/rn-wallet-providers';
import {addMinutes} from 'date-fns';

import {
  BackupSssNotification,
  BottomPopupContainer,
} from '@app/components/bottom-popups';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {showModal} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {VariablesDate} from '@app/models/variables-date';
import {HomeStackParamList, HomeStackRoutes} from '@app/route-types';
import {Cloud} from '@app/services/cloud';
import {GoogleDrive} from '@app/services/google-drive';
import {ModalType} from '@app/types';
import {SNOOZE_WALLET_BACKUP_MINUTES} from '@app/variables/common';

export const BackupSssNotificationScreen = memo(() => {
  const {goBack} = useTypedNavigation<HomeStackParamList>();
  const {wallet} = useTypedRoute<
    HomeStackParamList,
    HomeStackRoutes.BackupNotification
  >().params;

  const onPressBackupGoogle = useCallback(
    async (onDone: () => void) => {
      try {
        if (wallet.accountId) {
          const storage = new Cloud();

          const provider = new ProviderSSSBase({
            storage,
            account: wallet.accountId,
            getPassword: app.getPassword.bind(app),
          });

          const newStorage = new GoogleDrive();

          await provider.tryToSaveShareToStore(newStorage);
          app.emit(Events.onWalletSssSaved, provider.getIdentifier());
          goBack();
          onDone();
        }
      } catch (e) {
        Logger.captureException(e, 'save sss backup');
        showModal(ModalType.transactionError, {
          message: 'backup save error',
        });
      }
    },
    [wallet, goBack],
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
});
