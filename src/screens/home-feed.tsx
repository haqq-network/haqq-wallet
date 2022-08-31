import React, {useCallback, useEffect, useState} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {FlatList} from 'react-native';
import {useWallets} from '../contexts/wallets';
import {useTransactions} from '../contexts/transactions';
import {TransactionPreview} from '../components/transaction-preview';
import {Wallets} from '../components/wallets';
import {prepareTransactions} from '../utils';
import {TransactionList} from '../types';
import {Wallet} from '../models/wallet';

type HomeFeedScreenProp = CompositeScreenProps<any, any>;

export const HomeFeedScreen = ({navigation}: HomeFeedScreenProp) => {
  const wallets = useWallets();
  const transactions = useTransactions();

  const [transactionsList, setTransactionsList] = useState<TransactionList[]>(
    prepareTransactions(
      wallets.getMain()?.address ?? '',
      transactions.getTransactions(wallets.getMain()?.address ?? ''),
    ),
  );

  const onTransactionList = useCallback(() => {
    setTransactionsList(
      prepareTransactions(
        wallets.getMain()?.address ?? '',
        transactions.getTransactions(wallets.getMain()?.address ?? ''),
      ),
    );
  }, [transactions, wallets]);

  const onBackupMnemonic = useCallback(
    (wallet: Wallet) => {
      navigation.navigate('backupNotification', {address: wallet.address});
    },
    [navigation],
  );

  useEffect(() => {
    transactions.on('transactions', onTransactionList);
    wallets.on('wallets', onTransactionList);

    wallets.on('backupMnemonic', onBackupMnemonic);

    return () => {
      transactions.off('transactions', onTransactionList);
      wallets.off('wallets', onTransactionList);
      wallets.off('backupMnemonic', onBackupMnemonic);
    };
  }, [onBackupMnemonic, onTransactionList, transactions, wallets]);

  useEffect(() => {}, [wallets]);

  return (
    <FlatList
      style={{flex: 1}}
      ListHeaderComponent={Wallets}
      data={transactionsList}
      renderItem={TransactionPreview}
      keyExtractor={item => item.hash}
    />
  );
};
