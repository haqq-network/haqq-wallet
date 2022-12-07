import React, {useCallback, useEffect} from 'react';

import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {Finish} from '@app/components/finish';
import {hideModal} from '@app/helpers';
import {useApp} from '@app/hooks';
import {I18N} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {RootStackParamList} from '@app/types';

export const LedgerFinishScreen = () => {
  const app = useApp();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    hideModal();
    vibrate(HapticEffects.success);
  }, []);

  const onEnd = useCallback(() => {
    if (app.getUser().onboarded) {
      navigation.getParent()?.goBack();
    } else {
      app.getUser().onboarded = true;
      navigation.replace('home');
    }
  }, [app, navigation]);

  return (
    <Finish
      title={I18N.ledgerFinishTitle}
      onFinish={onEnd}
      testID="ledger_finish"
    />
  );
};
