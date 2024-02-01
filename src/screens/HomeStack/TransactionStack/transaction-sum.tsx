import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';

import {TransactionSum} from '@app/components/transaction-sum';
import {app} from '@app/contexts';
import {AddressUtils} from '@app/helpers/address-utils';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {Contact} from '@app/models/contact';
import {Wallet} from '@app/models/wallet';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';
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
  const wallet = Wallet.getById(route.params.from);
  const balances = useWalletsBalance([wallet!]);
  const currentBalance = useMemo(
    () => balances[AddressUtils.toEth(route.params.from)],
    [balances, route],
  );
  const [fee, setFee] = useState<Balance | null>(null);
  const contact = useMemo(() => Contact.getById(to), [to]);

  const onAddress = useCallback((address: string) => {
    setTo(address);
  }, []);

  useEffect(() => {
    //@ts-ignore
    navigation.setOptions({titleIcon: route.params.token.image});

    app.on(event, onAddress);

    return () => {
      app.off(event, onAddress);
    };
  }, [event, onAddress]);

  const onAmount = useCallback(
    (amount: Balance) => {
      if (fee !== null) {
        navigation.navigate(TransactionStackRoutes.TransactionConfirmation, {
          fee,
          from: route.params.from,
          to,
          amount,
          token: route.params.token,
        });
      }
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

  const onToken = useCallback(() => {
    navigation.goBack();
  }, []);

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
      onToken={onToken}
      testID="transaction_sum"
      token={route.params.token}
    />
  );
});
