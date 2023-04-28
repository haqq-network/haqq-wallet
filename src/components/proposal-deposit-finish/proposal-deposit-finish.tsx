import React from 'react';

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
} from '@app/components/ui';
import {NetworkFee} from '@app/components/ui/network-fee';
import {createTheme, openURL} from '@app/helpers';
import {cleanNumber} from '@app/helpers/clean-number';
import {I18N} from '@app/i18n';

export type ProposalDepositFinishProps = {
  amount: number;
  fee: number;
  txhash: string;
  title: string;
  onDone: () => void;
};

export const ProposalDepositFinish = ({
  onDone,
  amount,
  fee,
  title,
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
          style={styles.imageWrapper}
          autoPlay
          loop={false}
        />
      </View>
      <Text
        t4
        center
        i18n={I18N.proposalDepositTitle}
        style={styles.title}
        color={Color.textGreen1}
      />
      <Image
        source={require('@assets/images/islm_icon.png')}
        style={styles.icon}
      />
      <Text t3 center style={styles.sum}>
        {cleanNumber(amount)} ISLM
      </Text>
      <Text t13 center style={styles.address}>
        {title}
      </Text>
      <NetworkFee fee={fee} />
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
            t15
            center
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
  imageWrapper: {width: 140, height: 140},
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
