import React, {useEffect, useRef} from 'react';

import {TransactionResponse} from '@ethersproject/abstract-provider';
import {useWindowDimensions} from 'react-native';

import {LottieWrap, PopupContainer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {useWallet} from '@app/hooks';
import {I18N} from '@app/i18n';
import {EthNetwork} from '@app/services/eth-network';

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
  const ethNetworkProvider = useRef(new EthNetwork(wallet!)).current;
  const screenWidth = useWindowDimensions().width;
  useEffect(() => {
    requestAnimationFrame(async () => {
      try {
        const transaction = await ethNetworkProvider.sendTransaction(
          to,
          amount,
        );

        if (transaction) {
          onDone(transaction);
        }
      } catch (e) {
        console.log('onDone', e);
      }
    });
    return () => {
      ethNetworkProvider.stop = true;
    };
  }, [amount, ethNetworkProvider, onDone, to]);

  return (
    <PopupContainer style={styles.container}>
      <Text i18n={I18N.transactionLedgerBluetoothConfirmation} t9 center />
      <LottieWrap
        style={{width: screenWidth}}
        source={require('../../../assets/animations/transaction-ledger.json')}
        autoPlay
        loop={false}
      />
    </PopupContainer>
  );
};

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
