import React, {useCallback, useEffect, useState} from 'react';
import {Text} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {useApp} from '../contexts/app';
import {NumericKeyboard} from '../components/numeric-keyboard';
import {Container} from '../components/container';
import {wallets} from '../contexts/wallets';

type PinScreenProp = CompositeScreenProps<any, any>;

const optionalConfigObject = {
  title: 'Authentication Required', // Android
  color: '#e00606', // Android,
  fallbackLabel: 'Show Passcode', // iOS (if empty, then label is hidden)
};

export const PinScreen = ({navigation}: PinScreenProp) => {
  const app = useApp();
  const [pin, setPin] = useState('');
  const onKeyboard = useCallback((value: number) => {
    if (value > -1) {
      setPin(pin => `${pin}${value}`);
    } else {
      setPin(pin => pin.slice(0, pin.length - 1));
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
  }, [wallets, navigation]);

  useEffect(() => {
    if (pin.length === app.lengthPin() && app.comparePin(pin)) {
      onSuccess();
    }
  }, [pin, onSuccess]);

  return (
    <Container>
      <Text>Pin Screen</Text>
      <Text>{pin}</Text>
      <NumericKeyboard onPress={onKeyboard} />
    </Container>
  );
};
