import React, {useCallback, useEffect, useState} from 'react';

import {StyleSheet, View} from 'react-native';

import {Color} from '@app/colors';
import {NumericKeyboard} from '@app/components/pin/numeric-keyboard';
import {ErrorText, PopupContainer, Spacer, Text} from '@app/components/ui';
import {verticalScale} from '@app/helpers';
import {useApp, useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {vibrate} from '@app/services/haptic';

export const OnboardingRepeatPin = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'onboardingRepeatPin'>();
  const app = useApp();
  const {currentPin} = route.params;
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
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
      if (pin === currentPin) {
        const {nextScreen, ...params} = route.params;

        app.setPin(pin).then(() => {
          if (app.biometryType !== null) {
            navigation.navigate('onboardingBiometry', {
              ...params,
              biometryType: app.biometryType,
            });
          } else {
            navigation.navigate(nextScreen ?? 'signupStoreWallet', {
              ...params,
            });
          }
        });
      } else {
        const invalidCode = getText(I18N.onboardingRepeatPinInvalidCode);
        setError(invalidCode);
        setPin('');
      }
    }
  }, [pin, currentPin, app, navigation, route]);

  return (
    <PopupContainer style={styles.container}>
      <Text t4 i18n={I18N.onboardingRepeatPinRepeat} />
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
        <ErrorText e2 style={styles.error}>
          {error ? error : ' '}
        </ErrorText>
      </Spacer>
      <NumericKeyboard onPress={onKeyboard} />
    </PopupContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: verticalScale(40),
    paddingBottom: 16,
    marginHorizontal: 20,
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
  error: {
    justifyContent: 'center',
  },
  t11: {
    marginBottom: verticalScale(5),
  },
});
