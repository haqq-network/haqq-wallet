import React, {useCallback, useEffect, useState} from 'react';

import {FlatList, StyleSheet} from 'react-native';

import {TransactionEmpty} from '@app/components/transaction-empty';
import {TransactionRow} from '@app/components/transaction-row';
import {Wallets} from '@app/components/wallets';
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

export const HomeFeed = () => {
  const navigation = useTypedNavigation();
  const user = useUser();

  const wallets = useWallets();
  const transactions = useTransactions();

  const [refreshing, setRefreshing] = useState(false);

  const [transactionsList, setTransactionsList] = useState<TransactionList[]>(
    prepareTransactions(
      wallets.addressList,
      filterTransactions(transactions.transactions, user.providerId),
    ),
  );

  const onWalletsRefresh = useCallback(() => {
    setRefreshing(true);

    const actions = wallets.addressList.map(address =>
      transactions.loadTransactionsFromExplorer(address),
    );

    actions.push(wallets.checkBalance());

    Promise.all(actions).then(() => {
      setRefreshing(false);
    });
  }, [transactions, wallets]);

  const onTransactionList = useCallback(() => {
    setTransactionsList(
      prepareTransactions(
        wallets.addressList,
        filterTransactions(transactions.transactions, user.providerId),
      ),
    );
  }, [wallets.addressList, transactions.transactions, user.providerId]);

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
    <FlatList
      key={user.providerId}
      style={styles.container}
      refreshing={refreshing}
      onRefresh={onWalletsRefresh}
      scrollEnabled={Boolean(transactionsList.length)}
      ListHeaderComponent={Wallets}
      contentContainerStyle={styles.grow}
      ListEmptyComponent={TransactionEmpty}
      data={transactionsList}
      renderItem={({item}) => (
        <TransactionRow item={item} onPress={onPressRow} />
      )}
      keyExtractor={item => item.hash}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grow: {flexGrow: 1},
});
