import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';

import {TransactionSum} from '@app/components/transaction-sum';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {Contact} from '@app/models/contact';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/screens/HomeStack/TransactionStack';
import {EthNetwork} from '@app/services';
import {Balance} from '@app/services/balance';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {generateUUID} from '@app/utils';

export const TransactionSumScreen = memo(() => {
  const navigation = useTypedNavigation<TransactionStackParamList>();
  useAndroidBackHandler(() => {
    navigation.goBack();
    return true;
  }, [navigation]);
  const route = useTypedRoute<
    TransactionStackParamList,
    TransactionStackRoutes.TransactionSum
  >();
  const event = useMemo(() => generateUUID(), []);
  const [to, setTo] = useState(route.params.to);

  const [balance, setBalance] = useState(Balance.Empty);
  const [fee, setFee] = useState(Balance.Empty);
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
    (amount: Balance) => {
      navigation.navigate(TransactionStackRoutes.TransactionConfirmation, {
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
    navigation.navigate(TransactionStackRoutes.TransactionSumAddress, {
      to,
      event,
    });
  }, [event, navigation, to]);

  useEffectAsync(async () => {
    const b = app.getBalance(route.params.from);
    setBalance(b);
    const estimateFee = await EthNetwork.estimateTransaction(
      route.params.from,
      to,
      b,
    );
    setFee(estimateFee.feeWei);
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
});
