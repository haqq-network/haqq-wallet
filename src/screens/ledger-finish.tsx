import React, {useCallback} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {Finish} from '../components/finish';

export const LedgerFinishScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ledgerFinish'>>();

  const onEnd = useCallback(() => {
    if (route.params.hide) {
      navigation.getParent()?.goBack();
    } else {
      navigation.replace('home');
    }
  }, [navigation, route]);

  return (
    <Finish
      title="Сongratulations! You have successfully added a new wallet"
      onFinish={onEnd}
    />
  );
};
