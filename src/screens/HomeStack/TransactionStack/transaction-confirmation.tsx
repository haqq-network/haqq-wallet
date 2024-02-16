import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {observer} from 'mobx-react';

import {TransactionConfirmation} from '@app/components/transaction-confirmation';
import {app} from '@app/contexts';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {Events} from '@app/events';
import {removeProviderInstanceForWallet} from '@app/helpers';
import {AddressUtils} from '@app/helpers/address-utils';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {
  abortProviderInstanceForWallet,
  getProviderInstanceForWallet,
} from '@app/helpers/provider-instance';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {useLayoutEffectAsync} from '@app/hooks/use-effect-async';
import {useError} from '@app/hooks/use-error';
import {Contact} from '@app/models/contact';
import {Wallet} from '@app/models/wallet';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';
import {EthNetwork} from '@app/services';
import {Balance} from '@app/services/balance';
import {AdjustEvents} from '@app/types';
import {makeID} from '@app/utils';
import {FEE_ESTIMATING_TIMEOUT_MS} from '@app/variables/common';

export const TransactionConfirmationScreen = observer(() => {
  const navigation = useTypedNavigation<TransactionStackParamList>();
  useAndroidBackHandler(() => {
    navigation.goBack();
    return true;
  }, [navigation]);
  const route = useTypedRoute<
    TransactionStackParamList,
    TransactionStackRoutes.TransactionConfirmation
  >();
  const {token} = route.params;

  const wallet = Wallet.getById(route.params.from);
  const contact = useMemo(
    () => Contact.getById(route.params.to),
    [route.params.to],
  );
  const showError = useError();
  const [disabled, setDisabled] = useState(false);
  const [fee, setFee] = useState<Balance | null>(null);

  useLayoutEffectAsync(async () => {
    const timer = setTimeout(
      () => setFee(route.params.fee ?? Balance.Empty),
      FEE_ESTIMATING_TIMEOUT_MS,
    );

    const result = await EthNetwork.estimateTransaction(
      route.params.from,
      route.params.to,
      route.params.amount,
    );

    clearTimeout(timer);
    setFee(result.feeWei);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const onConfirmTransaction = useCallback(async () => {
    if (wallet) {
      try {
        setDisabled(true);

        const ethNetworkProvider = new EthNetwork();

        const provider = await getProviderInstanceForWallet(wallet);

        let transaction;
        if (token.is_erc20) {
          transaction = await ethNetworkProvider.transferERC20(
            provider,
            wallet,
            route.params.to,
            route.params.amount,
            AddressUtils.toEth(token.id),
          );
        } else {
          transaction = await ethNetworkProvider.transferTransaction(
            provider,
            wallet.path!,
            route.params.to,
            route.params.amount,
          );
        }

        if (transaction) {
          onTrackEvent(AdjustEvents.sendFund);

          await awaitForEventDone(
            Events.onTransactionCreate,
            transaction,
            app.providerId,
            fee,
          );

          navigation.navigate(TransactionStackRoutes.TransactionFinish, {
            transaction,
            hash: transaction.hash,
            token: route.params.token,
            amount: token.is_erc20 ? route.params.amount : undefined,
          });
        }
      } catch (e) {
        const errorId = makeID(4);

        Logger.captureException(e, 'transaction-confirmation', {
          from: route.params.from,
          to: route.params.to,
          amount: route.params.amount.toHex(),
          id: errorId,
          walletType: wallet.type,
        });

        // @ts-ignore
        const errMsg = e?.message || e?.toString?.() || JSON.stringify(e);
        if (errMsg) {
          showError(errorId, errMsg);
        }
      } finally {
        setDisabled(false);
        removeProviderInstanceForWallet(wallet);
      }
    }
  }, [
    fee,
    navigation,
    route.params.amount,
    route.params.from,
    route.params.to,
    wallet,
  ]);

  useEffect(() => {
    return () => {
      wallet && abortProviderInstanceForWallet(wallet);
    };
  }, [wallet]);

  return (
    <TransactionConfirmation
      disabled={disabled}
      contact={contact}
      to={route.params.to}
      amount={route.params.amount}
      fee={fee}
      onConfirmTransaction={onConfirmTransaction}
      testID="transaction_confirmation"
      token={route.params.token}
    />
  );
});
