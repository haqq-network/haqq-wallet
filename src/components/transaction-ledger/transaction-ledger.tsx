import React, {useCallback, useEffect, useState} from 'react';
import {LottieWrap, PopupContainer, Text} from '../ui';
import {Dimensions, StyleSheet} from 'react-native';
import {runUntil} from '../../helpers/run-until';
import {ETH_HD_PATH} from '../../variables';
import {useUser} from '../../contexts/app';
import {useTransactions} from '../../contexts/transactions';
import {useWallet} from '../../contexts/wallets';
import {EthNetwork} from '../../services/eth-network';
import {TransactionResponse} from '@ethersproject/abstract-provider';

export type TransactionVerifyProps = {
  from: string;
  to: string;
  amount: number;
  onDone: (transaction: TransactionResponse) => void;
};

export const TransactionLedger = ({
  from,
  to,
  amount,
  onDone,
}: TransactionVerifyProps) => {
  const wallet = useWallet(from);
  const [error, setError] = useState('');

  const run = useCallback(async () => {
    if (wallet) {
      try {
        const ethNetworkProvider = new EthNetwork(wallet);

        const transaction = await ethNetworkProvider.sendTransaction(
          to,
          amount,
        );

        if (transaction) {
          onDone(transaction);
        }
      } catch (e) {
        console.log('onDone', e);
        if (e instanceof Error) {
          setError(e.message);
        }
      }
    }
  }, [wallet, to, amount, onDone]);

  useEffect(() => {
    run();
  }, [run]);

  return (
    <PopupContainer style={styles.container}>
      <Text t9>Open ledger and confirm operation</Text>
      <LottieWrap
        style={styles.lottie}
        source={require('../../../assets/animations/ledger-verify.json')}
        autoPlay
        loop={false}
      />
    </PopupContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: Dimensions.get('window').width,
  },
});
