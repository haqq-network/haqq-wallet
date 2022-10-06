import React, {useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {
  Button,
  ButtonVariant,
  Text,
  PopupContainer,
  LottieWrap,
} from '../components/ui';
import {TEXT_BASE_2} from '../variables';

type SignInAgreementScreenProp = CompositeScreenProps<any, any>;

const warningImage = require('../../assets/animations/recover-animation.json');

export const SignInAgreementScreen = ({
  navigation,
  route,
}: SignInAgreementScreenProp) => {
  const onDone = useCallback(() => {
    navigation.navigate(route.params.nextScreen ?? 'signinRestoreWallet');
  }, [navigation, route.params.nextScreen]);

  return (
    <>
      <View style={page.animation}>
        <LottieWrap source={warningImage} style={page.image} autoPlay loop />
      </View>
      <PopupContainer style={page.container}>
        <Text t4 style={page.title}>
          Do you have your recovery phrase or private key?
        </Text>
        <Text style={page.disclaimer}>
          The recovery phrase is a 12-word phrase that you received when you
          created the wallet. A private key is a key created by you in the
          application
        </Text>
        <Button
          style={page.submit}
          variant={ButtonVariant.contained}
          title="Agree"
          onPress={onDone}
        />
        <Text style={page.agreement}>
          By clicking Agree you agree to the Terms of Service and Privacy Policy
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
    top: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {marginBottom: 4, marginHorizontal: 20},
  disclaimer: {
    marginBottom: 154,
    textAlign: 'center',
    color: TEXT_BASE_2,
    marginHorizontal: 20,
  },
  submit: {marginBottom: 16, marginHorizontal: 20},
  agreement: {textAlign: 'center', marginHorizontal: 20, marginBottom: 16},
  image: {width: 200, height: 200},
});
