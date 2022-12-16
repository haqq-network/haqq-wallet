import React, {useCallback, useMemo} from 'react';

import {View} from 'react-native';

import {
  Button,
  ButtonVariant,
  KeyboardSafeArea,
  Spacer,
  Text,
} from '@app/components/ui';
import {NetworkFee} from '@app/components/ui/network-fee';
import {SumBlock} from '@app/components/ui/sum-block';
import {createTheme} from '@app/helpers';
import {formatPercents} from '@app/helpers/format-percents';
import {useSumAmount} from '@app/hooks/use-sum-amount';
import {I18N} from '@app/i18n';
import {ValidatorItem} from '@app/types';
import {WEI} from '@app/variables';

export type StakingDelegateFormProps = {
  validator: ValidatorItem;
  account: string;
  onAmount: (amount: number) => void;
  fee: number;
  balance: number;
};

export const StakingDelegateForm = ({
  validator: {
    commission: {commission_rates},
    description,
  },
  onAmount,
  fee,
  balance,
}: StakingDelegateFormProps) => {
  const amounts = useSumAmount(0, balance - Math.max(fee / WEI, 0.00001));

  const validatorCommission = useMemo(() => {
    return formatPercents(commission_rates.rate);
  }, [commission_rates]);

  const onDone = useCallback(() => {
    onAmount(parseFloat(amounts.amount));
  }, [amounts, onAmount]);

  const onPressMax = useCallback(() => {
    amounts.setMax();
  }, [amounts]);

  return (
    <KeyboardSafeArea isNumeric style={styles.container}>
      <View style={styles.row}>
        <Text t14 i18n={I18N.stakingDelegateFormStakeTo} />
        <Text t10>{description.moniker}</Text>
      </View>
      <View style={styles.row}>
        <Text t14 i18n={I18N.stakingDelegateFormCommission} />
        <Text t10>{validatorCommission}%</Text>
      </View>
      <SumBlock
        value={amounts.amount}
        error={amounts.error}
        currency="ISLM"
        balance={balance}
        onChange={amounts.setAmount}
        onMax={onPressMax}
      />
      <Spacer />
      <NetworkFee fee={fee} />
      <Button
        i18n={I18N.stakingDelegateFormPreview}
        style={styles.submit}
        disabled={!amounts.isValid}
        variant={ButtonVariant.contained}
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
});
