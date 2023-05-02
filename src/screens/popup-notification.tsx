import React, {useCallback} from 'react';

import {
  BottomPopupContainer,
  NotificationPopup,
} from '@app/components/bottom-popups';
import {onBannerNotificationsSnooze} from '@app/event-actions/on-banner-notifications-snooze';
import {onBannerNotificationsTurnOn} from '@app/event-actions/on-banner-notifications-turn-on';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const PopupNotificationScreen = () => {
  const route = useTypedRoute<'popupNotification'>();
  const {goBack} = useTypedNavigation();

  const onClickTurnOn = useCallback(
    async (close: () => void) => {
      await onBannerNotificationsTurnOn(route.params.bannerId);
      close();
      goBack();
    },
    [goBack, route.params.bannerId],
  );

  const onClickNotNow = useCallback(
    async (close: () => void) => {
      await onBannerNotificationsSnooze(route.params.bannerId);
      close();
      goBack();
    },
    [goBack, route.params.bannerId],
  );

  return (
    <BottomPopupContainer>
      {onClose => (
        <NotificationPopup
          onClickTurnOn={() => onClickTurnOn(onClose)}
          onClickNotNow={() => onClickNotNow(onClose)}
        />
      )}
    </BottomPopupContainer>
  );
};
