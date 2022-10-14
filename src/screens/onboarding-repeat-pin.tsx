import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {BiometryKey, RootStackParamList} from '../types';
import {NumericKeyboard} from '../components/numeric-keyboard';
import {Container, Text, Spacer} from '../components/ui';
import {useApp} from '../contexts/app';
import {
  GRAPHIC_BASE_4,
  TEXT_BASE_2,
  TEXT_GREEN_1,
  TEXT_RED_1,
} from '../variables';
import {vibrate} from '../services/haptic';

type ParamList = {
  'onboarding-repeat-pin': {
    biometryType: BiometryKey;
    currentPin: string;
    nextScreen: 'onboarding-biometry';
  };
};

export const OnboardingRepeatPinScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<ParamList, 'onboarding-repeat-pin'>>();
  const app = useApp();
  const {currentPin} = route.params;
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const onKeyboard = useCallback((value: number) => {
    vibrate();
    if (value > -1) {
      setPin(p => `${p}${value}`.slice(0, 6));
    } else {
      setPin(p => p.slice(0, p.length - 1));
    }
    setError('');
  }, []);

  useEffect(() => {
    if (pin.length === 6) {
      if (pin === currentPin) {
        const {nextScreen, ...params} = route.params;

        app
          .setPin(pin)
          .then(() => app.createUser())
          .then(() => {
            if (app.biometryType !== null) {
              navigation.navigate('onboarding-biometry', {
                ...params,
                biometryType: app.biometryType,
              });
            } else {
              navigation.navigate(nextScreen ?? 'signupStoreWallet', {
                ...params,
              });
            }
          });
      } else {
        setError('Invalid code. Try again');
        setPin('');
      }
    }
  }, [pin, currentPin, app, navigation, route]);

  return (
    <Container style={page.container}>
      <Text t4>Please repeat pin code</Text>
      <Text t11 style={page.t11}>
        For security, we don't have a “Restore pin” button.
      </Text>
      <Spacer style={page.spacer}>
        <View style={page.dots}>
          <View style={[page.dot, pin.length >= 1 && page.active]} />
          <View style={[page.dot, pin.length >= 2 && page.active]} />
          <View style={[page.dot, pin.length >= 3 && page.active]} />
          <View style={[page.dot, pin.length >= 4 && page.active]} />
          <View style={[page.dot, pin.length >= 5 && page.active]} />
          <View style={[page.dot, pin.length >= 6 && page.active]} />
        </View>
        <Text clean style={page.error}>
          {error ? error : ' '}
        </Text>
      </Spacer>
      <NumericKeyboard onPress={onKeyboard} />
    </Container>
  );
};

const page = StyleSheet.create({
  container: {alignItems: 'center', marginTop: 40, paddingBottom: 16},
  spacer: {justifyContent: 'center', alignItems: 'center'},
  dots: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  dot: {
    width: 18,
    height: 18,
    backgroundColor: GRAPHIC_BASE_4,
    margin: 5,
    borderRadius: 9,
    transform: [{scale: 0.66}],
  },
  active: {
    backgroundColor: TEXT_GREEN_1,
    transform: [{scale: 1}],
  },
  error: {
    color: TEXT_RED_1,
    justifyContent: 'center',
  },
  t11: {textAlign: 'center', color: TEXT_BASE_2},
});
