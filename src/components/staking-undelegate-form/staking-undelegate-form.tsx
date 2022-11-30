import React, {useCallback} from 'react';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  Icon,
  InfoBlock,
  InfoBlockType,
  KeyboardSafeArea,
  Spacer,
  Text,
} from '@app/components/ui';
import {SumBlock} from '@app/components/ui/sum-block';
import {createTheme} from '@app/helpers';
import {useSumAmount} from '@app/hooks/use-sum-amount';
import {I18N, getText} from '@app/i18n';
import {WEI} from '@app/variables';

export type StakingDelegateFormProps = {
  balance: number;
  onAmount: (amount: number) => void;
  fee: number;
};

export const StakingUnDelegateForm = ({
  balance,
  onAmount,
  fee,
}: StakingDelegateFormProps) => {
  const amounts = useSumAmount('', balance - fee / WEI);
  const onDone = useCallback(() => {
    onAmount(parseFloat(amounts.amount));
  }, [amounts, onAmount]);

  const onPressMax = useCallback(() => {
    amounts.setAmount(amounts.maxAmount.toFixed(4));
  }, [amounts]);

  return (
    <KeyboardSafeArea isNumeric style={styles.container}>
      <Spacer style={styles.space}>
        <SumBlock
          value={amounts.amount}
          error={amounts.error}
          currency="ISLM"
          balance={balance}
          onChange={amounts.setAmount}
          onMax={onPressMax}
        />
      </Spacer>
      <Text t14 center color={Color.textBase2}>
        {getText(I18N.stakingUnDelegateFormNetworkFee)}:{' '}
        {(fee / WEI).toFixed(15)} ISLM
      </Text>
      <Spacer height={16} />
      <InfoBlock
        type={InfoBlockType.warning}
        i18n={I18N.stakingUnDelegateSumWarning}
        icon={<Icon name="warning" color={Color.textYellow1} />}
      />
      <Spacer height={16} />
      <Button
        disabled={!amounts.isValid}
        variant={ButtonVariant.contained}
        i18n={I18N.stakingUnDelegateFormPreview}
        onPress={onDone}
      />
      <Spacer height={12} />
    </KeyboardSafeArea>
  );
};

const styles = createTheme({
  container: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  space: {
    justifyContent: 'center',
  },
});
