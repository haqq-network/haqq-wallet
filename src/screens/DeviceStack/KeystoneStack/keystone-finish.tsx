import React, {memo, useCallback, useEffect} from 'react';

import {Finish} from '@app/components/finish';
import {app} from '@app/contexts';
import {hideModal} from '@app/helpers/modal';
import {useTypedNavigation} from '@app/hooks';
import {I18N} from '@app/i18n';
import {KeystoneStackParamList} from '@app/route-types';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {ModalType} from '@app/types';

export const KeystoneFinishScreen = memo(() => {
  const navigation = useTypedNavigation<KeystoneStackParamList>();
  const onEnd = useCallback(() => {
    if (app.onboarded) {
      navigation.getParent()?.goBack();
    } else {
      app.onboarded = true;
    }
  }, [navigation, app.onboarded]);

  useEffect(() => {
    hideModal(ModalType.loading);
    vibrate(HapticEffects.success);
  }, []);

  return (
    <Finish
      title={I18N.ledgerFinishCongratulations}
      onFinish={onEnd}
      testID="keystone_finish"
    />
  );
});
