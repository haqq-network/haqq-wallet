import React, {memo, useCallback} from 'react';

import {
  BottomPopupContainer,
  TrackActivity,
} from '@app/components/bottom-popups';
import {onBannerAnalyticsEnable} from '@app/event-actions/on-banner-analytics-enable';
import {onBannerAnalyticsSnooze} from '@app/event-actions/on-banner-analytics-snooze';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {HomeStackParamList, HomeStackRoutes} from '@app/screens/HomeStack';

export const PopupTrackActivityScreen = memo(() => {
  const route = useTypedRoute<
    HomeStackParamList,
    HomeStackRoutes.PopupTrackActivity
  >();
  const {goBack} = useTypedNavigation<HomeStackParamList>();

  const onClickContinue = useCallback(
    async (close: () => void) => {
      await onBannerAnalyticsEnable(route.params.bannerId);
      close();
      goBack();
    },
    [goBack, route.params.bannerId],
  );

  const onClickNotNow = useCallback(
    async (close: () => void) => {
      await onBannerAnalyticsSnooze(route.params.bannerId);
      close();
      goBack();
    },
    [goBack, route.params.bannerId],
  );

  return (
    <BottomPopupContainer>
      {onClose => (
        <TrackActivity
          onClickContinue={() => onClickContinue(onClose)}
          onClickNotNow={() => onClickNotNow(onClose)}
        />
      )}
    </BottomPopupContainer>
  );
});
