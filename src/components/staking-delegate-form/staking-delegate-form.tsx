import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {View} from 'react-native';

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

export type StakingDelegateFormProps = {
  validator: ValidatorItem;
  account: string;
  onAmount: (amount: number) => void;
};

export const StakingDelegateForm = ({
  validator,
  account,
  onAmount,
}: StakingDelegateFormProps) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [balance, setBalance] = useState(0);

  const validatorCommission = useMemo(() => {
    return formatPercents(validator.commission.commission_rates.rate);
  }, [validator.commission.commission_rates]);

  useEffect(() => {
    EthNetwork.getBalance(account).then(newBalance => {
      setBalance(newBalance);
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
          return getText(I18N.stakingDelegateWrongSymbol);
        }
        if (parseFloat(sum) > balance) {
          return getText(I18N.stakingDelegateNotEnough);
        }

        return '';
      });
    },
    [balance],
  );

  const onPressMax = useCallback(() => {
    setAmount(balance.toFixed(8));
  }, [balance]);

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
        <Text t14 i18n={I18N.stakingDelegateStakeTo} />
        <Text t10>{validator.description.moniker}</Text>
      </View>
      <View style={styles.row}>
        <Text t14 i18n={I18N.stakingDelegateCommission} />
        <Text t10>{validatorCommission}%</Text>
      </View>
      <Spacer>
        <SumBlock
          value={amount}
          error={error}
          currency="ISLM"
          balance={balance}
          onChange={onChangeValue}
          onMax={onPressMax}
        />
      </Spacer>
      <Button
        style={styles.submit}
        disabled={!checked}
        variant={ButtonVariant.contained}
        title={getText(I18N.stakingDelegatePreview)}
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
