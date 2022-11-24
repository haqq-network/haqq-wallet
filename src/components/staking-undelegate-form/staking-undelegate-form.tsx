import React, {useCallback, useMemo, useState} from 'react';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  KeyboardSafeArea,
  Spacer,
  Text,
} from '@app/components/ui';
import {SumBlock} from '@app/components/ui/sum-block';
import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {isNumber} from '@app/utils';
import {WEI} from '@app/variables';

export type StakingDelegateFormProps = {
  balance: number;
  onAmount: (amount: number) => void;
  fee: number;
};

export const StakingUnDelegateForm = ({
  balance,
  onAmount,
  fee,
}: StakingDelegateFormProps) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const onDone = useCallback(() => {
    onAmount(parseFloat(amount));
  }, [amount, onAmount]);

  const onChangeValue = useCallback(
    (value: string) => {
      const sum = value.replace(/,/g, '.');
      setAmount(sum);
      setError(() => {
        if (!isNumber(sum)) {
          return getText(I18N.stakingUnDelegateFormWrongSymbol);
        }
        if (parseFloat(sum) > balance) {
          return getText(I18N.stakingUnDelegateFormNotEnough);
        }

        return '';
      });
    },
    [balance],
  );

  const onPressMax = useCallback(() => {
    setAmount((balance - fee / WEI).toFixed(4));
  }, [fee, balance]);

  const checked = useMemo(
    () =>
      parseFloat(amount) > 0 &&
      balance > 0 &&
      parseFloat(amount) < balance &&
      !error,
    [amount, balance, error],
  );

  console.log('StakingUnDelegateForm', amount, balance);

  return (
    <KeyboardSafeArea isNumeric style={styles.container}>
      <Spacer />
      <SumBlock
        value={amount}
        error={error}
        currency="ISLM"
        balance={balance}
        onChange={onChangeValue}
        onMax={onPressMax}
      />
      <Spacer />
      <Text t14 center color={Color.textBase2}>
        {getText(I18N.stakingUnDelegateFormNetworkFee)}:{' '}
        {(fee / WEI).toFixed(15)} ISLM
      </Text>
      <Button
        style={styles.submit}
        disabled={!checked}
        variant={ButtonVariant.contained}
        title={getText(I18N.stakingUnDelegateFormPreview)}
        onPress={onDone}
      />
    </KeyboardSafeArea>
  );
};

const styles = createTheme({
  container: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  submit: {
    marginVertical: 16,
  },
  subtitle: {
    marginBottom: 4,
  },
});
