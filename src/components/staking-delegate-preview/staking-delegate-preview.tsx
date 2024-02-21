import React, {useMemo} from 'react';

import {formatDistance} from 'date-fns';
import {Image, View} from 'react-native';

import {Color, getColor} from '@app/colors';
import {
  Button,
  ButtonVariant,
  DataView,
  Icon,
  InfoBlock,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {cleanNumber} from '@app/helpers/clean-number';
import {formatPercents} from '@app/helpers/format-percents';
import {I18N, getText} from '@app/i18n';
import {Balance} from '@app/services/balance';
import {ValidatorItem, ValidatorStatus} from '@app/types';

export type StakingDelegatePreviewProps = {
  unboundingTime: number;
  amount: number;
  fee: Balance;
  validator: ValidatorItem;
  disabled: boolean;
  onSend: () => void;
};

export const StakingDelegatePreview = ({
  amount,
  fee,
  validator,
  disabled,
  unboundingTime,
  onSend,
}: StakingDelegatePreviewProps) => {
  const validatorCommission = useMemo(() => {
    return formatPercents(validator.commission.commission_rates.rate);
  }, [validator.commission.commission_rates]);

  const time = useMemo(
    () => formatDistance(new Date(unboundingTime), new Date(0)),
    [unboundingTime],
  );

  return (
    <PopupContainer testID="staking-preview-container" style={styles.container}>
      <Image
        source={require('@assets/images/islm_icon.png')}
        style={styles.icon}
      />
      <Text
        t11
        center
        i18n={I18N.stakingDelegatePreviewTotalAmount}
        color={Color.textBase2}
        style={styles.subtitle}
      />
      <Text
        t3
        center
        style={styles.sum}
        i18n={I18N.amountISLM}
        i18params={{
          amount: cleanNumber(amount),
        }}
      />
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
            {fee.toBalanceString(8)}
          </Text>
        </DataView>
      </View>
      <Spacer />
      <Spacer height={24} />
      <InfoBlock
        warning
        i18n={I18N.stakingUnDelegatePreviewAttention}
        i18params={{time}}
        icon={<Icon name="warning" color={Color.textYellow1} />}
      />
      {validator.localStatus === ValidatorStatus.inactive ||
        (validator.localStatus === ValidatorStatus.jailed && (
          <>
            <Spacer height={16} />
            <InfoBlock
              warning
              i18n={I18N.stakingDelegateFormJailedAttention}
              icon={<Icon name="warning" color={Color.textYellow1} />}
            />
          </>
        ))}
      <Spacer minHeight={16} />
      <Button
        variant={ButtonVariant.contained}
        title={getText(I18N.stakingDelegatePreviewDelegate)}
        onPress={onSend}
        style={styles.submit}
        loading={disabled}
        testID="staking-preview"
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
    width: 64,
    height: 64,
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
