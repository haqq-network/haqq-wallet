import React from 'react';

import {StyleSheet, View} from 'react-native';

import {Color, getColor} from '@app/colors';
import {NumericKeyboard} from '@app/components/pin/numeric-keyboard';
import {PopupContainer, Spacer, Text} from '@app/components/ui';
import {I18N} from '@app/i18n';

interface OnboardingSetupPinProps {
  onKeyboard: (value: number) => void;
  pin: string;
}

export const OnboardingSetupPin = ({
  onKeyboard,
  pin,
}: OnboardingSetupPinProps) => {
  return (
    <PopupContainer style={page.container} testID="onboarding-setup-pin">
      <Text t4 i18n={I18N.onboardingSetupPinSet} style={page.title} />
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
      </Spacer>
      <NumericKeyboard onPress={onKeyboard} />
    </PopupContainer>
  );
};

const page = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 40,
    paddingBottom: 16,
    marginHorizontal: 20,
  },
  title: {marginBottom: 12},
  spacer: {justifyContent: 'center', alignItems: 'center'},
  dots: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  dot: {
    width: 18,
    height: 18,
    backgroundColor: getColor(Color.graphicSecond2),
    margin: 5,
    borderRadius: 9,
    transform: [{scale: 0.66}],
  },
  active: {
    backgroundColor: getColor(Color.textGreen1),
    transform: [{scale: 1}],
  },
});
