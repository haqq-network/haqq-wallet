import React, {useCallback, useEffect, useRef} from 'react';

import {ProviderInterface} from '@haqq/provider-base';

import {TransactionLedger} from '@app/components/transaction-ledger';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {showModal} from '@app/helpers';
import {getProviderInstanceForWallet} from '@app/helpers/provider-instance';
import {useTypedNavigation, useTypedRoute, useUser} from '@app/hooks';
import {Transaction} from '@app/models/transaction';
import {Wallet} from '@app/models/wallet';
import {EthNetwork} from '@app/services';

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
        transport.current = getProviderInstanceForWallet(wallet);

        transport.current?.on('awaitForTransport', (...args) => {
          console.log('awaitForTransport', ...args);
        });

        const ethNetworkProvider = new EthNetwork();
        const transaction = await ethNetworkProvider.sendTransaction(
          transport.current!,
          route.params.to,
          route.params.amount,
        );

        if (transaction) {
          await Transaction.createTransaction(
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
