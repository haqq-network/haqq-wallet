import {observer} from 'mobx-react';
import {KeyboardAvoidingView, View} from 'react-native';

import {Spacer} from '@app/components/ui';
import {createTheme} from '@app/helpers';

import {
  TransactionAmountCoin,
  TransactionAmountFrom,
  TransactionAmountTo,
} from './actions';

import {TransactionStore} from '../transaction-store';

export const TransactionAmountSingleChain = observer(() => {
  const {fromAsset, toAsset} = TransactionStore;
  return (
    <KeyboardAvoidingView style={styles.container}>
      <View style={styles.directionContainer}>
        <TransactionAmountFrom />
        <Spacer width={8} />
        <TransactionAmountCoin asset={fromAsset} />
      </View>
      <View style={styles.directionContainer}>
        <TransactionAmountTo />
        <Spacer width={8} />
        <TransactionAmountCoin asset={toAsset} />
      </View>
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
