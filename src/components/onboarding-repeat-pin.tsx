import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {NumericKeyboard} from '@app/components/pin/numeric-keyboard';
import {ErrorText, PopupContainer, Spacer, Text} from '@app/components/ui';
import {createTheme, verticalScale} from '@app/helpers';
import {I18N} from '@app/i18n';

type OnboardingRepeatPinProps = {
  onKeyboard: (value: number) => void;
  pin: string;
  error: string;
};

export const OnboardingRepeatPin = ({
  onKeyboard,
  pin,
  error,
}: OnboardingRepeatPinProps) => {
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

const styles = createTheme({
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
