import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, ButtonVariant, PopupContainer, Text} from '../ui';
import {TEXT_BASE_2} from '../../variables';
import {LottieWrap} from '../lottie';

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
          Connect your Ledger
        </Text>
        <Text t11 style={page.disclaimer}>
          If you have a Ledger Nano X, then you can connect it via Bluetooth to
          Islm Wallet. You will be able to manage funds from Ledger using Islm
          Wallet
        </Text>
        <Button
          style={page.submit}
          variant={ButtonVariant.contained}
          title="Connect"
          onPress={onDone}
        />
        <Text t11 style={page.agreement}>
          By clicking Connect you agree to the Terms of Service and Privacy
          Policy
        </Text>
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
  agreement: {
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    color: TEXT_BASE_2,
  },
  image: {height: 310},
});
