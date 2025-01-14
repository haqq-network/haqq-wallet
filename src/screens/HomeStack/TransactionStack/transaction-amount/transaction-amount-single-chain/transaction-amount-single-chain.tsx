import {observer} from 'mobx-react';
import {KeyboardAvoidingView, View} from 'react-native';

import {Spacer} from '@app/components/ui';
import {createTheme} from '@app/helpers';

import {TransactionAmountSingleChainInput} from './transaction-amount-single-chain-input';

import {TransactionStore} from '../../transaction-store';
import {
  TransactionAmountCoin,
  TransactionAmountFrom,
  TransactionAmountTo,
} from '../transaction-amount-actions';

export const TransactionAmountSingleChain = observer(() => {
  const {fromAsset, toAsset} = TransactionStore;

  return (
    <KeyboardAvoidingView style={styles.container}>
      <Spacer centered>
        <View style={styles.directionContainer}>
          <TransactionAmountFrom />
          <Spacer width={8} />
          <TransactionAmountCoin asset={fromAsset} />
        </View>
        <TransactionAmountSingleChainInput />
        <View style={styles.directionContainer}>
          <TransactionAmountTo />
          <Spacer width={8} />
          <TransactionAmountCoin asset={toAsset} />
        </View>
      </Spacer>
    </KeyboardAvoidingView>
  );
});

const styles = createTheme({
  container: {
    flex: 1,
  },
  directionContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
});
