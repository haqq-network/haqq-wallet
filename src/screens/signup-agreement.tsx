import React, {useCallback} from 'react';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NextScreenT, RootStackParamList} from '../types';
import {
  Button,
  ButtonVariant,
  LottieWrap,
  PopupContainer,
  Text,
} from '../components/ui';
import {Dimensions, StyleSheet, View} from 'react-native';
import {TEXT_BASE_2} from '../variables';

const windowWidth = Dimensions.get('window').width;

const animation = require('../../assets/animations/first-screen-animation.json');

type ParamList = {
  createAgreement: {
    nextScreen: NextScreenT;
  };
};

export const SignUpAgreementScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<ParamList, 'createAgreement'>>();

  const onPressAgree = useCallback(() => {
    navigation.navigate(route.params.nextScreen ?? 'onboarding-setup-pin');
  }, [navigation, route.params.nextScreen]);

  return (
    <>
      <View pointerEvents="none" style={page.animation}>
        <LottieWrap source={animation} autoPlay loop={false} />
      </View>
      <PopupContainer style={page.container}>
        <Text t4 style={page.title}>
          Islm - DeFi Wallet
        </Text>
        <Text t11 style={page.disclaimer}>
          Islm Wallet does not store, transfer, transmit, convert, hold, or
          otherwise interact with any of the Virtual Currencies you may use with
          the Islm Wallet App. Any transfer or transaction occurs on the Haqq
          Network(s). Islm Wallet cannot block, freeze or take any kind of
          control over your Virtual Currency.
        </Text>
        <Button
          style={page.submit}
          variant={ButtonVariant.contained}
          title="Agree"
          onPress={onPressAgree}
        />
        <Text t11 style={page.agreement}>
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
    width: windowWidth,
    height: windowWidth,
    top: -34,
  },
  title: {marginBottom: 4, marginHorizontal: 20, textAlign: 'center'},
  disclaimer: {
    marginBottom: 58,
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
});
