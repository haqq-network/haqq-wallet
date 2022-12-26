import React, {useMemo} from 'react';

import {formatDistance} from 'date-fns';
import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  DataView,
  ErrorText,
  Icon,
  InfoBlock,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {ValidatorItem} from '@app/types';
import {cleanNumber} from '@app/utils';

export type StakingDelegatePreviewProps = {
  unboundingTime: number;
  amount: number;
  fee: number;
  validator: ValidatorItem;
  error?: string;
  disabled: boolean;
  onSend: () => void;
};

export const StakingUnDelegatePreview = ({
  amount,
  fee,
  validator,
  error,
  disabled,
  onSend,
  unboundingTime,
}: StakingDelegatePreviewProps) => {
  const time = useMemo(
    () => formatDistance(new Date(unboundingTime), new Date(0)),
    [unboundingTime],
  );

  return (
    <PopupContainer style={styles.container}>
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
      <Text t3 center style={styles.sum}>
        {cleanNumber(amount.toFixed(15))} ISLM
      </Text>
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
          <Text t11>{cleanNumber(amount)} ISLM</Text>
        </DataView>
        <DataView i18n={I18N.stakingUnDelegatePreviewNetworkFee}>
          <Text t11 color={Color.textBase1}>
            {cleanNumber(fee)} aISLM
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
      {error && (
        <ErrorText center e0>
          {error}
        </ErrorText>
      )}
      <Button
        variant={ButtonVariant.contained}
        i18n={I18N.stakingUnDelegatePreviewButton}
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
