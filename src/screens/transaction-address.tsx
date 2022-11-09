import React, {useCallback} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {TransactionAddress} from '../components/transaction-address';
import {RootStackParamList} from '../types';

export const TransactionAddressScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'transactionAddress'>>();

  const onDone = useCallback(
    (address: string) => {
      navigation.navigate('transactionSum', {
        from: route.params.from,
        to: address,
      });
    },
    [navigation, route],
  );

  return <TransactionAddress initial={route.params?.to} onAddress={onDone} />;
};
