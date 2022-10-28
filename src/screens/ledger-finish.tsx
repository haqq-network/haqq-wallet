import React, {useCallback, useEffect} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {Finish} from '../components/finish';
import {useApp} from '../contexts/app';

export const LedgerFinishScreen = () => {
  const app = useApp();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    app.emit('modal', null);
  }, [app]);

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
