import React, {useCallback, useEffect, useState} from 'react';

import {Collection, CollectionChangeSet} from 'realm';

import {HomeFeed} from '@app/components/home-feed';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {prepareTransactions} from '@app/helpers';
import {useTypedNavigation, useUser} from '@app/hooks';
import {Transaction} from '@app/models/transaction';
import {Wallet} from '@app/models/wallet';
import {TransactionList} from '@app/types';

export const HomeFeedScreen = () => {
  const navigation = useTypedNavigation();
  const user = useUser();
  const [refreshing, setRefreshing] = useState(false);

  const [transactionsList, setTransactionsList] = useState<TransactionList[]>(
    prepareTransactions(
      Wallet.addressList(),
      Transaction.getAllByProviderId(app.providerId).snapshot(),
    ),
  );

  const onWalletsRefresh = useCallback(() => {
    setRefreshing(true);

    const actions = Wallet.addressList().map(
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
  }, []);

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
          prepareTransactions(Wallet.addressList(), collection.snapshot()),
        );
      }
    },
    [],
  );

  useEffect(() => {
    const transactions = Transaction.getAllByProviderId(app.providerId);
    setTransactionsList(
      prepareTransactions(Wallet.addressList(), transactions.snapshot()),
    );

    transactions.addListener(onTransactionsList);
    return () => {
      transactions.removeListener(onTransactionsList);
    };
  }, [onTransactionsList]);

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
