import React, {memo, useCallback} from 'react';

import {
  BottomPopupContainer,
  NotificationPopup,
} from '@app/components/bottom-popups';
import {onBannerNotificationsSnooze} from '@app/event-actions/on-banner-notifications-snooze';
import {onBannerNotificationsTurnOn} from '@app/event-actions/on-banner-notifications-turn-on';
import {useTypedNavigation} from '@app/hooks';
import {HomeStackParamList} from '@app/route-types';
import {PopupNotificationBannerTypes} from '@app/types';
import {sleep} from '@app/utils';
import {ANIMATION_DURATION} from '@app/variables/common';

type Props = {
  onCloseProp: () => void;
};

export const PopupNotificationScreen = memo(({onCloseProp}: Props) => {
  const {goBack} = useTypedNavigation<HomeStackParamList>();

  const onClickTurnOn = useCallback(
    async (close: () => void) => {
      close();
      await sleep(ANIMATION_DURATION);
      onCloseProp();
      goBack();
      await onBannerNotificationsTurnOn(
        PopupNotificationBannerTypes.notification,
      );
    },
    [goBack],
  );

  const onClickNotNow = useCallback(
    async (close: () => void) => {
      close();
      await sleep(ANIMATION_DURATION);
      onCloseProp();
      goBack();
      await onBannerNotificationsSnooze(
        PopupNotificationBannerTypes.notification,
      );
    },
    [goBack],
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
