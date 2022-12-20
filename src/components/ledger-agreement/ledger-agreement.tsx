import React from 'react';

import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {LottieWrap} from '@app/components/lottie';
import {
  Button,
  ButtonVariant,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {I18N} from '@app/i18n';
import {WINDOW_WIDTH} from '@app/variables/common';
// import {Terms} from '../ui/terms';

export type LedgerAgreementProps = {
  onDone: () => void;
};

export const LedgerAgreement = ({onDone}: LedgerAgreementProps) => {
  return (
    <PopupContainer style={page.container}>
      <View style={page.animation}>
        <LottieWrap
          source={require('../../../assets/animations/ledger-agreement.json')}
          style={page.image}
          autoPlay
          loop
        />
      </View>
      <Text t4 center style={page.title} i18n={I18N.ledgerAgreementTitle} />
      <Text
        t11
        color={Color.textBase2}
        center
        style={page.disclaimer}
        i18n={I18N.ledgerAgreementText}
      />
      <Spacer />
      <Button
        style={page.submit}
        variant={ButtonVariant.contained}
        i18n={I18N.ledgerAgreementAgree}
        onPress={onDone}
      />
      {/*<Terms style={page.agreement} />*/}
    </PopupContainer>
  );
};

const page = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
  },
  animation: {
    justifyContent: 'center',
    alignItems: 'center',
    height: Math.min(WINDOW_WIDTH, 330),
  },
  title: {
    marginBottom: 4,
    marginHorizontal: 20,
  },
  disclaimer: {
    marginBottom: 20,
    marginHorizontal: 20,
  },
  submit: {marginBottom: 16, marginHorizontal: 20},
  // agreement: {
  //   marginHorizontal: 20,
  //   marginBottom: 16,
  // },
  image: {
    height: Math.min(WINDOW_WIDTH, 330) - 20,
  },
});
