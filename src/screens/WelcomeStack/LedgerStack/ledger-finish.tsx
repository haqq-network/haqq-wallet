import React, {memo, useCallback, useEffect} from 'react';

import {Finish} from '@app/components/finish';
import {app} from '@app/contexts';
import {hideModal} from '@app/helpers/modal';
import {useTypedNavigation} from '@app/hooks';
import {I18N} from '@app/i18n';
import {LedgerStackParamList} from '@app/screens/WelcomeStack/LedgerStack';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {ModalType} from '@app/types';

export const LedgerFinishScreen = memo(() => {
  const navigation = useTypedNavigation<LedgerStackParamList>();
  const onEnd = useCallback(() => {
    if (app.onboarded) {
      navigation.getParent()?.goBack();
    } else {
      app.onboarded = true;
    }
  }, [navigation]);

  useEffect(() => {
    hideModal(ModalType.loading);
    vibrate(HapticEffects.success);
  }, []);

  return (
    <Finish
      title={I18N.ledgerFinishCongratulations}
      onFinish={onEnd}
      testID="ledger_finish"
    />
  );
});
