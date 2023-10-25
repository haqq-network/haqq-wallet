import React, {useCallback, useEffect, useRef} from 'react';

import {ProviderInterface} from '@haqq/provider-base';

import {TransactionLedger} from '@app/components/transaction-ledger';
import {app} from '@app/contexts';
import {onTrackEvent} from '@app/event-actions/on-track-event';
import {Events} from '@app/events';
import {showModal} from '@app/helpers';
import {awaitForBluetooth} from '@app/helpers/await-for-bluetooth';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {getProviderInstanceForWallet} from '@app/helpers/provider-instance';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {Wallet} from '@app/models/wallet';
import {EthNetwork} from '@app/services';
import {AdjustEvents, ModalType} from '@app/types';

export const TransactionLedgerScreen = () => {
  const route = useTypedRoute<'transactionLedger'>();

  const transport = useRef<ProviderInterface | null>(null);
  const navigation = useTypedNavigation();

  useAndroidBackHandler(() => {
    navigation.goBack();
    return true;
  }, [navigation]);

  useEffect(() => {
    const subscription = (modal: string) => {
      if (modal === ModalType.ledgerLocked) {
        navigation.goBack();
      }
    };

    app.on(Events.onCloseModal, subscription);

    return () => {
      app.off(Events.onCloseModal, subscription);
    };
  });

  const tryToSingTransaction = useCallback(async () => {
    const wallet = Wallet.getById(route.params.from);
    if (wallet) {
      try {
        await awaitForBluetooth();

        transport.current = await getProviderInstanceForWallet(wallet);

        const ethNetworkProvider = new EthNetwork();
        const transaction = await ethNetworkProvider.transferTransaction(
          transport.current!,
          wallet.path!,
          route.params.to,
          route.params.amount,
        );

        if (transaction) {
          onTrackEvent(AdjustEvents.sendFund);

          await awaitForEventDone(
            Events.onTransactionCreate,
            transaction,
            app.providerId,
            route.params.fee ?? 0,
          );

          navigation.navigate('transactionFinish', {
            transaction,
            hash: transaction.hash,
          });
        }
      } catch (e) {
        if (e instanceof Error) {
          if (
            e.message === 'can_not_connected' ||
            e.message === 'ledger_locked'
          ) {
            showModal(ModalType.ledgerLocked);
          } else {
            navigation.goBack();
          }
        }
      }
    }
  }, [
    navigation,
    route.params.amount,
    route.params.from,
    route.params.to,
    route.params.fee,
  ]);

  useEffect(() => {
    requestAnimationFrame(async () => {
      await tryToSingTransaction();
    });
    return () => {
      transport.current && transport.current.abort();
    };
  }, [tryToSingTransaction]);

  return (
    <TransactionLedger
      from={route.params.from}
      to={route.params.to}
      amount={route.params.amount}
    />
  );
};
