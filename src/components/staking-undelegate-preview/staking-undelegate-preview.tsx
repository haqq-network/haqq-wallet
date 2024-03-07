import React, {useMemo} from 'react';

import {formatDistance} from 'date-fns';
import {View} from 'react-native';

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
import {I18N} from '@app/i18n';
import {Balance} from '@app/services/balance';
import {Color} from '@app/theme';
import {ValidatorItem} from '@app/types';

export type StakingDelegatePreviewProps = {
  unboundingTime: number;
  amount: number;
  fee: Balance;
  validator: ValidatorItem;
  disabled: boolean;
  onSend: () => void;
};

export const StakingUnDelegatePreview = ({
  amount,
  fee,
  validator,
  disabled,
  onSend,
  unboundingTime,
}: StakingDelegatePreviewProps) => {
  const time = useMemo(
    () => formatDistance(new Date(unboundingTime), new Date(0)),
    [unboundingTime],
  );

  return (
    <PopupContainer
      testID="staking-undelegate-container"
      style={styles.container}>
      <View style={styles.icon}>
        <Icon name="logo" i42 color={Color.graphicBase3} />
      </View>
      <Text
        t11
        center
        i18n={I18N.stakingUnDelegatePreviewTotalAmount}
        color={Color.textBase2}
        style={styles.subtitle}
      />
      <Text
        t3
        center
        style={styles.sum}
        i18n={I18N.amountISLM}
        i18params={{amount: cleanNumber(amount)}}
      />
      <Text
        t11
        center
        i18n={I18N.stakingUnDelegatePreviewWithdrawFrom}
        color={Color.textBase2}
        style={styles.subtitle}
      />
      <Text t10 center style={styles.contact}>
        {validator.description.moniker}
      </Text>
      <View style={styles.info}>
        <DataView i18n={I18N.stakingUnDelegatePreviewAmount}>
          <Text
            t11
            i18n={I18N.amountISLM}
            i18params={{amount: cleanNumber(amount)}}
          />
        </DataView>
        <DataView i18n={I18N.stakingUnDelegatePreviewNetworkFee}>
          <Text t11 color={Color.textBase1}>
            {fee.toBalanceString(8)}
          </Text>
        </DataView>
      </View>
      <Spacer height={24} />
      <InfoBlock
        warning
        i18n={I18N.stakingUnDelegatePreviewAttention}
        i18params={{time}}
        icon={<Icon name="warning" color={Color.textYellow1} />}
      />
      <Spacer />
      <Button
        variant={ButtonVariant.contained}
        i18n={I18N.stakingUnDelegatePreviewButton}
        onPress={onSend}
        style={styles.submit}
        loading={disabled}
        testID="staking-undelegate-button"
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
    padding: 11,
    borderRadius: 16,
    backgroundColor: Color.graphicGreen2,
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
