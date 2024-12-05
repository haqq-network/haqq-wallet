import React, {memo, useCallback, useEffect} from 'react';

import {Finish} from '@app/components/finish';
import {hideModal} from '@app/helpers/modal';
import {useTypedNavigation} from '@app/hooks';
import {I18N} from '@app/i18n';
import {AppStore} from '@app/models/app';
import {HomeStackParamList, KeystoneStackParamList} from '@app/route-types';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {ModalType} from '@app/types';

export const KeystoneFinishScreen = memo(() => {
  const navigation = useTypedNavigation<
    KeystoneStackParamList & HomeStackParamList
  >();
  const onEnd = useCallback(() => {
    // 3 level screen stack back
    navigation.goBack();
    navigation.getParent()?.goBack();
    navigation.getParent()?.getParent()?.goBack();

    if (!AppStore.isOnboarded) {
      AppStore.isOnboarded = true;
    }
  }, [navigation, AppStore.isOnboarded]);

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
