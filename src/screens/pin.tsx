import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {useApp} from '../contexts/app';
import {NumericKeyboard} from '../components/numeric-keyboard';
import {Container} from '../components/container';
import {wallets} from '../contexts/wallets';
import {Paragraph, Title} from '../components/ui';
import {Spacer} from '../components/spacer';

type PinScreenProp = CompositeScreenProps<any, any>;

export const PinScreen = ({navigation}: PinScreenProp) => {
  const app = useApp();
  const [pin, setPin] = useState('');
  const onKeyboard = useCallback((value: number) => {
    if (value > -1) {
      setPin(p => `${p}${value}`);
    } else {
      setPin(p => p.slice(0, p.length - 1));
    }
  }, []);

  const onSuccess = useCallback(() => {
    wallets.init().then(() => {
      if (wallets.getWallets().length === 0) {
        navigation.replace('create-wallet');
      } else {
        navigation.replace('home');
      }
    });
  }, [navigation]);

  useEffect(() => {
    if (pin.length === 6 && app.comparePin(pin)) {
      onSuccess();
    }
  }, [pin, onSuccess]);

  return (
    <Container style={{alignItems: 'center'}}>
      <Title>Enter 6-digital pin code</Title>
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
    backgroundColor: '#CFD1DB',
    margin: 5,
    borderRadius: 9,
    transform: [{scale: 0.66}],
  },
  active: {
    backgroundColor: '#04D484',
    transform: [{scale: 1}],
  },
});
