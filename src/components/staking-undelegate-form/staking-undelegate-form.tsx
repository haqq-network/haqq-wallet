import React, {useCallback, useMemo, useState} from 'react';

import {View} from 'react-native';

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
import {ValidatorItem} from '@app/types';
import {isNumber} from '@app/utils';
import {WEI} from '@app/variables';

export type StakingDelegateFormProps = {
  maxAmount: number;
  validator: ValidatorItem;
  account: string;
  onAmount: (amount: number) => void;
  fee: number;
};

export const StakingUnDelegateForm = ({
  validator,
  maxAmount,
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
        if (parseFloat(sum) < maxAmount) {
          return getText(I18N.stakingUnDelegateFormNotEnough);
        }

        return '';
      });
    },
    [maxAmount],
  );

  const onPressMax = useCallback(() => {
    setAmount((maxAmount - fee / WEI).toFixed(2));
  }, [fee, maxAmount]);

  const checked = useMemo(
    () =>
      parseFloat(amount) > 0 &&
      maxAmount > 0 &&
      parseFloat(amount) < maxAmount &&
      !error,
    [amount, maxAmount, error],
  );

  return (
    <KeyboardSafeArea isNumeric style={styles.container}>
      <View style={styles.row}>
        <Text t14 i18n={I18N.stakingDelegateFormStakeTo} />
        <Text t10>{validator.description.moniker}</Text>
      </View>
      <SumBlock
        value={amount}
        error={error}
        currency="ISLM"
        balance={maxAmount}
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
