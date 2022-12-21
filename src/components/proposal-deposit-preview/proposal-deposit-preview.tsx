import React from 'react';

import {View} from 'react-native';

import {Color, getColor} from '@app/colors';
import {
  Button,
  ButtonVariant,
  DataView,
  ISLMIcon,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {cleanNumber} from '@app/utils';
import {WEI} from '@app/variables/common';

export type ProposalDepositPreviewProps = {
  amount: number;
  fee: number;
  title: string;
  error?: string;
  disabled: boolean;
  onSend: () => void;
};

export const ProposalDepositPreview = ({
  amount,
  fee,
  error,
  title,
  disabled,
  onSend,
}: ProposalDepositPreviewProps) => {
  const feeValue = fee / WEI;

  return (
    <PopupContainer style={styles.container}>
      <ISLMIcon color={getColor(Color.graphicGreen1)} style={styles.icon} />
      <Text
        t11
        center
        i18n={I18N.proposalDepositTotalAmount}
        color={Color.textBase2}
        style={styles.subtitle}
      />
      <Text t3 center style={styles.sum}>
        {cleanNumber(amount.toFixed(4))} ISLM
      </Text>
      <Text
        t11
        center
        i18n={I18N.proposalDepositDepositFrom}
        color={Color.textBase2}
        style={styles.subtitle}
      />
      <Text t10 center style={styles.contact}>
        {title}
      </Text>

      <View style={styles.info}>
        <DataView i18n={I18N.proposalDepositDepositFrom}>
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

      <Button
        variant={ButtonVariant.contained}
        title={getText(I18N.proposalDeposit)}
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
    top: 40,
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
