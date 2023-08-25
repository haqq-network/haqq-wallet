import React, {useCallback, useEffect, useMemo, useState} from 'react';

import Decimal from 'decimal.js';

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
import {useTypedNavigation, useTypedRoute, useWallet} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {I18N, getText} from '@app/i18n';
import {Contact} from '@app/models/contact';
import {EthNetwork} from '@app/services';
import {Balance} from '@app/services/balance';
import {AdjustEvents, WalletType} from '@app/types';
import {makeID} from '@app/utils';
import {WEI} from '@app/variables/common';

export const TransactionConfirmationScreen = () => {
  const navigation = useTypedNavigation();
  useAndroidBackHandler(() => {
    navigation.goBack();
    return true;
  }, [navigation]);
  const route = useTypedRoute<'transactionConfirmation'>();

  const wallet = useWallet(route.params.from);
  const contact = useMemo(
    () => Contact.getById(route.params.to),
    [route.params.to],
  );
  const [error, setError] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [fee, setFee] = useState(route.params.fee ?? Balance.Empty);

  useEffect(() => {
    EthNetwork.estimateTransaction(
      route.params.from,
      route.params.to,
      route.params.amount,
    ).then(result => setFee(result.feeWei));
  }, [route.params.from, route.params.to, route.params.amount]);

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
          new Decimal(route.params.amount).mul(WEI).toFixed(),
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
          amount: route.params.amount,
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
      wallet && wallet.isValid() && abortProviderInstanceForWallet(wallet);
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
};
