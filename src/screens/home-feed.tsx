import React, {useCallback, useEffect, useState} from 'react';

import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {FlatList, StyleSheet} from 'react-native';

import {useTransactions, useUser, useWallets} from '@app/hooks';

import {TransactionEmpty} from '../components/transaction-empty';
import {TransactionRow} from '../components/transaction-row';
import {Wallets} from '../components/wallets';
import {Transaction} from '../models/transaction';
import {Wallet} from '../models/wallet';
import {RootStackParamList, TransactionList} from '../types';
import {prepareTransactions} from '../utils';

const filterTransactions = (
  transactions: Transaction[],
  providerId: string,
) => {
  return transactions.filter(t => t.providerId === providerId);
};

export const HomeFeedScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
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

  useEffect(() => {}, [wallets]);

  return (
    <FlatList
      key={user.providerId}
      style={page.container}
      refreshing={refreshing}
      onRefresh={onWalletsRefresh}
      scrollEnabled={Boolean(transactionsList.length)}
      ListHeaderComponent={Wallets}
      contentContainerStyle={page.grow}
      ListEmptyComponent={TransactionEmpty}
      data={transactionsList}
      renderItem={({item}) => (
        <TransactionRow item={item} onPress={onPressRow} />
      )}
      keyExtractor={item => item.hash}
    />
  );
};

const page = StyleSheet.create({
  container: {
    flex: 1,
  },
  grow: {flexGrow: 1},
});
