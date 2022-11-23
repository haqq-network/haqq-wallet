import React, {useCallback} from 'react';

import {NotificationPopup} from '@app/components/notification-popup';
import {NotificationPopupContainer} from '@app/components/ui';
import {useTypedNavigation} from '@app/hooks';

export const NotificationPopupScreen = () => {
  const {goBack} = useTypedNavigation();

  const onClickTurnOn = useCallback(() => {
    goBack();
    console.log('onClickTurnOn');
  }, [goBack]);

  const onClickNotNow = useCallback(() => {
    goBack();
  }, [goBack]);

  return (
    <NotificationPopupContainer>
      {onClose => (
        <NotificationPopup
          onClickTurnOn={() => onClose(onClickTurnOn)}
          onClickNotNow={() => onClose(onClickNotNow)}
        />
      )}
    </NotificationPopupContainer>
  );
};
