import React, {useCallback} from 'react';

import {BackupNotification} from '@app/components/backup-notification';
import {NotificationPopupContainer} from '@app/components/ui';
import {useApp, useTypedNavigation, useTypedRoute} from '@app/hooks';

export const BackupNotificationScreen = () => {
  const {goBack, navigate} = useTypedNavigation();
  const {address} = useTypedRoute<'backupNotification'>().params;

  const app = useApp();

  const onClickBackup = useCallback(() => {
    if (address) {
      goBack();
      navigate('backup', {
        address,
      });
    }
  }, [goBack, navigate, address]);

  const onClickSkip = useCallback(() => {
    app.setSnoozeBackup();
    goBack();
  }, [app, goBack]);

  return (
    <NotificationPopupContainer>
      {onClose => (
        <BackupNotification
          onClickBackup={() => onClose(onClickBackup)}
          onClickSkip={() => onClose(onClickSkip)}
        />
      )}
    </NotificationPopupContainer>
  );
};
