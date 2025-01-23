import {useMemo, useState} from 'react';

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

import {TransactionAmountCrossChainDivider} from './transaction-amount-cross-chain-divider';

import {TransactionStore} from '../../transaction-store';
import {
  TransactionAmountCoin,
  TransactionAmountFrom,
  TransactionAmountTo,
} from '../transaction-amount-actions';
import {TransactionAmountInputFrom} from '../transaction-amount-input-from';
import {TransactionAmountInputTo} from '../transaction-amount-input-to';
import {TransactionAmountProps} from '../transaction-amount.types';

export const TransactionAmountCrossChain = observer(
  ({onPreviewPress}: TransactionAmountProps) => {
    const {fromAmount, fromAsset, toAsset} = TransactionStore;

    const [error, setError] = useState('');

    const disabled = useMemo(
      () => Boolean(error || !fromAmount),
      [error, fromAmount],
    );

    return (
      <KeyboardSafeArea style={styles.screen}>
        <Spacer centered>
          <View style={styles.directionContainer}>
            <View style={styles.actions}>
              <TransactionAmountFrom />
              <Spacer height={8} />
              <TransactionAmountCoin asset={fromAsset} />
            </View>
            <TransactionAmountInputFrom
              alignItems="flex-end"
              error={error}
              setError={setError}
            />
          </View>
          <Spacer height={24} />
          <TransactionAmountCrossChainDivider />
          <Spacer height={24} />
          <View style={styles.directionContainer}>
            <View style={styles.actions}>
              <TransactionAmountTo />
              <Spacer height={8} />
              <TransactionAmountCoin asset={toAsset} />
            </View>
            <TransactionAmountInputTo alignItems="flex-end" />
          </View>
        </Spacer>
        <Button
          disabled={disabled}
          variant={ButtonVariant.contained}
          i18n={I18N.transactionSumPreview}
          onPress={onPreviewPress}
          style={styles.submit}
        />
      </KeyboardSafeArea>
    );
  },
);

const styles = createTheme({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
  },
  directionContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actions: {
    alignItems: 'flex-start',
  },
  submit: {
    marginVertical: 16,
  },
});
