import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

import {isBefore} from 'date-fns';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Color, getColor} from '@app/colors';
import {Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {moderateVerticalScale} from '@app/helpers';
import {I18N, getText} from '@app/i18n';
import {HapticEffects, vibrate} from '@app/services/haptic';

import {NumericKeyboard} from './numeric-keyboard';

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

            setError(getText(I18N.pinManyAttempts, {attempts: left}));
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
      <View style={[styles.container, {paddingBottom: insets.bottom}]}>
        <Text t4 style={styles.title}>
          {title}
        </Text>
        {error && <Text clean>{error}</Text>}
        {subtitle && !error && (
          <Text t11 color={getColor(Color.textBase2)} center>
            {subtitle}
          </Text>
        )}

        <Spacer style={styles.spacer}>
          <View style={styles.dots}>
            <View style={[styles.dot, pin.length >= 1 && styles.active]} />
            <View style={[styles.dot, pin.length >= 2 && styles.active]} />
            <View style={[styles.dot, pin.length >= 3 && styles.active]} />
            <View style={[styles.dot, pin.length >= 4 && styles.active]} />
            <View style={[styles.dot, pin.length >= 5 && styles.active]} />
            <View style={[styles.dot, pin.length >= 6 && styles.active]} />
          </View>
        </Spacer>
        <NumericKeyboard onPress={onKeyboard} additionButton={additionButton} />
      </View>
    );
  },
);

const styles = createTheme({
  container: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  spacer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dots: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  dot: {
    width: 18,
    height: 18,
    backgroundColor: Color.graphicSecond2,
    margin: 5,
    borderRadius: 9,
    transform: [{scale: 0.66}],
  },
  active: {
    backgroundColor: Color.textGreen1,
    transform: [{scale: 1}],
  },
  error: {
    color: Color.textRed1,
    fontWeight: '600',
  },
  title: {
    marginTop: moderateVerticalScale(40, 8),
    marginBottom: 12,
    textAlign: 'center',
  },
});
