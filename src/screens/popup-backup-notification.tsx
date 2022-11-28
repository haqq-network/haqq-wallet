import React, {useCallback} from 'react';

import {BottomPopupContainer} from '@app/components/bottom-popups';
import {BackupNotification} from '@app/components/bottom-popups';
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
