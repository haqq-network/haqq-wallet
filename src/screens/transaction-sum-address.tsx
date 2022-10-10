import React, {useCallback} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {TransactionAddress} from '../components/transaction-address';
import {useApp} from '../contexts/app';

type TransactionSumAddressScreenProp = CompositeScreenProps<any, any>;

export const TransactionSumAddressScreen = ({
  route,
  navigation,
}: TransactionSumAddressScreenProp) => {
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
