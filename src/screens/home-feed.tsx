import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {Collection, CollectionChangeSet} from 'realm';

import {HomeFeed} from '@app/components/home-feed';
import {createNftCollectionSet} from '@app/components/nft-viewer/mock';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {prepareTransactions} from '@app/helpers';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {useTypedNavigation} from '@app/hooks';
import {Transaction} from '@app/models/transaction';
import {Wallet} from '@app/models/wallet';
import {TokenItem, TransactionList} from '@app/types';

const MOCK_TOKENS: TokenItem[] = [
  {
    name: 'Etherium',
    ticker: 'ETH',
    icon: 'https://i.ibb.co/1v7WQDv/Ethereum-ETH.png',
    count: 0.0013,
    priceUsd: 1500,
  },
  {
    name: 'Bitcoin',
    ticker: 'BTC',
    icon: 'https://i.ibb.co/Z6ftjmX/Bitcoin-BTC.png',
    count: 2.5,
    priceUsd: 30000,
  },
];

export const HomeFeedScreen = () => {
  const nftCollections = useRef(createNftCollectionSet()).current;
  const navigation = useTypedNavigation();
  const [refreshing, setRefreshing] = useState(false);

  // TODO:
  const islmPrice = useMemo(
    () => MOCK_TOKENS.find(it => it.ticker === 'ISLM')?.priceUsd ?? 0,
    [],
  );

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

  const onPressTransactionRow = useCallback(
    (hash: string) => {
      navigation.navigate('transactionDetail', {
        hash,
      });
    },
    [navigation],
  );

  const onPressTokenRow = useCallback((tiker: string) => {
    Logger.log('token row pressed', tiker);
  }, []);

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
      islmPrice={islmPrice}
      transactionsList={transactionsList}
      nftColletionsList={nftCollections}
      tokensList={MOCK_TOKENS}
      refreshing={refreshing}
      onWalletsRefresh={onWalletsRefresh}
      onPressTransactionRow={onPressTransactionRow}
      onPressTokenRow={onPressTokenRow}
    />
  );
};
