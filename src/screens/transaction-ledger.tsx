import React, {useCallback, useEffect} from 'react';

import {TransactionResponse} from '@ethersproject/abstract-provider';

import {TransactionLedger} from '@app/components/transaction-ledger';
import {
  useTypedNavigation,
  useTypedRoute,
  useUser,
  useWallet,
} from '@app/hooks';
import {Transaction} from '@app/models/transaction';
import {EthNetwork} from '@app/services';

export const TransactionLedgerScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'transactionConfirmation'>();
  const wallet = useWallet(route.params.from);
  const user = useUser();

  const onDone = useCallback(
    async (transaction: TransactionResponse) => {
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
    },
    [user.providerId, route.params.fee, navigation],
  );

  useEffect(() => {
    if (wallet) {
      requestAnimationFrame(async () => {
        try {
          const ethNetworkProvider = new EthNetwork();
          const transaction = await ethNetworkProvider.sendTransaction(
            wallet.transport,
            route.params.to,
            route.params.amount,
          );

          if (transaction) {
            await onDone(transaction);
          }
        } catch (e) {
          navigation.goBack();
        }
      });
    }
    return () => {
      wallet?.transportExists && wallet?.transport.abort();
    };
  }, [wallet, route.params.amount, onDone, route.params.to, navigation]);

  return (
    <TransactionLedger
      from={route.params.from}
      to={route.params.to}
      amount={route.params.amount}
    />
  );
};
