import React, {useCallback, useEffect, useState} from 'react';

import {Collection, CollectionChangeSet} from 'realm';

import {HomeFeed} from '@app/components/home-feed';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {prepareTransactions} from '@app/helpers';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {useTypedNavigation} from '@app/hooks';
import {Transaction} from '@app/models/transaction';
import {Wallet} from '@app/models/wallet';
import {TransactionList} from '@app/types';

export const HomeFeedScreen = () => {
  const navigation = useTypedNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const [transactionsList, setTransactionsList] = useState<TransactionList[]>(
    prepareTransactions(
      Wallet.addressList(),
      Transaction.getAllByProviderId(app.providerId).snapshot(),
    ),
  );

  const onWalletsRefresh = useCallback(() => {
    setRefreshing(true);

    const actions = Wallet.addressList().map(address =>
      awaitForEventDone(Events.onTransactionsLoad, address),
    );

    actions.push(awaitForEventDone(Events.onWalletsBalanceCheck));

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

  const updateTransactionsList = useCallback(() => {
    const transactions = Transaction.getAllByProviderId(app.providerId);
    setTransactionsList(
      prepareTransactions(Wallet.addressList(), transactions.snapshot()),
    );
  }, []);

  const onTransactionsList = useCallback(
    (collection: Collection<Transaction>, changes: CollectionChangeSet) => {
      if (
        changes.insertions.length ||
        changes.newModifications.length ||
        changes.deletions.length
      ) {
        updateTransactionsList();
      }
    },
    [updateTransactionsList],
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

  useEffect(() => {
    app.on(Events.onProviderChanged, updateTransactionsList);

    return () => {
      app.off(Events.onProviderChanged, updateTransactionsList);
    };
  }, [updateTransactionsList]);

  return (
    <HomeFeed
      transactionsList={transactionsList}
      refreshing={refreshing}
      onWalletsRefresh={onWalletsRefresh}
      onPressRow={onPressRow}
    />
  );
};
