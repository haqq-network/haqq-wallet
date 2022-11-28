import React, {useCallback} from 'react';

import {
  BottomPopupContainer,
  TrackActivity,
} from '@app/components/bottom-popups';
import {useTypedNavigation} from '@app/hooks';

export const TrackActivityScreen = () => {
  const {goBack} = useTypedNavigation();

  const onClickContinue = useCallback(() => {
    goBack();
  }, [goBack]);

  return (
    <BottomPopupContainer>
      {onClose => <TrackActivity onClick={() => onClose(onClickContinue)} />}
    </BottomPopupContainer>
  );
};
