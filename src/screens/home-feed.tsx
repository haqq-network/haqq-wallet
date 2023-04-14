import React, {useCallback, useEffect, useState} from 'react';

import {Collection, CollectionChangeSet} from 'realm';

import {HomeFeed} from '@app/components/home-feed';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {prepareTransactions} from '@app/helpers';
import {useTypedNavigation, useUser, useWallets} from '@app/hooks';
import {Transaction} from '@app/models/transaction';
import {TransactionList} from '@app/types';

export const HomeFeedScreen = () => {
  const navigation = useTypedNavigation();
  const user = useUser();
  const wallets = useWallets();
  const [refreshing, setRefreshing] = useState(false);

  const [transactionsList, setTransactionsList] = useState<TransactionList[]>(
    prepareTransactions(
      wallets.addressList,
      Transaction.getAllByProviderId(user.providerId).snapshot(),
    ),
  );

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

  const onTransactionsList = useCallback(
    (collection: Collection<Transaction>, changes: CollectionChangeSet) => {
      if (
        changes.insertions.length ||
        changes.newModifications.length ||
        changes.deletions.length
      ) {
        setTransactionsList(
          prepareTransactions(wallets.addressList, collection.snapshot()),
        );
      }
    },
    [wallets],
  );

  useEffect(() => {
    const transactions = Transaction.getAllByProviderId(user.providerId);
    setTransactionsList(
      prepareTransactions(wallets.addressList, transactions.snapshot()),
    );

    transactions.addListener(onTransactionsList);
    return () => {
      transactions.removeListener(onTransactionsList);
    };
  }, [onTransactionsList, user.providerId, wallets]);

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
