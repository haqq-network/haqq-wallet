import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {Collection, CollectionChangeSet} from 'realm';

import {AccountInfo} from '@app/components/account-info';
import {Loading} from '@app/components/ui';
import {app} from '@app/contexts';
import {prepareTransactions, showModal} from '@app/helpers';
import {
  useTypedNavigation,
  useTypedRoute,
  useUser,
  useWallet,
} from '@app/hooks';
import {Transaction} from '@app/models/transaction';
import {TransactionList} from '@app/types';

export const AccountInfoScreen = () => {
  const user = useUser();
  const route = useTypedRoute<'accountInfo'>();
  const navigation = useTypedNavigation();
  const wallet = useWallet(route.params.accountId);
  const [balance, setBalance] = useState(
    app.getBalance(route.params.accountId),
  );

  const transactions = useMemo(() => {
    return Transaction.getAllByAccountIdAndProviderId(
      route.params.accountId,
      user.providerId,
    );
  }, [route.params.accountId, user.providerId]);

  const [transactionsList, setTransactionsList] = useState<TransactionList[]>(
    prepareTransactions([route.params.accountId], transactions.snapshot()),
  );

  const onTransactionList = useCallback(
    (collection: Collection<Transaction>, changes: CollectionChangeSet) => {
      if (
        changes.insertions.length ||
        changes.newModifications.length ||
        changes.deletions.length
      ) {
        setTransactionsList(
          prepareTransactions(
            [route.params.accountId],
            transactions.snapshot(),
          ),
        );
      }
    },
    [route.params.accountId, transactions],
  );

  useEffect(() => {
    transactions.addListener(onTransactionList);
    user.on('change', onTransactionList);
    return () => {
      transactions.removeListener(onTransactionList);
      user.off('change', onTransactionList);
    };
  }, [onTransactionList, transactions, user]);

  useEffect(() => {
    const onBalance = () => {
      setBalance(app.getBalance(route.params.accountId));
    };

    app.on('balance', onBalance);
    return () => {
      app.off('balance', onBalance);
    };
  }, [route.params.accountId]);

  const onReceive = useCallback(() => {
    showModal('card-details-qr', {address: route.params.accountId});
  }, [route.params.accountId]);

  const onSend = useCallback(() => {
    navigation.navigate('transaction', {from: route.params.accountId});
  }, [navigation, route.params.accountId]);

  const onPressRow = useCallback(
    (hash: string) => {
      navigation.navigate('transactionDetail', {
        hash,
      });
    },
    [navigation],
  );

  if (!wallet) {
    return <Loading />;
  }

  return (
    <AccountInfo
      wallet={wallet}
      balance={balance}
      onReceive={onReceive}
      onSend={onSend}
      transactionsList={transactionsList}
      onPressRow={onPressRow}
    />
  );
};
