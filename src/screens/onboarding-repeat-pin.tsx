import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {NumericKeyboard} from '../components/numeric-keyboard';
import {Container, Paragraph, Spacer, Title} from '../components/ui';
import {useApp} from '../contexts/app';
import {GRAPHIC_BASE_4, TEXT_GREEN_1} from '../variables';
import {vibrate} from '../services/haptic';

type OnboardingRepeatPinScreenProps = CompositeScreenProps<any, any>;

export const OnboardingRepeatPinScreen = ({
  navigation,
  route,
}: OnboardingRepeatPinScreenProps) => {
  const app = useApp();
  const {currentPin} = route.params;
  const [pin, setPin] = useState('');
  const onKeyboard = useCallback((value: number) => {
    vibrate();
    if (value > -1) {
      setPin(p => `${p}${value}`.slice(0, 6));
    } else {
      setPin(p => p.slice(0, p.length - 1));
    }
  }, []);

  useEffect(() => {
    if (pin.length === 6 && pin === currentPin) {
      app
        .setPin(pin)
        .then(() => app.createUser())
        .then(() => {
          if (app.biometryType !== null) {
            navigation.navigate('onboarding-biometry', {
              biometryType: app.biometryType,
            });
          } else {
            navigation.navigate('onboarding-store-wallet');
          }
        });
    }
  }, [pin, currentPin, app, navigation, route.params.next]);

  return (
    <Container style={{alignItems: 'center'}}>
      <Title>Please repeat pin code</Title>
      <Paragraph>For security, we don't have a “Restore pin” button.</Paragraph>
      <Spacer style={{justifyContent: 'center', alignItems: 'center'}}>
        <View style={page.dots}>
          <View style={[page.dot, pin.length >= 1 && page.active]} />
          <View style={[page.dot, pin.length >= 2 && page.active]} />
          <View style={[page.dot, pin.length >= 3 && page.active]} />
          <View style={[page.dot, pin.length >= 4 && page.active]} />
          <View style={[page.dot, pin.length >= 5 && page.active]} />
          <View style={[page.dot, pin.length >= 6 && page.active]} />
        </View>
      </Spacer>
      <NumericKeyboard onPress={onKeyboard} />
    </Container>
  );
};

const page = StyleSheet.create({
  dots: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
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
});
