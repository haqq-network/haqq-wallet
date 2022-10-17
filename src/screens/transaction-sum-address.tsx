import React, {useCallback} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {TransactionAddress} from '../components/transaction-address';
import {useApp} from '../contexts/app';

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
