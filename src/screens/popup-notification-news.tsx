import React, {memo, useCallback} from 'react';

import {
  BottomPopupContainer,
  PopupNotificationNews,
} from '@app/components/bottom-popups';
import {onBannerNotificationsTopicSnooze} from '@app/event-actions/on-banner-notifications-topic-snooze';
import {onBannerNotificationsTopicSubscribe} from '@app/event-actions/on-banner-notifications-topic-subscribe';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {HomeStackParamList, HomeStackRoutes} from '@app/screens/HomeStack';

export const PopupNotificationNewsScreen = memo(() => {
  const route = useTypedRoute<
    HomeStackParamList,
    HomeStackRoutes.PopupNotificationNews
  >();
  const {goBack} = useTypedNavigation<HomeStackParamList>();

  const onClickTurnOn = useCallback(
    async (close: () => void) => {
      await onBannerNotificationsTopicSubscribe(route.params.bannerId, 'news');
      close();
      goBack();
    },
    [goBack, route.params.bannerId],
  );

  const onClickNotNow = useCallback(
    async (close: () => void) => {
      await onBannerNotificationsTopicSnooze(route.params.bannerId, 'news');
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
});
