import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, ButtonVariant, PopupContainer, Text} from '../ui';
import {TEXT_BASE_2} from '../../variables';
import {LottieWrap} from '../lottie';
// import {Terms} from '../ui/terms';
import {getText, I18N} from '../../i18n';

export type LedgerAgreementProps = {
  onDone: () => void;
};

export const LedgerAgreement = ({onDone}: LedgerAgreementProps) => {
  return (
    <>
      <View style={page.animation}>
        <LottieWrap
          source={require('../../../assets/animations/ledger-agreement.json')}
          style={page.image}
          autoPlay
          loop
        />
      </View>
      <PopupContainer style={page.container}>
        <Text t4 style={page.title}>
          {getText(I18N.ledgerAgreementTitle)}
        </Text>
        <Text t11 style={page.disclaimer}>
          {getText(I18N.ledgerAgreementText)}
        </Text>
        <Button
          style={page.submit}
          variant={ButtonVariant.contained}
          title={getText(I18N.ledgerAgreementAgree)}
          onPress={onDone}
        />
        {/*<Terms style={page.agreement} />*/}
      </PopupContainer>
    </>
  );
};

const page = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
  },
  animation: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 200,
    top: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 4,
    marginHorizontal: 20,
    textAlign: 'center',
  },
  disclaimer: {
    marginBottom: 84,
    textAlign: 'center',
    color: TEXT_BASE_2,
    marginHorizontal: 20,
  },
  submit: {marginBottom: 16, marginHorizontal: 20},
  // agreement: {
  //   marginHorizontal: 20,
  //   marginBottom: 16,
  // },
  image: {height: 310},
});
