import React, {useCallback, useEffect, useState} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {FlatList} from 'react-native';
import {useWallets} from '../contexts/wallets';
import {useTransactions} from '../contexts/transactions';
import {TransactionRow} from '../components/transaction-row';
import {Wallets} from '../components/wallets';
import {prepareTransactions} from '../utils';
import {TransactionList} from '../types';
import {Wallet} from '../models/wallet';
import {TransactionEmpty} from '../components/transaction-empty';

type HomeFeedScreenProp = CompositeScreenProps<any, any>;

export const HomeFeedScreen = ({navigation}: HomeFeedScreenProp) => {
  const wallets = useWallets();
  const transactions = useTransactions();

  const [transactionsList, setTransactionsList] = useState<TransactionList[]>(
    prepareTransactions(wallets.addressList, transactions.transactions),
  );

  const onTransactionList = useCallback(() => {
    setTransactionsList(
      prepareTransactions(wallets.addressList, transactions.transactions),
    );
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

    return () => {
      transactions.off('transactions', onTransactionList);
      wallets.off('backupMnemonic', onBackupMnemonic);
    };
  }, [onBackupMnemonic, onTransactionList, transactions, wallets]);

  useEffect(() => {}, [wallets]);

  return (
    <FlatList
      style={{flex: 1}}
      scrollEnabled={Boolean(transactionsList.length)}
      ListHeaderComponent={Wallets}
      ListEmptyComponent={TransactionEmpty}
      data={transactionsList}
      renderItem={({item}) => (
        <TransactionRow item={item} onPress={onPressRow} />
      )}
      keyExtractor={item => item.hash}
    />
  );
};
