import React, {useCallback} from 'react';

import {TransactionResponse} from '@ethersproject/abstract-provider';

import {useTypedNavigation, useTypedRoute, useUser} from '@app/hooks';

import {TransactionLedger} from '../components/transaction-ledger';
import {Transaction} from '../models/transaction';

export const TransactionLedgerScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'transactionConfirmation'>();

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

  return (
    <TransactionLedger
      from={route.params.from}
      to={route.params.to}
      amount={route.params.amount}
      onDone={onDone}
    />
  );
};
