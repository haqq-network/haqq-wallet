import React, {useCallback} from 'react';

import {
  BackupNotification,
  BottomPopupContainer,
} from '@app/components/bottom-popups';
import {useApp, useTypedNavigation, useTypedRoute} from '@app/hooks';

export const BackupNotificationScreen = () => {
  const {goBack, navigate} = useTypedNavigation();
  const {accountId} = useTypedRoute<'backupNotification'>().params;

  const app = useApp();

  const onClickBackup = useCallback(() => {
    if (accountId) {
      goBack();
      navigate('backup', {
        accountId,
      });
    }
  }, [goBack, navigate, accountId]);

  const onClickSkip = useCallback(() => {
    app.setSnoozeBackup();
    goBack();
  }, [app, goBack]);

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
