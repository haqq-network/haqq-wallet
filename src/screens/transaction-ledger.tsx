import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {PopupContainer, Spacer, Text} from '../components/ui';
import {useTransactions} from '../contexts/transactions';
import {useWallet} from '../contexts/wallets';
import {EthNetwork} from '../services/eth-network';

export const TransactionLedgerScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'transactionConfirmation'>>();
  const {from, to, amount, fee} = route.params;
  const transactions = useTransactions();
  const wallet = useWallet(from);
  const [error, setError] = useState('');

  const onDone = useCallback(async () => {
    if (wallet) {
      try {
        const ethNetworkProvider = new EthNetwork(wallet);

        const transaction = await ethNetworkProvider.sendTransaction(
          to,
          amount,
        );

        if (transaction) {
          await transactions.saveTransaction(
            transaction,
            from,
            to,
            amount,
            fee,
          );
          console.log('transaction', transaction);

          navigation.navigate('transactionFinish', {
            hash: transaction.hash,
          });
        }
      } catch (e) {
        console.log('onDone', e);
        if (e instanceof Error) {
          setError(e.message);
        }
      }
    }
  }, [wallet, navigation, from, to, amount, transactions, fee]);

  useEffect(() => {
    onDone();
  }, [onDone]);

  return (
    <PopupContainer style={page.container}>
      <Text>{error}</Text>
      <Text>Open ledger and confirm operation</Text>
      <Spacer />
    </PopupContainer>
  );
};

const page = StyleSheet.create({
  container: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
});
