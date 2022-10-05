import React, {useCallback, useState} from 'react';
import {Button, Text} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {NumericKeyboard} from '../components/numeric-keyboard';
import {Container} from '../components/ui';
import {useApp} from '../contexts/app';
import {vibrate} from '../services/haptic';

type PinScreenProp = CompositeScreenProps<any, any>;

export const SetPinScreen = ({navigation}: PinScreenProp) => {
  const app = useApp();
  const [pin, setPin] = useState('');
  const onKeyboard = useCallback((value: number) => {
    vibrate();
    if (value > -1) {
      setPin(p => `${p}${value}`);
    } else {
      setPin(p => p.slice(0, p.length - 1));
    }
  }, []);

  const onSetPin = useCallback(() => {
    app.setPin(pin);
    navigation.goBack();
  }, [pin, navigation, app]);

  return (
    <Container>
      <Text>Set pin code</Text>
      <Text>{pin}</Text>
      <NumericKeyboard onPress={onKeyboard} />
      <Button title="Set pin" onPress={onSetPin} disabled={pin.length < 4} />
    </Container>
  );
};
