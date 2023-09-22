import React, {useCallback} from 'react';

import {
  BottomPopupContainer,
  PopupNotificationNews,
} from '@app/components/bottom-popups';
import {onBannerNotificationsTopicSnooze} from '@app/event-actions/on-banner-notifications-topic-snooze';
import {onBannerNotificationsTopicSubscribe} from '@app/event-actions/on-banner-notifications-topic-subscribe';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {PushNotificationTopicsEnum} from '@app/services/push-notifications';

export const PopupNotificationNewsScreen = () => {
  const route = useTypedRoute<'popupNotificationNews'>();
  const {goBack} = useTypedNavigation();

  const onClickTurnOn = useCallback(
    async (close: () => void) => {
      await onBannerNotificationsTopicSubscribe(
        route.params.bannerId,
        PushNotificationTopicsEnum.news,
      );
      close();
      goBack();
    },
    [goBack, route.params.bannerId],
  );

  const onClickNotNow = useCallback(
    async (close: () => void) => {
      await onBannerNotificationsTopicSnooze(
        route.params.bannerId,
        PushNotificationTopicsEnum.news,
      );
      close();
      goBack();
    },
    [goBack, route.params.bannerId],
  );

  return (
    <BottomPopupContainer>
      {onClose => (
        <PopupNotificationNews
          onClickSubscribe={() => onClickTurnOn(onClose)}
          onClickNotNow={() => onClickNotNow(onClose)}
        />
      )}
    </BottomPopupContainer>
  );
};
