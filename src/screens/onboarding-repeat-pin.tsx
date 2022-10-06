import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {NumericKeyboard} from '../components/numeric-keyboard';
import {Container, Paragraph, Spacer, Title} from '../components/ui';
import {useApp} from '../contexts/app';
import {GRAPHIC_BASE_4, TEXT_GREEN_1, TEXT_RED_1} from '../variables';
import {vibrate} from '../services/haptic';

type OnboardingRepeatPinScreenProps = CompositeScreenProps<any, any>;

export const OnboardingRepeatPinScreen = ({
  navigation,
  route,
}: OnboardingRepeatPinScreenProps) => {
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
      }
    }
  }, [pin, currentPin, app, navigation, route.params.nextScreen]);

  return (
    <Container style={page.container}>
      <Title>Please repeat pin code</Title>
      <Paragraph>For security, we don't have a “Restore pin” button.</Paragraph>
      <Spacer style={page.spacer}>
        <View style={page.dots}>
          <View style={[page.dot, pin.length >= 1 && page.active]} />
          <View style={[page.dot, pin.length >= 2 && page.active]} />
          <View style={[page.dot, pin.length >= 3 && page.active]} />
          <View style={[page.dot, pin.length >= 4 && page.active]} />
          <View style={[page.dot, pin.length >= 5 && page.active]} />
          <View style={[page.dot, pin.length >= 6 && page.active]} />
        </View>
        <Paragraph style={page.error}>{error}</Paragraph>
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
});
