import React, {memo, useCallback} from 'react';

import {
  BottomPopupContainer,
  NotificationPopup,
} from '@app/components/bottom-popups';
import {onBannerNotificationsSnooze} from '@app/event-actions/on-banner-notifications-snooze';
import {onBannerNotificationsTurnOn} from '@app/event-actions/on-banner-notifications-turn-on';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {HomeStackParamList, HomeStackRoutes} from '@app/screens/HomeStack';

export const PopupNotificationScreen = memo(() => {
  const route = useTypedRoute<
    HomeStackParamList,
    HomeStackRoutes.PopupNotification
  >();
  const {goBack} = useTypedNavigation<HomeStackParamList>();

  const onClickTurnOn = useCallback(
    async (close: () => void) => {
      close();
      goBack();
      await onBannerNotificationsTurnOn(route.params.bannerId);
    },
    [goBack, route.params.bannerId],
  );

  const onClickNotNow = useCallback(
    async (close: () => void) => {
      close();
      goBack();
      await onBannerNotificationsSnooze(route.params.bannerId);
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
});
