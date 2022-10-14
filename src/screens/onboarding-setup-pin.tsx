import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {NumericKeyboard} from '../components/numeric-keyboard';
import {Container, Text, Spacer} from '../components/ui';
import {GRAPHIC_BASE_4, TEXT_BASE_2, TEXT_GREEN_1} from '../variables';
import {vibrate} from '../services/haptic';

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
    <Container style={page.container}>
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
    </Container>
  );
};

const page = StyleSheet.create({
  container: {alignItems: 'center', marginTop: 40, paddingBottom: 16},
  title: {marginBottom: 12},
  description: {textAlign: 'center', color: TEXT_BASE_2},
  spacer: {justifyContent: 'center', alignItems: 'center'},
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
