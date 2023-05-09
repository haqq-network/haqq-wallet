import React, {useCallback} from 'react';

import {
  BottomPopupContainer,
  TrackActivity,
} from '@app/components/bottom-popups';
import {onBannerAnalyticsEnable} from '@app/event-actions/on-banner-analytics-enable';
import {onBannerAnalyticsSnooze} from '@app/event-actions/on-banner-analytics-snooze';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const PopupTrackActivityScreen = () => {
  const route = useTypedRoute<'popupTrackActivity'>();
  const {goBack} = useTypedNavigation();

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
};
