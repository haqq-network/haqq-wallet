import React, {memo, useCallback, useEffect, useState} from 'react';

import {OnboardingSetupPin} from '@app/components/onboardinng-setup-pin';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {
  OnboardingStackParamList,
  OnboardingStackRoutes,
} from '@app/screens/WelcomeStack/OnboardingStack';
import {vibrate} from '@app/services/haptic';

export const OnboardingSetupPinScreen = memo(() => {
  const navigation = useTypedNavigation<OnboardingStackParamList>();
  const route = useTypedRoute<
    OnboardingStackParamList,
    OnboardingStackRoutes.OnboardingSetupPin
  >().params;

  const [pin, setPin] = useState('');
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
      navigation.navigate(OnboardingStackRoutes.OnboardingRepeatPin, {
        ...route,
        currentPin: pin,
      });
      setPin('');
    }
  }, [navigation, pin, route]);

  return <OnboardingSetupPin onKeyboard={onKeyboard} pin={pin} />;
});
