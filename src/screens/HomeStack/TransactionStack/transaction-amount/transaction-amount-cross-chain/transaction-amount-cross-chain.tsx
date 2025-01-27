import {useMemo, useState} from 'react';

import {observer} from 'mobx-react';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  KeyboardSafeArea,
  Spacer,
  Text,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {Balance} from '@app/services/balance';

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
    const {fromAmount, fromAsset, toAsset, quoteError} = TransactionStore;

    const [error, setError] = useState('');

    const rateBalance = useMemo(
      () =>
        new Balance(
          1,
          fromAsset?.decimals ?? undefined,
          fromAsset?.symbol ?? undefined,
        ),
      [fromAsset],
    );
    const disabled = useMemo(
      () => Boolean(error || quoteError || !fromAmount),
      [error, quoteError, fromAmount],
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
          <Spacer height={20} />
          <Text
            variant={TextVariant.t14}
            color={Color.textBase2}
            i18n={I18N.rateInfo}
            i18params={{
              token: rateBalance.toBalanceString(),
              fiat: rateBalance.toFiat(),
            }}
          />
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
