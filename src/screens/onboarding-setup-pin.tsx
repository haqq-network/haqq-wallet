import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {NumericKeyboard} from '../components/numeric-keyboard';
import {Container, Paragraph, Spacer, Title} from '../components/ui';
import {GRAPHIC_BASE_4, TEXT_GREEN_1} from '../variables';

type OnboardingSetupPinScreenProp = CompositeScreenProps<any, any>;

export const OnboardingSetupPinScreen = ({
  navigation,
}: OnboardingSetupPinScreenProp) => {
  const [pin, setPin] = useState('');
  const onKeyboard = useCallback((value: number) => {
    // Vibration.vibrate();
    if (value > -1) {
      setPin(p => `${p}${value}`.slice(0, 6));
    } else {
      setPin(p => p.slice(0, p.length - 1));
    }
  }, []);

  useEffect(() => {
    if (pin.length === 6) {
      navigation.navigate('onboarding-repeat-pin', {
        currentPin: pin,
      });
    }
  }, [navigation, pin]);

  return (
    <Container style={{alignItems: 'center'}}>
      <Title>Set 6-digital pin code</Title>
      <Paragraph>
        Project your wallet. PIN code for increases wallet security in the event
        your phone is stolen
      </Paragraph>
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
