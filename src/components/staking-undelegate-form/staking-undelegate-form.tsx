import React, {useCallback, useMemo} from 'react';

import {formatDistance} from 'date-fns';

import {Color} from '@app/colors';
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

export type StakingDelegateFormProps = {
  balance: number;
  onAmount: (amount: number) => void;
  fee: number;
  unboundingTime: number;
};

export const StakingUnDelegateForm = ({
  unboundingTime,
  balance,
  onAmount,
  fee,
}: StakingDelegateFormProps) => {
  const amounts = useSumAmount(0, balance);
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

  return (
    <KeyboardSafeArea isNumeric style={styles.container}>
      <Spacer centered>
        <SumBlock
          value={amounts.amount}
          error={amounts.error}
          currency="ISLM"
          balance={balance}
          onChange={amounts.setAmount}
          onMax={onPressMax}
        />
      </Spacer>
      <NetworkFee fee={fee} />
      <Spacer height={16} />
      <InfoBlock
        warning
        i18n={I18N.stakingUnDelegateSumWarning}
        i18params={{time}}
        icon={<Icon name="warning" color={Color.textYellow1} />}
      />
      <Spacer height={16} />
      <Button
        disabled={!amounts.isValid}
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
