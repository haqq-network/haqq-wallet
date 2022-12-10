import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {TransactionSum} from '@app/components/transaction-sum';
import {useApp, useTypedNavigation, useTypedRoute} from '@app/hooks';
import {EthNetwork} from '@app/services';
import {generateUUID, splitAddress} from '@app/utils';

export const TransactionSumScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'transactionSum'>();
  const app = useApp();
  const event = useMemo(() => generateUUID(), []);
  const [to, setTo] = useState(route.params.to);
  const [balance, setBalance] = useState(0);
  const [fee, setFee] = useState(0);

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
        fee,
        from: route.params.from,
        to,
        amount,
        splittedTo,
      });
    },
    [fee, navigation, route.params.from, splittedTo, to],
  );

  const onContact = useCallback(() => {
    navigation.navigate('transactionSumAddress', {
      to,
      event,
    });
  }, [event, navigation, to]);

  useEffect(() => {
    EthNetwork.getBalance(route.params.from)
      .then(b => {
        setBalance(b);
        return b;
      })
      .then(b => EthNetwork.estimateTransaction(route.params.from, to, b))
      .then(estimateFee => {
        setFee(estimateFee.fee);
      });
  }, [route.params.from, to]);

  return (
    <TransactionSum
      balance={balance}
      fee={fee}
      to={to}
      from={route.params.from}
      onAmount={onAmount}
      onContact={onContact}
    />
  );
};
