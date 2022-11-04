import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import {StyleSheet, View} from 'react-native';
import {Spacer, Text} from './ui';
import {NumericKeyboard} from './numeric-keyboard';
import {
  GRAPHIC_BASE_4,
  TEXT_BASE_2,
  TEXT_GREEN_1,
  TEXT_RED_1,
} from '../variables';
import {HapticEffects, vibrate} from '../services/haptic';
import {isBefore} from 'date-fns';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export type PinProps = {
  title: string;
  subtitle?: string;
  onPin: (pin: string) => void;
  additionButton?: React.ReactNode;
};

export interface PinInterface {
  reset: (message?: string) => void;
  locked: (until?: Date | null) => void;
}

export const Pin = forwardRef(
  ({title, subtitle, onPin, additionButton}: PinProps, ref) => {
    const insets = useSafeAreaInsets();
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [locked, setLocked] = useState<Date | null>(null);

    useEffect(() => {
      if (locked !== null) {
        const timer = setInterval(() => {
          if (isBefore(new Date(), locked)) {
            const interval = Math.round((+locked - +new Date()) / 1000);
            const left = `${String(Math.floor(interval / 60)).padStart(
              2,
              '0',
            )}:${String(interval % 60).padStart(2, '0')}`;

            setError(
              'Too many attempts, please wait for {timer}'.replace(
                '{timer}',
                left,
              ),
            );
          } else {
            clearInterval(timer);
            setLocked(null);
            setError('');
          }
        }, 1000);

        return () => {
          clearInterval(timer);
        };
      }
    }, [locked]);

    useImperativeHandle(ref, () => ({
      reset(message?: string) {
        if (message) {
          vibrate(HapticEffects.error);
          setError(message);
        }
        setPin('');
      },
      locked(until: Date | null) {
        setLocked(until);
        setPin('');
      },
    }));

    const onKeyboard = useCallback(
      (value: number) => {
        if (!locked) {
          vibrate();
          if (value > -1) {
            setPin(p => `${p}${value}`.slice(0, 6));
          } else {
            setPin(p => p.slice(0, p.length - 1));
          }
        } else {
          vibrate(HapticEffects.error);
        }
      },
      [locked],
    );

    useEffect(() => {
      if (pin.length === 6) {
        onPin(pin);
      }
    }, [onPin, pin]);

    return (
      <View style={[page.container, {paddingBottom: insets.bottom}]}>
        <Text t4 style={page.title}>
          {title}
        </Text>
        {error && <Text clean>{error}</Text>}
        {subtitle && !error && (
          <Text t11 style={page.t11}>
            {subtitle}
          </Text>
        )}

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
      </View>
    );
  },
);

const page = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
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
  error: {
    color: TEXT_RED_1,
    fontWeight: '600',
  },
  title: {marginTop: 40, marginBottom: 12},
  t11: {textAlign: 'center', color: TEXT_BASE_2},
});
