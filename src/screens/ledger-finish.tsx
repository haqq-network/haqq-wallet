import React, {useCallback, useEffect} from 'react';

import {Finish} from '@app/components/finish';
import {app} from '@app/contexts';
import {hideModal} from '@app/helpers/modal';
import {useTypedNavigation} from '@app/hooks';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';

export const LedgerFinishScreen = () => {
  const navigation = useTypedNavigation();
  const onEnd = useCallback(() => {
    if (app.onboarded) {
      navigation.getParent()?.goBack();
    } else {
      app.onboarded = true;
      navigation.replace('home');
    }
  }, [navigation]);

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
