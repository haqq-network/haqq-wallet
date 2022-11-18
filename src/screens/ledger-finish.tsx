import React, {useCallback, useEffect} from 'react';

import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {useApp} from '@app/hooks';
import {HapticEffects, vibrate} from '@app/services/haptic';

import {Finish} from '../components/finish';
import {hideModal} from '../helpers/modal';
import {RootStackParamList} from '../types';

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
      title="Сongratulations! You have successfully added a new wallet"
      onFinish={onEnd}
      testID="ledger_finish"
    />
  );
};
