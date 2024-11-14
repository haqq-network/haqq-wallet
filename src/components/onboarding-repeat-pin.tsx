import React, {useCallback, useEffect, useState} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {NumericKeyboard} from '@app/components/pin/numeric-keyboard';
import {ErrorText, PopupContainer, Spacer, Text} from '@app/components/ui';
import {createTheme, verticalScale} from '@app/helpers';
import {useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {
  OnboardingStackParamList,
  OnboardingStackRoutes,
} from '@app/route-types';
import {vibrate} from '@app/services/haptic';

type OnboardingRepeatPinProps = {
  onSetPin: (pin: string) => void;
  onError: (error: string) => void;
};

export const OnboardingRepeatPin = ({
  onSetPin,
  onError,
}: OnboardingRepeatPinProps) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const route = useTypedRoute<
    OnboardingStackParamList,
    OnboardingStackRoutes.OnboardingRepeatPin
  >();
  const {currentPin} = route.params;

  const onKeyboard = useCallback((value: number) => {
    vibrate();
    if (value > -1) {
      setPin(p => `${p}${value}`.slice(0, 6));
    } else {
      setPin(p => p.slice(0, p.length - 1));
    }
    setError('');
  }, []);

  useEffect(() => {
    if (pin.length === 6) {
      if (pin === currentPin.value) {
        onSetPin(pin);
      } else {
        const invalidCode = getText(I18N.onboardingRepeatPinInvalidCode);
        setPin('');
        onError(invalidCode);
      }
    }
  }, [pin, currentPin, route, onSetPin, onError]);

  return (
    <PopupContainer style={styles.container}>
      <Text t4 i18n={I18N.onboardingRepeatPinRepeat} style={styles.title} />
      <Text
        t11
        i18n={I18N.onboardingRepeatPinSecurity}
        center
        color={Color.textBase2}
        style={styles.t11}
      />
      <Spacer style={styles.spacer}>
        <View style={styles.dots}>
          <View style={[styles.dot, pin.length >= 1 && styles.active]} />
          <View style={[styles.dot, pin.length >= 2 && styles.active]} />
          <View style={[styles.dot, pin.length >= 3 && styles.active]} />
          <View style={[styles.dot, pin.length >= 4 && styles.active]} />
          <View style={[styles.dot, pin.length >= 5 && styles.active]} />
          <View style={[styles.dot, pin.length >= 6 && styles.active]} />
        </View>
        <ErrorText e2 center>
          {error ? error : ' '}
        </ErrorText>
      </Spacer>
      <NumericKeyboard onPress={onKeyboard} />
    </PopupContainer>
  );
};

const styles = createTheme({
  title: {marginBottom: 12},
  container: {
    alignItems: 'center',
    marginTop: () => verticalScale(40),
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  spacer: {justifyContent: 'center', alignItems: 'center'},
  dots: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
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
  t11: {
    marginBottom: () => verticalScale(5),
  },
});
