import React, {useCallback, useEffect, useState} from 'react';

import {HomeFeed} from '@app/components/home-feed';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {
  useTransactions,
  useTypedNavigation,
  useUser,
  useWallets,
} from '@app/hooks';
import {Transaction} from '@app/models/transaction';
import {Wallet} from '@app/models/wallet';
import {TransactionList} from '@app/types';
import {prepareTransactions} from '@app/utils';

const filterTransactions = (
  transactions: Transaction[],
  providerId: string,
) => {
  return transactions.filter(
    t => t.providerId === providerId || t.providerId === '',
  );
};

export const HomeFeedScreen = () => {
  const navigation = useTypedNavigation();
  const transactions = useTransactions();
  const wallets = useWallets();
  const user = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [transactionsList, setTransactionsList] = useState<TransactionList[]>(
    prepareTransactions(
      wallets.addressList,
      filterTransactions(transactions.transactions, user.providerId),
    ),
  );

  const onTransactionList = useCallback(() => {
    setTransactionsList(
      prepareTransactions(
        wallets.addressList,
        filterTransactions(transactions.transactions, user.providerId),
      ),
    );
  }, [wallets.addressList, transactions.transactions, user.providerId]);
  const onWalletsRefresh = useCallback(() => {
    setRefreshing(true);

    const actions = wallets.addressList.map(address =>
      transactions.loadTransactionsFromExplorer(address),
    );

    actions.push(
      new Promise(resolve => {
        app.emit(Events.onWalletsBalanceCheck, wallets.addressList, resolve);
      }),
    );

    Promise.all(actions).then(() => {
      setRefreshing(false);
    });
  }, [transactions, wallets]);

  const onBackupMnemonic = useCallback(
    (wallet: Wallet) => {
      navigation.navigate('backupNotification', {address: wallet.address});
    },
    [navigation],
  );

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
    wallets.on('backupMnemonic', onBackupMnemonic);
    user.on('change', onTransactionList);
    return () => {
      transactions.off('transactions', onTransactionList);
      wallets.off('backupMnemonic', onBackupMnemonic);
      user.off('change', onTransactionList);
    };
  }, [onBackupMnemonic, onTransactionList, transactions, user, wallets]);
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
