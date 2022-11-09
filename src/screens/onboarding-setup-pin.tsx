import React, {useCallback, useEffect, useState} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {StyleSheet, View} from 'react-native';

import {NumericKeyboard} from '../components/numeric-keyboard';
import {PopupContainer, Spacer, Text} from '../components/ui';
import {vibrate} from '../services/haptic';
import {RootStackParamList} from '../types';
import {
  LIGHT_GRAPHIC_BASE_4,
  LIGHT_TEXT_BASE_2,
  LIGHT_TEXT_GREEN_1,
} from '../variables';

export const OnboardingSetupPinScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'onboardingSetupPin'>>();

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
    if (pin.length === 6) {
      navigation.navigate('onboardingRepeatPin', {
        ...route.params,
        currentPin: pin,
      });
      setPin('');
    }
  }, [navigation, pin, route]);

  return (
    <PopupContainer style={page.container} testID="onboarding-setup-pin">
      <Text t4 style={page.title}>
        Set 6-digital pin code
      </Text>
      <Text t11 style={page.description}>
        Project your wallet. PIN code for increases wallet security in the event
        your phone{'\u00A0'}is{'\u00A0'}stolen
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
      </Spacer>
      <NumericKeyboard onPress={onKeyboard} />
    </PopupContainer>
  );
};

const page = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 40,
    paddingBottom: 16,
    marginHorizontal: 20,
  },
  title: {marginBottom: 12},
  description: {textAlign: 'center', color: LIGHT_TEXT_BASE_2},
  spacer: {justifyContent: 'center', alignItems: 'center'},
  dots: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  dot: {
    width: 18,
    height: 18,
    backgroundColor: LIGHT_GRAPHIC_BASE_4,
    margin: 5,
    borderRadius: 9,
    transform: [{scale: 0.66}],
  },
  active: {
    backgroundColor: LIGHT_TEXT_GREEN_1,
    transform: [{scale: 1}],
  },
});
