import React, {useCallback, useEffect, useMemo, useState} from 'react';

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
  const transactions = useMemo(
    () => Transaction.getAllByProviderId(user.providerId),
    [user.providerId],
  );
  const wallets = useWallets();
  const [refreshing, setRefreshing] = useState(false);
  const [transactionsList, setTransactionsList] = useState<TransactionList[]>(
    prepareTransactions(wallets.addressList, transactions.snapshot()),
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
          prepareTransactions(wallets.addressList, transactions.snapshot()),
        );
      }
    },
    [wallets.addressList, transactions],
  );

  useEffect(() => {
    transactions.addListener(onTransactionsList);
    return () => {
      transactions.removeListener(onTransactionsList);
    };
  }, [onTransactionsList, transactions, user]);

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
