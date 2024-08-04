import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';

import {TransactionSum} from '@app/components/transaction-sum';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {showModal} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {awaitForProvider} from '@app/helpers/await-for-provider';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {I18N, getText} from '@app/i18n';
import {Contact} from '@app/models/contact';
import {Provider} from '@app/models/provider';
import {Wallet} from '@app/models/wallet';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';
import {EthNetwork} from '@app/services';
import {Balance} from '@app/services/balance';
import {HapticEffects, vibrate} from '@app/services/haptic';
import {ModalType} from '@app/types';
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
  const [isLoading, setLoading] = useState(false);
  const onAddress = useCallback((address: string) => {
    setTo(address);
  }, []);

  const getFee = useCallback(
    async (amount: Balance) => {
      try {
        const token = route.params.token;
        if (token.is_erc20) {
          return await EthNetwork.estimateERC20Transfer({
            from: wallet?.address!,
            to: route.params.to,
            amount,
            contractAddress: AddressUtils.toEth(token.id),
          });
        } else {
          return await EthNetwork.estimate({
            from: route.params.from,
            to: route.params.to,
            value: amount,
          });
        }
      } catch {
        return null;
      }
    },
    [route.params],
  );

  useEffect(() => {
    //@ts-ignore
    navigation.setOptions({titleIcon: route.params.token.image});

    app.on(event, onAddress);

    return () => {
      app.off(event, onAddress);
    };
  }, [event, onAddress]);

  const onAmount = useCallback(
    async (amount: Balance) => {
      setLoading(true);
      const estimate = await getFee(amount);
      if (estimate?.expectedFee.isPositive()) {
        navigation.navigate(TransactionStackRoutes.TransactionConfirmation, {
          calculatedFees: estimate,
          from: route.params.from,
          to,
          amount,
          token: route.params.token,
        });
      } else {
        showModal(ModalType.error, {
          title: getText(I18N.feeCalculatingRpcErrorTitle),
          description: getText(I18N.feeCalculatingRpcErrorDescription),
          close: getText(I18N.feeCalculatingRpcErrorClose),
          onClose: () => {
            onAmount(amount);
          },
        });
      }
      setLoading(false);
    },
    [fee, navigation, route.params.from, to],
  );

  const onContact = useCallback(() => {
    vibrate(HapticEffects.impactLight);
    navigation.navigate(TransactionStackRoutes.TransactionSumAddress, {
      to,
      from: route.params.from,
      event,
    });
  }, [event, navigation, to]);

  const onToken = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onNetworkPress = useCallback(async () => {
    const providerId = await awaitForProvider({
      providers: Provider.getAll(),
      initialProviderId: app.providerId!,
      title: I18N.networks,
    });
    app.providerId = providerId;
    await awaitForEventDone(Events.onProviderChanged);
    navigation.goBack();
  }, [navigation]);

  useEffectAsync(async () => {
    const b = app.getAvailableBalance(route.params.from);
    const {expectedFee} = await EthNetwork.estimate({
      from: route.params.from,
      to,
      value: b,
    });
    setFee(expectedFee);
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
      onNetworkPress={onNetworkPress}
      testID="transaction_sum"
      token={route.params.token}
      isLoading={isLoading}
    />
  );
});
