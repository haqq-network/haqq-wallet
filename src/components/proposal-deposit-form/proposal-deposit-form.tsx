import React, {useCallback, useEffect, useMemo} from 'react';

import {
  Button,
  ButtonVariant,
  KeyboardSafeArea,
  Spacer,
} from '@app/components/ui';
import {NetworkFee} from '@app/components/ui/network-fee';
import {SumBlock} from '@app/components/ui/sum-block';
import {createTheme} from '@app/helpers';
import {useSumAmount} from '@app/hooks/use-sum-amount';
import {I18N} from '@app/i18n';
import {Balance} from '@app/services/balance';
import {FEE_AMOUNT} from '@app/variables/balance';

export type ProposalDepositFormProps = {
  account: string;
  onAmount: (amount: number) => void;
  fee: Balance;
  balance: Balance;
};

export const ProposalDepositForm = ({
  onAmount,
  fee,
  balance,
}: ProposalDepositFormProps) => {
  const transactionFee = useMemo(() => {
    const maximumFee = fee.compare(new Balance(FEE_AMOUNT), 'gt')
      ? fee
      : new Balance(FEE_AMOUNT);
    return new Balance(maximumFee);
  }, [fee]);
  const amounts = useSumAmount(
    Balance.Empty,
    balance.operate(transactionFee, 'sub'),
  );

  const onDone = useCallback(() => {
    onAmount(parseFloat(amounts.amount));
  }, [amounts, onAmount]);

  const onPressMax = useCallback(() => {
    amounts.setMax();
  }, [amounts]);

  useEffect(() => {
    const INPUT_PRECISION = 3;
    const first = new Balance(+amounts.amount, INPUT_PRECISION)
      .toEther()
      .toPrecision(INPUT_PRECISION);
    const second = new Balance(amounts.maxAmount, INPUT_PRECISION)
      .toEther()
      .toPrecision(INPUT_PRECISION);
    if (first >= second) {
      amounts.setMax();
    }
  }, [fee, amounts.maxAmount.toHex()]);

  return (
    <KeyboardSafeArea isNumeric style={styles.container}>
      <Spacer />
      <SumBlock
        value={amounts.amount}
        error={amounts.error}
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
  submit: {
    marginVertical: 16,
  },
});
