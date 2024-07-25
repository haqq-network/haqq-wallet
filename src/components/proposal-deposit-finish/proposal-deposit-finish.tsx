import React from 'react';

import {Proposal} from '@evmos/provider/dist/rest/gov';
import {Image, View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  Icon,
  IconButton,
  Inline,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
  TextPosition,
  TextVariant,
} from '@app/components/ui';
import {NetworkFee} from '@app/components/ui/network-fee';
import {app} from '@app/contexts';
import {createTheme, openURL} from '@app/helpers';
import {cleanNumber} from '@app/helpers/clean-number';
import {I18N} from '@app/i18n';
import {Balance} from '@app/services/balance';

export type ProposalDepositFinishProps = {
  amount: number;
  fee: Balance;
  txhash: string;
  proposal: Proposal;
  onDone: () => void;
};

export const ProposalDepositFinish = ({
  onDone,
  amount,
  fee,
  proposal,
  txhash,
}: ProposalDepositFinishProps) => {
  const onPressHash = async () => {
    const url = `https://haqq.explorers.guru/transaction/${txhash}`;
    await openURL(url);
  };

  return (
    <PopupContainer style={styles.container}>
      <View style={styles.sub}>
        <LottieWrap
          source={require('@assets/animations/transaction-finish.json')}
          style={styles.image}
          autoPlay
          loop={false}
        />
      </View>
      <Text
        variant={TextVariant.t4}
        position={TextPosition.center}
        i18n={I18N.proposalDepositTitle}
        style={styles.title}
        color={Color.textGreen1}
      />
      <Image
        source={require('@assets/images/islm_icon.png')}
        style={styles.icon}
      />
      <Text
        variant={TextVariant.t3}
        position={TextPosition.center}
        style={styles.sum}>
        {`${cleanNumber(amount)} ${app.provider.denom}`}
      </Text>
      <Text
        variant={TextVariant.t13}
        position={TextPosition.center}
        style={styles.address}>
        {proposal.content.title}
      </Text>
      <NetworkFee fee={fee} currency="ISLM" />
      <Spacer />
      <Inline gap={12}>
        <IconButton onPress={onPressHash} style={styles.button}>
          <Icon
            name="block"
            color={Color.graphicBase2}
            style={styles.buttonIcon}
            i22
          />
          <Text
            variant={TextVariant.t15}
            position={TextPosition.center}
            i18n={I18N.transactionFinishHash}
            color={Color.textBase2}
          />
        </IconButton>
      </Inline>
      <Spacer height={28} />
      <Button
        style={styles.margin}
        variant={ButtonVariant.contained}
        i18n={I18N.proposalDepositFinishDone}
        onPress={onDone}
      />
    </PopupContainer>
  );
};

const styles = createTheme({
  container: {
    paddingHorizontal: 20,
  },
  sub: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
    marginTop: 56,
  },
  image: {width: 140, height: 140},
  title: {
    marginTop: 32,
    marginBottom: 34,
  },
  icon: {
    marginBottom: 16,
    alignSelf: 'center',
    width: 64,
    height: 64,
  },
  sum: {
    marginBottom: 8,
  },
  address: {
    marginBottom: 4,
  },
  margin: {marginBottom: 16},
  button: {
    marginHorizontal: 6,
    paddingHorizontal: 4,
    paddingVertical: 12,
    backgroundColor: Color.bg8,
    borderRadius: 12,
  },
  buttonIcon: {
    marginBottom: 4,
  },
});
