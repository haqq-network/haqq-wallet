import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, ButtonVariant, PopupContainer, Spacer, Text} from '../ui';
import {LIGHT_TEXT_BASE_2} from '../../variables';
import {LottieWrap} from '../lottie';
// import {Terms} from '../ui/terms';
import {getText, I18N} from '../../i18n';
import {windowWidth} from '../../helpers';

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
      <Text t4 style={page.title}>
        {getText(I18N.ledgerAgreementTitle)}
      </Text>
      <Text t11 style={page.disclaimer}>
        {getText(I18N.ledgerAgreementText)}
      </Text>
      <Spacer />
      <Button
        style={page.submit}
        variant={ButtonVariant.contained}
        title={getText(I18N.ledgerAgreementAgree)}
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
    height: Math.min(windowWidth, 330),
  },
  title: {
    marginBottom: 4,
    marginHorizontal: 20,
    textAlign: 'center',
  },
  disclaimer: {
    marginBottom: 20,
    textAlign: 'center',
    color: LIGHT_TEXT_BASE_2,
    marginHorizontal: 20,
  },
  submit: {marginBottom: 16, marginHorizontal: 20},
  // agreement: {
  //   marginHorizontal: 20,
  //   marginBottom: 16,
  // },
  image: {
    height: Math.min(windowWidth, 330) - 20,
  },
});
