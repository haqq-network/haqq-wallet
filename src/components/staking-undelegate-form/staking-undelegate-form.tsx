import React, {useCallback, useEffect, useMemo} from 'react';

import {formatDistance} from 'date-fns';

import {
  Button,
  ButtonVariant,
  Icon,
  InfoBlock,
  KeyboardSafeArea,
  NetworkFee,
  Spacer,
} from '@app/components/ui';
import {SumBlock} from '@app/components/ui/sum-block';
import {createTheme} from '@app/helpers';
import {useSumAmount} from '@app/hooks/use-sum-amount';
import {I18N} from '@app/i18n';
import {Balance} from '@app/services/balance';
import {Color} from '@app/theme';
import {CURRENCY_NAME} from '@app/variables/common';

export type StakingDelegateFormProps = {
  balance: Balance;
  onAmount: (amount: number) => void;
  fee?: Balance | null;
  setFee: (amount?: string) => void;
  unboundingTime: number;
};

export const StakingUnDelegateForm = ({
  unboundingTime,
  balance,
  onAmount,
  fee,
  setFee,
}: StakingDelegateFormProps) => {
  const amounts = useSumAmount(Balance.Empty, balance);

  const onDone = useCallback(() => {
    onAmount(parseFloat(amounts.amount));
  }, [amounts, onAmount]);

  const time = useMemo(
    () => formatDistance(new Date(unboundingTime), new Date(0)),
    [unboundingTime],
  );

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
      <Spacer centered>
        <SumBlock
          value={amounts.amount}
          error={amounts.error}
          currency={CURRENCY_NAME}
          balance={balance}
          onChange={amounts.setAmount}
          onMax={onPressMax}
        />
      </Spacer>
      <NetworkFee fee={fee} currency="ISLM" />
      <Spacer height={16} />
      <InfoBlock
        warning
        i18n={I18N.stakingUnDelegateSumWarning}
        i18params={{time}}
        icon={<Icon name="warning" color={Color.textYellow1} />}
      />
      <Spacer height={16} />
      <Button
        disabled={!amounts.isValid || fee === null}
        variant={ButtonVariant.contained}
        i18n={I18N.stakingUnDelegateFormPreview}
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
    paddingVertical: 16,
  },
});
