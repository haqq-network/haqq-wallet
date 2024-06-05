import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';

import {TransactionSum} from '@app/components/transaction-sum';
import {app} from '@app/contexts';
import {showModal} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {useEffectAsync} from '@app/hooks/use-effect-async';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {I18N, getText} from '@app/i18n';
import {Contact} from '@app/models/contact';
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
          const {feeWei} = await EthNetwork.estimateERC20Transfer(
            wallet?.address!,
            route.params.to,
            amount,
            AddressUtils.toEth(token.id),
          );
          return feeWei;
        } else {
          const {
            fee: {average: averageFee},
          } = await EthNetwork.estimate(
            route.params.from,
            route.params.to,
            amount,
          );
          return averageFee;
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
      const feeWei = await getFee(amount);
      if (feeWei?.isPositive()) {
        navigation.navigate(TransactionStackRoutes.TransactionConfirmation, {
          fee: feeWei,
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
  }, []);

  useEffectAsync(async () => {
    const b = app.getAvailableBalance(route.params.from);
    const {
      fee: {average: averageFee},
    } = await EthNetwork.estimate(route.params.from, to, b);
    setFee(averageFee);
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
      isLoading={isLoading}
    />
  );
});
