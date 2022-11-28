import React, {useCallback} from 'react';

import {
  BottomPopupContainer,
  NotificationPopup,
} from '@app/components/bottom-popups';
import {useTypedNavigation} from '@app/hooks';

export const NotificationPopupScreen = () => {
  const {goBack} = useTypedNavigation();

  const onClickTurnOn = useCallback(() => {
    goBack();
  }, [goBack]);

  return (
    <BottomPopupContainer>
      {onClose => (
        <NotificationPopup
          onClickTurnOn={() => onClose(onClickTurnOn)}
          onClickNotNow={() => onClose(goBack)}
        />
      )}
    </BottomPopupContainer>
  );
};
