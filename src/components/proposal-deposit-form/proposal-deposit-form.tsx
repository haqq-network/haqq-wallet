import React, {useCallback, useMemo} from 'react';

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
import {Balance, FEE_AMOUNT} from '@app/services/balance';
import {CURRENCY_NAME} from '@app/variables/common';

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
    const maximumFee = fee.compare(FEE_AMOUNT, 'gt') ? fee : FEE_AMOUNT;
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

  return (
    <KeyboardSafeArea isNumeric style={styles.container}>
      <Spacer />
      <SumBlock
        value={amounts.amount}
        error={amounts.error}
        currency={CURRENCY_NAME}
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
