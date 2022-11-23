import React, {useCallback} from 'react';

import {TrackActivity} from '@app/components/track-activity';
import {NotificationPopupContainer} from '@app/components/ui';
import {useTypedNavigation} from '@app/hooks';

export const TrackActivityScreen = () => {
  const {goBack} = useTypedNavigation();

  const onClickContinue = useCallback(() => {
    goBack();
    console.log('onClickContinue');
  }, [goBack]);

  return (
    <NotificationPopupContainer>
      {onClose => <TrackActivity onClick={() => onClose(onClickContinue)} />}
    </NotificationPopupContainer>
  );
};
