import React, {useCallback} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {TransactionAddress} from '../components/transaction-address';

type ParamList = {
  transactionAddress: {
    from: string;
  };
};

export const TransactionAddressScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<ParamList, 'transactionAddress'>>();
  const onDone = useCallback(
    (address: string) => {
      navigation.navigate('transactionSum', {
        from: route.params.from,
        to: address,
      });
    },
    [navigation, route],
  );

  return <TransactionAddress initial={route.params.to} onAddress={onDone} />;
};
