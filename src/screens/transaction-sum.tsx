import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../types';

import {TransactionSum} from '../components/transaction-sum';
import {useApp} from '../contexts/app';
import {generateUUID} from '../utils';
import {splitAddress} from '../utils';

export const TransactionSumScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'transactionSum'>>();
  const app = useApp();
  const event = useMemo(() => generateUUID(), []);
  const [to, setTo] = useState(route.params.to);

  const onAddress = useCallback((address: string) => {
    setTo(address);
  }, []);

  useEffect(() => {
    app.on(event, onAddress);

    return () => {
      app.off(event, onAddress);
    };
  }, [app, event, onAddress]);

  const splittedTo = useMemo(() => splitAddress(to), [to]);

  const onAmount = useCallback(
    (amount: number) => {
      navigation.navigate('transactionConfirmation', {
        from: route.params.from,
        to,
        amount,
        splittedTo,
      });
    },
    [navigation, route.params.from, splittedTo, to],
  );

  const onContact = useCallback(() => {
    navigation.navigate('transactionSumAddress', {
      to,
      event,
    });
  }, [event, navigation, to]);

  return (
    <TransactionSum
      to={to}
      from={route.params.from}
      onAmount={onAmount}
      onContact={onContact}
    />
  );
};
