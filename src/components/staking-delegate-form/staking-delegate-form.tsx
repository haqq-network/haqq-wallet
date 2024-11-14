import React, {useCallback, useEffect, useMemo} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  Icon,
  InfoBlock,
  KeyboardSafeArea,
  Spacer,
  Text,
  TextVariant,
} from '@app/components/ui';
import {NetworkFee} from '@app/components/ui/network-fee';
import {SumBlock} from '@app/components/ui/sum-block';
import {createTheme} from '@app/helpers';
import {formatPercents} from '@app/helpers/format-percents';
import {useSumAmount} from '@app/hooks/use-sum-amount';
import {I18N} from '@app/i18n';
import {Balance} from '@app/services/balance';
import {ValidatorItem, ValidatorStatus} from '@app/types';
import {FEE_AMOUNT} from '@app/variables/balance';

export type StakingDelegateFormProps = {
  validator: ValidatorItem;
  account: string;
  onAmount: (amount: number) => void;
  fee?: Balance | null;
  setFee: (amount?: string) => void;
  balance: Balance;
};

export const StakingDelegateForm = ({
  validator: {
    commission: {commission_rates},
    localStatus,
  },
  onAmount,
  fee,
  setFee,
  balance,
}: StakingDelegateFormProps) => {
  const transactionFee = useMemo(
    () => (fee ? fee.max(new Balance(FEE_AMOUNT)) : Balance.Empty),
    [fee],
  );

  const maxAmount = useMemo(() => {
    return balance.operate(transactionFee, 'sub');
  }, [balance, transactionFee]);

  const amounts = useSumAmount(Balance.Empty, maxAmount, new Balance(0.01));

  const validatorCommission = useMemo(() => {
    return formatPercents(commission_rates.rate);
  }, [commission_rates]);

  const onDone = useCallback(() => {
    onAmount(parseFloat(amounts.amount));
  }, [amounts, onAmount]);

  const onPressMax = useCallback(() => {
    amounts.setMax();
  }, [amounts]);

  useEffect(() => {
    Boolean(+amounts.amount) && setFee(amounts.amount);
  }, [setFee, amounts.amount]);

  useEffect(() => {
    const INPUT_PRECISION = 3;
    const first = new Balance(+amounts.amount, INPUT_PRECISION).toEther();
    const second = new Balance(amounts.maxAmount, INPUT_PRECISION).toEther();
    if (first >= second) {
      amounts.setMax();
    }
  }, [amounts.maxAmount.toHex()]);

  return (
    <KeyboardSafeArea isNumeric style={styles.container}>
      <View style={styles.row}>
        <Text
          variant={TextVariant.t14}
          i18n={I18N.stakingDelegateFormCommission}
        />
        <Text variant={TextVariant.t10}>{validatorCommission}%</Text>
      </View>
      <Spacer centered>
        <SumBlock
          value={amounts.amount}
          error={amounts.error}
          balance={balance}
          onChange={amounts.setAmount}
          onMax={onPressMax}
        />
      </Spacer>
      <NetworkFee fee={fee} />
      {localStatus === ValidatorStatus.inactive ||
        (localStatus === ValidatorStatus.jailed && (
          <>
            <Spacer height={8} />
            <InfoBlock
              warning
              i18n={I18N.stakingUnDelegatePreviewJailedAttention}
              icon={<Icon name="warning" color={Color.textYellow1} />}
            />
          </>
        ))}
      <Spacer height={16} />
      <Button
        i18n={I18N.stakingDelegateFormPreview}
        disabled={!amounts.isValid || fee === null}
        variant={ButtonVariant.contained}
        onPress={onDone}
      />
      <Spacer height={16} />
    </KeyboardSafeArea>
  );
};

const styles = createTheme({
  container: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
});
