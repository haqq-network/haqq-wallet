import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {TransactionSum} from '@app/components/transaction-sum';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute, useWallet} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {Contact} from '@app/models/contact';
import {EthNetwork} from '@app/services';
import {Balance} from '@app/services/balance';
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
  const wallet = useWallet(route.params.from);
  const balances = useWalletsBalance([wallet!]);
  const currentBalance = useMemo(
    () => balances[route.params.from],
    [balances, route],
  );
  const [fee, setFee] = useState<Balance | null>(null);
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
      if (fee !== null) {
        navigation.navigate('transactionConfirmation', {
          fee,
          from: route.params.from,
          to,
          amount,
        });
      }
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

  useEffectAsync(async () => {
    const b = app.getAvailableBalance(route.params.from);
    const estimateFee = await EthNetwork.estimateTransaction(
      route.params.from,
      to,
      b,
    );
    setFee(estimateFee.feeWei);
  }, [to]);

  return (
    <TransactionSum
      contact={contact}
      balance={currentBalance.available}
      fee={fee}
      to={to}
      from={route.params.from}
      onAmount={onAmount}
      onContact={onContact}
      testID="transaction_sum"
    />
  );
};
