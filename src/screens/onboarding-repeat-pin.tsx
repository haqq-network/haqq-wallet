import React, {useCallback, useEffect, useState} from 'react';

import {OnboardingRepeatPin} from '@app/components/onboarding-repeat-pin';
import {useApp, useTypedNavigation, useTypedRoute} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {vibrate} from '@app/services/haptic';

export const OnboardingRepeatPinScreen = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'onboardingRepeatPin'>();
  const app = useApp();
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
    <OnboardingRepeatPin pin={pin} error={error} onKeyboard={onKeyboard} />
  );
};
