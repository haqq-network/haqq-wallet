import React, {useCallback} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {
  Button,
  ButtonVariant,
  Paragraph,
  PopupContainer,
  Title,
} from '../components/ui';
import Lottie from 'lottie-react-native';
import {TEXT_BASE_2} from '../variables';

type SignInAgreementScreenProp = CompositeScreenProps<any, any>;
const windowWidth = Dimensions.get('window').width;

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
        <Lottie
          source={require('../../assets/animations/success-animation.json')}
          autoPlay
          loop={false}
        />
      </View>
      <PopupContainer style={page.container}>
        <Title style={page.title}>
          Do you have your recovery phrase or private key?
        </Title>
        <Paragraph style={page.disclaimer}>
          The recovery phrase is a 12-word phrase that you received when you
          created the wallet. A private key is a key created by you in the
          application
        </Paragraph>
        <Button
          style={page.submit}
          variant={ButtonVariant.contained}
          title="Agree"
          onPress={onDone}
        />
        <Paragraph style={page.agreement}>
          By clicking Agree you agree to the Terms of Service and Privacy Policy
        </Paragraph>
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
    width: windowWidth,
    height: windowWidth,
    top: -34,
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
});
