import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import {StyleSheet, View} from 'react-native';
import {Container, Spacer, Text} from './ui';
import {NumericKeyboard} from './numeric-keyboard';
import {GRAPHIC_BASE_4, TEXT_GREEN_1} from '../variables';
import {vibrate} from '../services/haptic';

export type PinProps = {
  title: string;
  subtitle?: string;
  onPin: (pin: string) => void;
  additionButton?: React.ReactNode;
};

export interface PinInterface {
  reset: (message?: string) => void;
}

export const Pin = forwardRef(
  ({title, subtitle, onPin, additionButton}: PinProps, ref) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    useImperativeHandle(ref, () => ({
      reset(message?: string) {
        if (message) {
          setError(message);
        }
        setPin('');
      },
    }));

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
        onPin(pin);
      }
    }, [onPin, pin]);

    return (
      <Container style={page.container}>
        <Text t3 style={page.title}>
          {title}
        </Text>
        {error && <Text clean>{error}</Text>}
        {subtitle && !error && <Text clean>{subtitle}</Text>}
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
        <NumericKeyboard onPress={onKeyboard} additionButton={additionButton} />
      </Container>
    );
  },
);

const page = StyleSheet.create({
  container: {alignItems: 'center'},
  title: {marginTop: 40},
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
