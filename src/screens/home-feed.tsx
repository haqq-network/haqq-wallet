import React, {useCallback, useEffect, useState} from 'react';

import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {FlatList} from 'react-native';

import {TransactionEmpty} from '../components/transaction-empty';
import {TransactionRow} from '../components/transaction-row';
import {Wallets} from '../components/wallets';
import {useTransactions} from '../contexts/transactions';
import {useWallets} from '../contexts/wallets';
import {createTheme} from '../helpers/create-theme';
import {useTheme} from '../hooks/use-theme';
import {useUser} from '../hooks/use-user';
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
  const theme = useTheme();
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
      key={`${user.providerId}_${theme}`}
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

const page = createTheme({
  container: {
    flex: 1,
  },
  grow: {flexGrow: 1},
});
