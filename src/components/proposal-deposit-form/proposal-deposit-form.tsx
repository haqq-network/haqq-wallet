import React, {useCallback} from 'react';

import {StyleSheet} from 'react-native';

import {
  Button,
  ButtonVariant,
  KeyboardSafeArea,
  Spacer,
} from '@app/components/ui';
import {NetworkFee} from '@app/components/ui/network-fee';
import {SumBlock} from '@app/components/ui/sum-block';
import {useSumAmount} from '@app/hooks/use-sum-amount';
import {I18N} from '@app/i18n';
import {WEI} from '@app/variables/common';

export type ProposalDepositFormProps = {
  account: string;
  onAmount: (amount: number) => void;
  fee: number;
  balance: number;
};

export const ProposalDepositForm = ({
  onAmount,
  fee,
  balance,
}: ProposalDepositFormProps) => {
  const amounts = useSumAmount(0, balance - Math.max(fee / WEI, 0.00001));

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

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  submit: {
    marginVertical: 16,
  },
});
