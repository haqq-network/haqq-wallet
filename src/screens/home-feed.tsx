import React, {useCallback, useEffect, useState} from 'react';

import {HomeFeed} from '@app/components/home-feed';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {prepareTransactions} from '@app/helpers';
import {filterTransactions} from '@app/helpers/filter-transactions';
import {
  useTransactions,
  useTypedNavigation,
  useUser,
  useWallets,
} from '@app/hooks';
import {Transaction} from '@app/models/transaction';
import {TransactionList} from '@app/types';

export const HomeFeedScreen = () => {
  const navigation = useTypedNavigation();
  const transactions = useTransactions();
  const wallets = useWallets();
  const user = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [transactionsList, setTransactionsList] = useState<TransactionList[]>(
    prepareTransactions(
      wallets.addressList,
      filterTransactions(Transaction.getAll().snapshot(), user.providerId),
    ),
  );

  const onTransactionList = useCallback(() => {
    setTransactionsList(
      prepareTransactions(
        wallets.addressList,
        filterTransactions(Transaction.getAll().snapshot(), user.providerId),
      ),
    );
  }, [wallets.addressList, user.providerId]);

  const onWalletsRefresh = useCallback(() => {
    setRefreshing(true);

    const actions = wallets.addressList.map(
      address =>
        new Promise(resolve => {
          app.emit(Events.onTransactionsLoad, address, resolve);
        }),
    );

    actions.push(
      new Promise(resolve => {
        app.emit(Events.onWalletsBalanceCheck, resolve);
      }),
    );

    Promise.all(actions).then(() => {
      setRefreshing(false);
    });
  }, [wallets]);

  const onPressRow = useCallback(
    (hash: string) => {
      navigation.navigate('transactionDetail', {
        hash,
      });
    },
    [navigation],
  );

  useEffect(() => {
    transactions.on('transactions', onTransactionList);
    user.on('change', onTransactionList);
    return () => {
      transactions.off('transactions', onTransactionList);
      user.off('change', onTransactionList);
    };
  }, [onTransactionList, transactions, user, wallets]);

  return (
    <HomeFeed
      transactionsList={transactionsList}
      refreshing={refreshing}
      user={user}
      onWalletsRefresh={onWalletsRefresh}
      onPressRow={onPressRow}
    />
  );
};
