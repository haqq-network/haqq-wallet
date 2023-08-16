import React, {memo, useCallback} from 'react';

import {OnboardingRepeatPin} from '@app/components/onboarding-repeat-pin';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {
  OnboardingStackParamList,
  OnboardingStackRoutes,
} from '@app/screens/WelcomeStack/OnboardingStack';

export const OnboardingRepeatPinScreen = memo(() => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<
    OnboardingStackParamList,
    OnboardingStackRoutes.OnboardingRepeatPin
  >();

  const onSetPin = useCallback(
    (pin: string) => {
      const {nextScreen, ...params} = route.params;
      app.setPin(pin).then(() => {
        if (app.biometryType !== null) {
          navigation.navigate(OnboardingStackRoutes.OnboardingBiometry, {
            ...params,
            biometryType: app.biometryType,
          });
        } else {
          // TODO: Найти типы
          // @ts-ignore
          navigation.navigate(nextScreen, params);
        }
      });
    },
    [navigation, route.params],
  );

  return <OnboardingRepeatPin onSetPin={onSetPin} />;
});
