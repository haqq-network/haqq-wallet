import React, {useCallback, useEffect, useRef} from 'react';

import {ProviderInterface} from '@haqq/provider-base';
import Decimal from 'decimal.js';

import {TransactionLedger} from '@app/components/transaction-ledger';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {showModal} from '@app/helpers';
import {awaitForBluetooth} from '@app/helpers/await-for-bluetooth';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {getProviderInstanceForWallet} from '@app/helpers/provider-instance';
import {useTypedNavigation, useTypedRoute, useUser} from '@app/hooks';
import {Wallet} from '@app/models/wallet';
import {EthNetwork} from '@app/services';
import {WEI} from '@app/variables/common';

export const TransactionLedgerScreen = () => {
  const transport = useRef<ProviderInterface | null>(null);
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'transactionConfirmation'>();
  const user = useUser();

  useEffect(() => {
    const subscription = (modal: string) => {
      if (modal === 'ledger-locked') {
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
    if (wallet && wallet.isValid()) {
      try {
        await awaitForBluetooth();

        transport.current = await getProviderInstanceForWallet(wallet);

        const ethNetworkProvider = new EthNetwork();
        const transaction = await ethNetworkProvider.sendTransaction(
          transport.current!,
          wallet.path!,
          route.params.to,
          new Decimal(route.params.amount).mul(WEI).toFixed(),
        );

        if (transaction) {
          await awaitForEventDone(
            Events.onAddressBookCreate,
            transaction,
            user.providerId,
            route.params.fee,
          );

          navigation.navigate('transactionFinish', {
            hash: transaction.hash,
          });
        }
      } catch (e) {
        if (e instanceof Error) {
          if (
            e.message === 'can_not_connected' ||
            e.message === 'ledger_locked'
          ) {
            showModal('ledger-locked');
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
    route.params.fee,
    route.params.to,
    user,
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
