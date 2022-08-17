import React, {useEffect, useState} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import {FlatList, Modal} from 'react-native';
import {useWallets} from '../contexts/wallets';
import {Container} from '../components/container';
import {BackupScreen} from './backup-anim';
import {useTransactions} from '../contexts/transactions';
import {TransactionPreview} from '../components/transaction-preview';
import {Wallets} from '../components/wallets';
import {prepareTransactions} from '../utils';
import {TransactionList} from '../types';

type HomeFeedScreenProp = CompositeScreenProps<any, any>;

export const HomeFeedScreen = ({}: HomeFeedScreenProp) => {
  const wallets = useWallets();
  const transactions = useTransactions();

  const [transactionsList, setTransactionsList] = useState<TransactionList[]>(
    prepareTransactions(
      wallets.getMain()?.address ?? '',
      transactions.getTransactions(wallets.getMain()?.address ?? ''),
    ),
  );

  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const callback = () => {
      setTransactionsList(
        prepareTransactions(
          wallets.getMain()?.address ?? '',
          transactions.getTransactions(wallets.getMain()?.address ?? ''),
        ),
      );
    };

    transactions.on('transactions', callback);
    wallets.on('wallets', callback);

    return () => {
      transactions.off('transactions', callback);
      wallets.off('wallets', callback);
    };
  }, [transactions, wallets]);

  return (
    <Container>
      <FlatList
        ListHeaderComponent={Wallets}
        data={transactionsList}
        renderItem={TransactionPreview}
        keyExtractor={item => item.hash}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}>
        <BackupScreen
          onClose={() => {
            setModalVisible(false);
          }}
        />
      </Modal>
    </Container>
  );
};
