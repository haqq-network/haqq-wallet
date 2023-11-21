import React, {memo, useCallback} from 'react';

import {addMinutes} from 'date-fns';

import {
  BackupNotification,
  BottomPopupContainer,
} from '@app/components/bottom-popups';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {VariablesDate} from '@app/models/variables-date';
import {HomeStackParamList, HomeStackRoutes} from '@app/route-types';
import {SNOOZE_WALLET_BACKUP_MINUTES} from '@app/variables/common';

export const BackupNotificationScreen = memo(() => {
  const {goBack, navigate} = useTypedNavigation<HomeStackParamList>();
  const {wallet} = useTypedRoute<
    HomeStackParamList,
    HomeStackRoutes.BackupNotification
  >().params;

  const onClickBackup = useCallback(() => {
    if (wallet) {
      goBack();
      navigate(HomeStackRoutes.Backup, {
        wallet,
      });
    }
  }, [goBack, navigate, wallet]);

  const onClickSkip = useCallback(() => {
    VariablesDate.set(
      'appBackupSnooze',
      addMinutes(new Date(), SNOOZE_WALLET_BACKUP_MINUTES),
    );
    goBack();
  }, [goBack]);

  return (
    <BottomPopupContainer>
      {onClose => (
        <BackupNotification
          testID="backup_notification"
          onClickBackup={() => onClose(onClickBackup)}
          onClickSkip={() => onClose(onClickSkip)}
        />
      )}
    </BottomPopupContainer>
  );
});
