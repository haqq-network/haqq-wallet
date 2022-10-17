import React, {useCallback, useState} from 'react';
import {StyleSheet, Button} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {NumericKeyboard} from '../components/numeric-keyboard';
import {Container, Text} from '../components/ui';
import {useApp} from '../contexts/app';
import {vibrate} from '../services/haptic';
import {TEXT_BASE_2} from '../variables';

export const SetPinScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
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
      <Text t4 style={page.t4}>
        Set pin code
      </Text>
      <Text t11 style={page.t11}>
        {pin}
      </Text>
      <NumericKeyboard onPress={onKeyboard} />
      <Button title="Set pin" onPress={onSetPin} disabled={pin.length < 4} />
    </Container>
  );
};

const page = StyleSheet.create({
  t4: {textAlign: 'center'},
  t11: {textAlign: 'center', color: TEXT_BASE_2},
});
