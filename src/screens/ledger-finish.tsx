import React, {useCallback, useEffect} from 'react';

import {Finish} from '@app/components/finish';
import {hideModal} from '@app/helpers/modal';
import {useTypedNavigation, useUser} from '@app/hooks';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';

export const LedgerFinishScreen = () => {
  const navigation = useTypedNavigation();
  const user = useUser();
  const onEnd = useCallback(() => {
    if (user.onboarded) {
      navigation.getParent()?.goBack();
    } else {
      user.onboarded = true;
      navigation.replace('home');
    }
  }, [navigation, user]);

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
