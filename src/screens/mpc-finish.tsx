import React, {useCallback, useEffect} from 'react';

import {Finish} from '@app/components/finish';
import {hideModal} from '@app/helpers';
import {useApp, useTypedNavigation} from '@app/hooks';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';

export const MpcFinishScreen = () => {
  const app = useApp();
  const navigation = useTypedNavigation();
  const onEnd = useCallback(() => {
    if (app.getUser().onboarded) {
      navigation.getParent()?.goBack();
    } else {
      app.getUser().onboarded = true;
      navigation.replace('home');
    }
  }, [app, navigation]);

  useEffect(() => {
    hideModal();
    vibrate(HapticEffects.success);
  }, []);

  return (
    <Finish
      title={I18N.mpcFinishCongratulations}
      onFinish={onEnd}
      testID="mpc_finish"
    />
  );
};
