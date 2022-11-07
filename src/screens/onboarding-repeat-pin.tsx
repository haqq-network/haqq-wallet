import React, {useCallback, useEffect, useState} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {View} from 'react-native';

import {Color} from '../colors';
import {NumericKeyboard} from '../components/numeric-keyboard';
import {PopupContainer, Spacer, Text} from '../components/ui';
import {useApp} from '../contexts/app';
import {createTheme} from '../helpers/create-theme';
import {vibrate} from '../services/haptic';
import {RootStackParamList} from '../types';

export const OnboardingRepeatPinScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'onboardingRepeatPin'>>();
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

        app.setPin(pin).then(() => {
          if (app.biometryType !== null) {
            navigation.navigate('onboardingBiometry', {
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
    <PopupContainer style={page.container}>
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
    </PopupContainer>
  );
};

const page = createTheme({
  container: {
    alignItems: 'center',
    marginTop: 40,
    paddingBottom: 16,
    marginHorizontal: 20,
  },
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
    backgroundColor: Color.graphicSecond2,
    margin: 5,
    borderRadius: 9,
    transform: [{scale: 0.66}],
  },
  active: {
    backgroundColor: Color.textGreen1,
    transform: [{scale: 1}],
  },
  error: {
    color: Color.textRed1,
    justifyContent: 'center',
  },
  t11: {textAlign: 'center', color: Color.textBase2},
});
