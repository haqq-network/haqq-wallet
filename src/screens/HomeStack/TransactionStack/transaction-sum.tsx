import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {TransactionSum} from '@app/components/transaction-sum';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {Contact} from '@app/models/contact';
import {EthNetwork} from '@app/services';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {generateUUID} from '@app/utils';

export const TransactionSumScreen = () => {
  const navigation = useTypedNavigation();
  useAndroidBackHandler(() => {
    navigation.goBack();
    return true;
  }, [navigation]);
  const route = useTypedRoute<'transactionSum'>();
  const event = useMemo(() => generateUUID(), []);
  const [to, setTo] = useState(route.params.to);

  const [balance, setBalance] = useState(0);
  const [fee, setFee] = useState(0);
  const contact = useMemo(() => Contact.getById(to), [to]);

  const onAddress = useCallback((address: string) => {
    setTo(address);
  }, []);

  useEffect(() => {
    app.on(event, onAddress);

    return () => {
      app.off(event, onAddress);
    };
  }, [event, onAddress]);

  const onAmount = useCallback(
    (amount: number) => {
      navigation.navigate('transactionConfirmation', {
        fee,
        from: route.params.from,
        to,
        amount,
      });
    },
    [fee, navigation, route.params.from, to],
  );

  const onContact = useCallback(() => {
    vibrate(HapticEffects.impactLight);
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
      contact={contact}
      balance={balance}
      fee={fee}
      to={to}
      from={route.params.from}
      onAmount={onAmount}
      onContact={onContact}
      testID="transaction_sum"
    />
  );
};
