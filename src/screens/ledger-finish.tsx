import React, {useCallback, useEffect} from 'react';

import {Finish} from '@app/components/finish';
import {hideModal} from '@app/helpers/modal';
import {useApp, useTypedNavigation} from '@app/hooks';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';

export const LedgerFinishScreen = () => {
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
    hideModal('loading');
    vibrate(HapticEffects.success);
  }, []);

  return (
    <Finish
      title={I18N.ledgerFinishCongratulations}
      onFinish={onEnd}
      testID="ledger_finish"
    />
  );
};
