import {observer} from 'mobx-react';
import {View} from 'react-native';

import {Spacer} from '@app/components/ui';
import {createTheme} from '@app/helpers';

import {TransactionStore} from '../../transaction-store';
import {
  TransactionAmountCoin,
  TransactionAmountFrom,
  TransactionAmountTo,
} from '../transaction-amount-actions';
import {TransactionAmountInputFrom} from '../transaction-amount-input-from';
import {TransactionAmountInputTo} from '../transaction-amount-input-to';

export const TransactionAmountCrossChain = observer(() => {
  const {fromAsset, toAsset} = TransactionStore;

  return (
    <Spacer centered>
      <View style={styles.directionContainer}>
        <View style={styles.actions}>
          <TransactionAmountFrom />
          <Spacer height={8} />
          <TransactionAmountCoin asset={fromAsset} />
        </View>
        <TransactionAmountInputFrom alignItems="flex-end" />
      </View>
      <Spacer height={8} />
      <View style={styles.directionContainer}>
        <View style={styles.actions}>
          <TransactionAmountTo />
          <Spacer height={8} />
          <TransactionAmountCoin asset={toAsset} />
        </View>
        <TransactionAmountInputTo alignItems="flex-end" />
      </View>
    </Spacer>
  );
});

const styles = createTheme({
  directionContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actions: {
    alignItems: 'flex-start',
  },
});
