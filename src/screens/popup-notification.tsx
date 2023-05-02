import React, {useCallback} from 'react';

import {
  BottomPopupContainer,
  NotificationPopup,
} from '@app/components/bottom-popups';
import {onBannerNotificationTopicCreate} from '@app/event-actions/on-banner-notification-topic-create';
import {onBannerNotificationsSnooze} from '@app/event-actions/on-banner-notifications-snooze';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {Banner} from '@app/models/banner';
import {PushNotifications} from '@app/services/push-notifications';

export const PopupNotificationScreen = () => {
  const route = useTypedRoute<'notificationPopup'>();
  const {goBack} = useTypedNavigation();

  const onClickTurnOn = useCallback(
    async (close: () => void) => {
      await PushNotifications.instance.requestPermissions();

      Banner.remove(route.params.bannerId);

      await onBannerNotificationTopicCreate('news');
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
