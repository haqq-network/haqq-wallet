import React, {useCallback, useMemo} from 'react';

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
} from '@app/components/ui';
import {NetworkFee} from '@app/components/ui/network-fee';
import {SumBlock} from '@app/components/ui/sum-block';
import {createTheme} from '@app/helpers';
import {formatPercents} from '@app/helpers/format-percents';
import {useSumAmount} from '@app/hooks/use-sum-amount';
import {I18N} from '@app/i18n';
import {ValidatorItem, ValidatorStatus} from '@app/types';
import {WEI} from '@app/variables/common';

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
    localStatus,
  },
  onAmount,
  fee,
  balance,
}: StakingDelegateFormProps) => {
  const amounts = useSumAmount(0, balance - Math.max(fee / WEI, 0.00001), 0.01);

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
        <Text t14 i18n={I18N.stakingDelegateFormCommission} />
        <Text t10>{validatorCommission}%</Text>
      </View>
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
        disabled={!amounts.isValid}
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
