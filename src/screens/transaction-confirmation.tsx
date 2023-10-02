import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {observer} from 'mobx-react';

import {TransactionConfirmation} from '@app/components/transaction-confirmation';
import {app} from '@app/contexts';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {Events} from '@app/events';
import {awaitForLedger, removeProviderInstanceForWallet} from '@app/helpers';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {
  abortProviderInstanceForWallet,
  getProviderInstanceForWallet,
} from '@app/helpers/provider-instance';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {useLayoutEffectAsync} from '@app/hooks/use-effect-async';
import {I18N, getText} from '@app/i18n';
import {Contact} from '@app/models/contact';
import {Wallet} from '@app/models/wallet';
import {EthNetwork} from '@app/services';
import {Balance} from '@app/services/balance';
import {AdjustEvents, WalletType} from '@app/types';
import {makeID} from '@app/utils';
import {FEE_ESTIMATING_TIMEOUT_MS} from '@app/variables/common';

export const TransactionConfirmationScreen = observer(() => {
  const navigation = useTypedNavigation();
  useAndroidBackHandler(() => {
    navigation.goBack();
    return true;
  }, [navigation]);
  const route = useTypedRoute<'transactionConfirmation'>();

  const wallet = Wallet.getById(route.params.from);
  const contact = useMemo(
    () => Contact.getById(route.params.to),
    [route.params.to],
  );
  const [error, setError] = useState('');
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

        const result = ethNetworkProvider.transferTransaction(
          provider,
          wallet.path!,
          route.params.to,
          route.params.amount,
        );

        if (wallet.type === WalletType.ledgerBt) {
          await awaitForLedger(provider);
        }

        const transaction = await result;

        if (transaction) {
          onTrackEvent(AdjustEvents.sendFund);

          await awaitForEventDone(
            Events.onTransactionCreate,
            transaction,
            app.providerId,
            fee,
          );

          navigation.navigate('transactionFinish', {
            transaction,
            hash: transaction.hash,
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

        if (e instanceof Error) {
          setError(
            getText(I18N.transactionFailed, {
              id: errorId,
            }),
          );
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
      error={error}
      testID="transaction_confirmation"
    />
  );
});
