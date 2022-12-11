import React, {useCallback} from 'react';

import {OnboardingRepeatPin} from '@app/components/onboarding-repeat-pin';
import {useApp, useTypedNavigation, useTypedRoute} from '@app/hooks';

export const OnboardingRepeatPinScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'onboardingRepeatPin'>();
  const app = useApp();

  const onSetPin = useCallback(
    (pin: string) => {
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
    },
    [app, navigation, route.params],
  );

  return <OnboardingRepeatPin onSetPin={onSetPin} />;
};
