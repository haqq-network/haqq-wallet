import React from 'react';

import {Proposal} from '@evmos/provider/dist/rest/gov';
import {observer} from 'mobx-react';
import {Image, View} from 'react-native';

import {Color, getColor} from '@app/colors';
import {
  Button,
  ButtonVariant,
  DataView,
  PopupContainer,
  Spacer,
  Text,
  TextPosition,
  TextVariant,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {cleanNumber} from '@app/helpers/clean-number';
import {I18N, getText} from '@app/i18n';
import {Provider} from '@app/models/provider';
import {Balance} from '@app/services/balance';

export type ProposalDepositPreviewProps = {
  amount: number;
  fee: Balance;
  proposal: Proposal;
  error?: string;
  disabled: boolean;
  onSend: () => void;
};

export const ProposalDepositPreview = observer(
  ({
    amount,
    fee,
    error,
    proposal,
    disabled,
    onSend,
  }: ProposalDepositPreviewProps) => {
    return (
      <PopupContainer style={styles.container}>
        <Image
          source={require('@assets/images/islm_icon.png')}
          style={styles.icon}
        />
        <Text
          variant={TextVariant.t11}
          position={TextPosition.center}
          i18n={I18N.proposalDepositTotalAmount}
          color={Color.textBase2}
          style={styles.subtitle}
        />
        <Text
          variant={TextVariant.t3}
          position={TextPosition.center}
          style={styles.sum}>
          {`${cleanNumber(amount)} ${Provider.selectedProvider.denom}`}
        </Text>
        <Text
          variant={TextVariant.t11}
          position={TextPosition.center}
          i18n={I18N.proposalDepositDepositFrom}
          color={Color.textBase2}
          style={styles.subtitle}
        />
        <Text
          variant={TextVariant.t10}
          position={TextPosition.center}
          style={styles.contact}>
          {proposal.content.title}
        </Text>

        <View style={styles.info}>
          <DataView i18n={I18N.proposalDepositDepositFrom}>
            <Text variant={TextVariant.t11}>{cleanNumber(amount)}</Text>
          </DataView>
          <DataView label={getText(I18N.stakingDelegatePreviewNetworkFee)}>
            <Text variant={TextVariant.t11} color={getColor(Color.textBase1)}>
              {fee.toWeiString()}
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
  },
);

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
