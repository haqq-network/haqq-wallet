import React, {useCallback, useState} from 'react';
import {Button} from 'react-native';
import {CompositeScreenProps} from '@react-navigation/native';
import {NumericKeyboard} from '../components/numeric-keyboard';
import {Container, Paragraph} from '../components/ui';
import {useApp} from '../contexts/app';
import {vibrate} from '../services/haptic';

type PinScreenProp = CompositeScreenProps<any, any>;

export const SetPinScreen = ({navigation}: PinScreenProp) => {
  const app = useApp();
  const [pin, setPin] = useState('');
  const onKeyboard = useCallback((value: number) => {
    vibrate();
    if (value > -1) {
      setPin(pin => `${pin}${value}`);
    } else {
      setPin(pin => pin.slice(0, pin.length - 1));
    }
  }, []);

  const onSetPin = useCallback(() => {
    app.setPin(pin);
    navigation.goBack();
  }, [pin, navigation, app]);

  return (
    <Container>
      <Paragraph clean>Set pin code</Paragraph>
      <Paragraph clean>{pin}</Paragraph>
      <NumericKeyboard onPress={onKeyboard} />
      <Button title="Set pin" onPress={onSetPin} disabled={pin.length < 4} />
    </Container>
  );
};
