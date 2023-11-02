import React, {memo, useCallback} from 'react';

import {addMinutes} from 'date-fns';

import {
  BackupNotification,
  BottomPopupContainer,
} from '@app/components/bottom-popups';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {VariablesDate} from '@app/models/variables-date';
import {HomeStackParamList, HomeStackRoutes} from '@app/screens/HomeStack';
import {SNOOZE_WALLET_BACKUP_MINUTES} from '@app/variables/common';

export const BackupNotificationScreen = memo(() => {
  const {goBack, navigate} = useTypedNavigation<HomeStackParamList>();
  const {accountId} = useTypedRoute<
    HomeStackParamList,
    HomeStackRoutes.BackupNotification
  >().params;

  const onClickBackup = useCallback(() => {
    if (accountId) {
      goBack();
      navigate(HomeStackRoutes.Backup, {
        accountId,
      });
    }
  }, [goBack, navigate, accountId]);

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
