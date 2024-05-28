import React, {useEffect, useState} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {NumericKeyboard} from '@app/components/pin/numeric-keyboard';
import {ErrorText, PopupContainer, Spacer, Text} from '@app/components/ui';
import {createTheme, verticalScale} from '@app/helpers';
import {I18N} from '@app/i18n';

interface OnboardingSetupPinProps {
  onKeyboard: (value: number) => void;
  pin: string;
  errorText?: string;
}

export const OnboardingSetupPin = ({
  onKeyboard,
  pin,
  errorText,
}: OnboardingSetupPinProps) => {
  const [error, setError] = useState(errorText);

  useEffect(() => {
    setError('');
  }, [pin]);

  useEffect(() => {
    setError(errorText);
  }, [errorText]);

  return (
    <PopupContainer style={page.container} testID="onboarding_setup_pin">
      <Text
        t4
        i18n={I18N.onboardingSetupPinSet}
        style={page.title}
        testID="onboarding_setup_pin_set"
      />
      <Text
        t11
        color={Color.textBase2}
        center
        i18n={I18N.onboardingSetupPinProjectWallet}
      />
      <Spacer style={page.spacer}>
        <View style={page.dots}>
          <View style={[page.dot, pin.length >= 1 && page.active]} />
          <View style={[page.dot, pin.length >= 2 && page.active]} />
          <View style={[page.dot, pin.length >= 3 && page.active]} />
          <View style={[page.dot, pin.length >= 4 && page.active]} />
          <View style={[page.dot, pin.length >= 5 && page.active]} />
          <View style={[page.dot, pin.length >= 6 && page.active]} />
        </View>
        <ErrorText center e2>
          {error ? error : ' '}
        </ErrorText>
      </Spacer>
      <NumericKeyboard onPress={onKeyboard} />
    </PopupContainer>
  );
};

const page = createTheme({
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
});
