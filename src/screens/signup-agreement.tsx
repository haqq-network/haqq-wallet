import React, {useCallback} from 'react';
import {CompositeScreenProps} from '@react-navigation/native';
import Lottie from 'lottie-react-native';
import {Button, ButtonVariant, Paragraph, Title} from '../components/ui';
import {Dimensions, StyleSheet, View} from 'react-native';
import {TEXT_BASE_2} from '../variables';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type SignUpAgreementScreenProp = CompositeScreenProps<any, any>;
const windowWidth = Dimensions.get('window').width;

const animation = require('../../assets/animations/first-screen-animation.json');

export const SignUpAgreementScreen = ({
  navigation,
  route,
}: SignUpAgreementScreenProp) => {
  const onPressAgree = useCallback(() => {
    navigation.navigate(route.params.nextScreen ?? 'onboarding-setup-pin');
  }, [navigation, route.params.nextScreen]);

  const insets = useSafeAreaInsets();
  return (
    <>
      <View pointerEvents="none" style={page.animation}>
        <Lottie source={animation} autoPlay loop />
      </View>
      <View
        style={{
          flex: 1,
          marginBottom: 18 + insets.bottom,
          justifyContent: 'flex-end',
        }}>
        <Title style={page.title}>Islm - DeFi Wallet</Title>
        <Paragraph style={page.disclaimer}>
          Islm Wallet does not store, transfer, transmit, convert, hold, or
          otherwise interact with any of the Virtual Currencies you may use with
          the Islm Wallet App. Any transfer or transaction occurs on the Haqq
          Network(s). Islm Wallet cannot block, freeze or take any kind of
          control over your Virtual Currency.
        </Paragraph>
        <Button
          style={page.submit}
          variant={ButtonVariant.contained}
          title="Agree"
          onPress={onPressAgree}
        />
        <Paragraph style={page.agreement}>
          By clicking Agree you agree to the Terms of Service and Privacy Policy
        </Paragraph>
      </View>
    </>
  );
};

const page = StyleSheet.create({
  animation: {
    position: 'absolute',
    width: windowWidth,
    height: windowWidth,
    top: -34,
  },
  title: {marginBottom: 4, marginHorizontal: 20},
  disclaimer: {
    marginBottom: 58,
    textAlign: 'center',
    color: TEXT_BASE_2,
    marginHorizontal: 20,
  },
  submit: {marginBottom: 16, marginHorizontal: 20},
  agreement: {textAlign: 'center', marginHorizontal: 20},
});
