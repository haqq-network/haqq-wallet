import React, {useCallback} from 'react';

import {addMinutes} from 'date-fns';

import {
  BackupNotification,
  BottomPopupContainer,
} from '@app/components/bottom-popups';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {VariablesDate} from '@app/models/variables-date';
import {SNOOZE_WALLET_BACKUP_MINUTES} from '@app/variables/common';

export const BackupNotificationScreen = () => {
  const {goBack, navigate} = useTypedNavigation();
  const {accountId} = useTypedRoute<'backupNotification'>().params;

  const onClickBackup = useCallback(() => {
    if (accountId) {
      goBack();
      navigate('backup', {
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
          onClickBackup={() => onClose(onClickBackup)}
          onClickSkip={() => onClose(onClickSkip)}
        />
      )}
    </BottomPopupContainer>
  );
};
