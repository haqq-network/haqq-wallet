import {useState} from 'react';

import {observer} from 'mobx-react';
import {View} from 'react-native';

import {
  Button,
  ButtonVariant,
  KeyboardSafeArea,
  Spacer,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

import {TransactionAmountSingleChainDivider} from './transaction-amount-single-chain-divider';

import {TransactionStore} from '../../transaction-store';
import {
  TransactionAmountCoin,
  TransactionAmountFrom,
  TransactionAmountTo,
} from '../transaction-amount-actions';
import {TransactionAmountInputFrom} from '../transaction-amount-input-from';

export const TransactionAmountSingleChain = observer(() => {
  const {fromAmount, fromAsset, toAsset} = TransactionStore;

  const [error, setError] = useState('');

  return (
    <KeyboardSafeArea style={styles.screen}>
      <Spacer centered>
        <View style={styles.directionContainer}>
          <TransactionAmountFrom />
          <Spacer width={8} />
          <TransactionAmountCoin asset={fromAsset} />
        </View>
        <TransactionAmountInputFrom error={error} setError={setError} />
        <Spacer height={8} />
        <TransactionAmountSingleChainDivider />
        <Spacer height={8} />
        <View style={styles.directionContainer}>
          <TransactionAmountTo />
          <Spacer width={8} />
          <TransactionAmountCoin asset={toAsset} />
        </View>
      </Spacer>
      <Button
        disabled={Boolean(error || !fromAmount)}
        variant={ButtonVariant.contained}
        i18n={I18N.transactionSumPreview}
        onPress={() => {}}
        style={styles.submit}
      />
    </KeyboardSafeArea>
  );
});

const styles = createTheme({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
  },
  directionContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  submit: {
    marginVertical: 16,
  },
});
