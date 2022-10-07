import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {TransactionSum} from '../components/transaction-sum';
import {useApp} from '../contexts/app';
import {generateUUID} from '../utils';

type TransactionSumScreenProp = CompositeScreenProps<any, any>;

export const TransactionSumScreen = ({
  route,
  navigation,
}: TransactionSumScreenProp) => {
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

  const onAmount = useCallback(
    (amount: number) => {
      navigation.navigate('transactionConfirmation', {
        from: route.params.from,
        to,
        amount,
      });
    },
    [navigation, route, to],
  );

  const onContact = useCallback(() => {
    navigation.navigate('transactionSumAddress', {
      to,
      event,
    });
  }, [navigation]);

  return (
    <TransactionSum
      to={to}
      from={route.params.from}
      onAmount={onAmount}
      onContact={onContact}
    />
  );
};
