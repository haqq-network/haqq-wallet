import React, {useCallback} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {TransactionAddress} from '../components/transaction-address';
import {useApp} from '../contexts/app';
import {RootStackParamList} from '../types';

export const TransactionSumAddressScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'transactionSumAddress'>>();
  const app = useApp();
  const onDone = useCallback(
    (address: string) => {
      app.emit(route.params.event, address);
      navigation.goBack();
    },
    [app, navigation, route.params.event],
  );

  return <TransactionAddress initial={route.params.to} onAddress={onDone} />;
};
