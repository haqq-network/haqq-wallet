import React, {useCallback, useEffect, useRef, useState} from 'react';
import {LottieWrap, PopupContainer, Text} from '../ui';
import {Dimensions, StyleSheet} from 'react-native';
import {useWallet} from '../../contexts/wallets';
import {EthNetwork} from '../../services/eth-network';
import {TransactionResponse} from '@ethersproject/abstract-provider';
import {BleManager, State} from 'react-native-ble-plx';
import {getText, I18N} from '../../i18n';

export type TransactionVerifyProps = {
  from: string;
  to: string;
  amount: number;
  onDone: (transaction: TransactionResponse) => void;
};

const disabled = [State.PoweredOff, State.Unauthorized];

export const TransactionLedger = ({
  from,
  to,
  amount,
  onDone,
}: TransactionVerifyProps) => {
  const wallet = useWallet(from);
  const bleManager = useRef(new BleManager()).current;

  const [btState, setBtState] = useState(State.Unknown);

  const run = useCallback(async () => {
    if (wallet && btState === State.PoweredOn) {
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
      }
    }
  }, [wallet, btState, to, amount, onDone]);

  const onChange = useCallback(async () => {
    const state = await bleManager.state();
    setBtState(state);
    run();
  }, [bleManager, run]);

  useEffect(() => {
    const sub = bleManager.onStateChange(onChange, true);
    onChange();
    return () => {
      sub.remove();
    };
  }, [bleManager, onChange, run]);

  return (
    <PopupContainer style={styles.container}>
      {disabled.includes(btState) ? (
        <Text t9>{getText(I18N.transactionLedgerBluetoothDisabled)}</Text>
      ) : (
        <>
          <Text t9>{getText(I18N.transactionLedgerBluetoothConfirmation)}</Text>
          <LottieWrap
            style={styles.lottie}
            source={require('../../../assets/animations/ledger-verify.json')}
            autoPlay
            loop={false}
          />
        </>
      )}
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
