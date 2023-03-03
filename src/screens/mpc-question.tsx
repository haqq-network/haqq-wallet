import React, {useCallback} from 'react';

import {Button, ButtonVariant, PopupContainer} from '@app/components/ui';

export const MpcQuestionScreen = () => {
  const onPressLogin = useCallback(() => {
  }, []);

  return (
    <PopupContainer>
      <Button
        title="Login with Google"
        onPress={onPressLogin}
        variant={ButtonVariant.contained}
      />
    </PopupContainer>
  );
};
