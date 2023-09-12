import React, {useCallback, useEffect, useState} from 'react';

import {OnboardingSetupPin} from '@app/components/onboardinng-setup-pin';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {vibrate} from '@app/services/haptic';

export const OnboardingSetupPinScreen = () => {
  const navigation = useTypedNavigation();
  const params = useTypedRoute<'onboardingSetupPin'>().params;

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
      navigation.navigate('onboardingRepeatPin', {
        ...params,
        currentPin: pin,
      });
      setPin('');
    }
  }, [navigation, pin, params]);

  return (
    <OnboardingSetupPin
      onKeyboard={onKeyboard}
      pin={pin}
      errorText={params.errorText}
    />
  );
};
