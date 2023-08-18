import React, {useCallback, useMemo, useRef, useState} from 'react';

import {HomeFeed} from '@app/components/home-feed';
import {createNftCollectionSet} from '@app/components/nft-viewer/mock';
import {Events} from '@app/events';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {useTypedNavigation} from '@app/hooks';
import {useTransactionList} from '@app/hooks/use-transaction-list';
import {Wallet} from '@app/models/wallet';
import {TokenItem} from '@app/types';

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
  const adressList = useMemo(() => Wallet.addressList(), []);
  const transactionsList = useTransactionList(adressList);

  // TODO:
  const islmPrice = useMemo(
    () => MOCK_TOKENS.find(it => it.ticker === 'ISLM')?.priceUsd ?? 0,
    [],
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
