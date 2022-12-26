import React, {useMemo} from 'react';

import {formatDistance} from 'date-fns';
import {View} from 'react-native';

import {Color, getColor} from '@app/colors';
import {
  Button,
  ButtonVariant,
  DataView,
  ISLMIcon,
  Icon,
  InfoBlock,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {formatPercents} from '@app/helpers/format-percents';
import {I18N, getText} from '@app/i18n';
import {ValidatorItem} from '@app/types';
import {cleanNumber} from '@app/utils';
import {WEI} from '@app/variables/common';

export type StakingDelegatePreviewProps = {
  unboundingTime: number;
  amount: number;
  fee: number;
  validator: ValidatorItem;
  error?: string;
  disabled: boolean;
  onSend: () => void;
};

export const StakingDelegatePreview = ({
  amount,
  fee,
  validator,
  error,
  disabled,
  unboundingTime,
  onSend,
}: StakingDelegatePreviewProps) => {
  const feeValue = fee / WEI;
  const validatorCommission = useMemo(() => {
    return formatPercents(validator.commission.commission_rates.rate);
  }, [validator.commission.commission_rates]);

  const time = useMemo(
    () => formatDistance(new Date(unboundingTime), new Date(0)),
    [unboundingTime],
  );

  return (
    <PopupContainer style={styles.container}>
      <ISLMIcon color={getColor(Color.graphicGreen1)} style={styles.icon} />
      <Text
        t11
        center
        i18n={I18N.stakingDelegatePreviewTotalAmount}
        color={Color.textBase2}
        style={styles.subtitle}
      />
      <Text t3 center style={styles.sum}>
        {cleanNumber(amount.toFixed(4))} ISLM
      </Text>
      <Text
        t11
        center
        i18n={I18N.stakingDelegatePreviewStakeTo}
        color={Color.textBase2}
        style={styles.subtitle}
      />
      <Text t10 center style={styles.contact}>
        {validator.description.moniker}
      </Text>

      <View style={styles.info}>
        <DataView label={getText(I18N.stakingDelegatePreviewCommission)}>
          <Text t11 color={getColor(Color.textBase1)}>
            {validatorCommission}%
          </Text>
        </DataView>
        <DataView label={getText(I18N.stakingDelegatePreviewAmount)}>
          <Text t11>{cleanNumber(amount)}</Text>
        </DataView>
        <DataView label={getText(I18N.stakingDelegatePreviewNetworkFee)}>
          <Text t11 color={getColor(Color.textBase1)}>
            {feeValue * WEI} aISLM
          </Text>
        </DataView>
      </View>
      {error && <Text clean>{error}</Text>}
      <Spacer />
      <Spacer height={24} />
      <InfoBlock
        warning
        i18n={I18N.stakingUnDelegatePreviewAttention}
        i18params={{time}}
        icon={<Icon name="warning" color={Color.textYellow1} />}
      />
      <Button
        variant={ButtonVariant.contained}
        title={getText(I18N.stakingDelegatePreviewDelegate)}
        onPress={onSend}
        style={styles.submit}
        loading={disabled}
      />
    </PopupContainer>
  );
};

const styles = createTheme({
  container: {
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  contact: {
    marginHorizontal: 27.5,
    height: 30,
  },
  subtitle: {
    marginBottom: 4,
  },
  icon: {
    marginBottom: 16,
    alignSelf: 'center',
  },
  info: {
    marginTop: 40,
    borderRadius: 16,
    backgroundColor: Color.bg3,
  },
  sum: {
    marginBottom: 16,
  },
  submit: {
    marginVertical: 16,
  },
});
