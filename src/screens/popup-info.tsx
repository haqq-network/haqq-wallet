import React, {memo} from 'react';

import {BottomPopupContainer, InfoPopup} from '@app/components/bottom-popups';
import {ModalType, Modals} from '@app/types';

export const PopupInfoScreen = memo((props: Modals[ModalType.info]) => {
  return (
    <BottomPopupContainer>
      {() => <InfoPopup {...props} />}
    </BottomPopupContainer>
  );
});
