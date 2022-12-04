import React from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {NumericKeyboard} from '@app/components/pin/numeric-keyboard';
import {PopupContainer, Spacer, Text} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';

type OnboardingSetupPinProps = {
  onKeyboard: (value: number) => void;
  pin: string;
};

export const OnboardingSetupPin = ({
  onKeyboard,
  pin,
}: OnboardingSetupPinProps) => {
  return (
    <PopupContainer style={styles.container} testID="onboarding-setup-pin">
      <Text t4 i18n={I18N.onboardingSetupPinSetPinCode} style={styles.title} />
      <Text
        t11
        i18n={I18N.onboardingSetupPinProjectWallet}
        color={Color.textBase2}
        center
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
      </Spacer>
      <NumericKeyboard onPress={onKeyboard} />
    </PopupContainer>
  );
};

const styles = createTheme({
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
