import React, {useCallback, useEffect, useMemo, useState} from 'react';

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
import {formatPercents} from '@app/helpers/format-percents';
import {I18N, getText} from '@app/i18n';
import {EthNetwork} from '@app/services';
import {ValidatorItem} from '@app/types';
import {isNumber} from '@app/utils';
import {WEI} from '@app/variables';

export type StakingDelegateFormProps = {
  validator: ValidatorItem;
  account: string;
  onAmount: (amount: number) => void;
  fee: number;
};

export const StakingDelegateForm = ({
  validator,
  account,
  onAmount,
  fee,
}: StakingDelegateFormProps) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [balance, setBalance] = useState(0);
  const [maxSum, setMaxSum] = useState(0);

  const validatorCommission = useMemo(() => {
    return formatPercents(validator.commission.commission_rates.rate);
  }, [validator.commission.commission_rates]);

  useEffect(() => {
    EthNetwork.getBalance(account).then(newBalance => {
      setBalance(newBalance);
      setMaxSum(newBalance);
    });
  }, [account]);

  const onDone = useCallback(() => {
    onAmount(parseFloat(amount));
  }, [amount, onAmount]);

  const onChangeValue = useCallback(
    (value: string) => {
      const sum = value.replace(/,/g, '.');
      setAmount(sum);
      setError(() => {
        if (!isNumber(sum)) {
          return getText(I18N.stakingDelegateFormWrongSymbol);
        }
        if (parseFloat(sum) > balance) {
          return getText(I18N.stakingDelegateFormNotEnough);
        }

        return '';
      });
    },
    [balance],
  );

  const onPressMax = useCallback(() => {
    setAmount((maxSum - fee / WEI).toFixed(2));
  }, [fee, maxSum]);

  const checked = useMemo(
    () =>
      parseFloat(amount) > 0 &&
      balance > 0 &&
      parseFloat(amount) < balance &&
      !error,
    [error, amount, balance],
  );

  return (
    <KeyboardSafeArea isNumeric style={styles.container}>
      <View style={styles.row}>
        <Text t14 i18n={I18N.stakingDelegateFormStakeTo} />
        <Text t10>{validator.description.moniker}</Text>
      </View>
      <View style={styles.row}>
        <Text t14 i18n={I18N.stakingDelegateFormCommission} />
        <Text t10>{validatorCommission}%</Text>
      </View>
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
        {getText(I18N.stakingDelegateFormNetworkFee)}: {(fee / WEI).toFixed(15)}{' '}
        ISLM
      </Text>
      <Button
        style={styles.submit}
        disabled={!checked}
        variant={ButtonVariant.contained}
        title={getText(I18N.stakingDelegateFormPreview)}
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
