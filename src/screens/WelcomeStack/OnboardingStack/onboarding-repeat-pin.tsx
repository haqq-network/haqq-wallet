import React, {useCallback} from 'react';

import {observer} from 'mobx-react';

import {OnboardingRepeatPin} from '@app/components/onboarding-repeat-pin';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {
  OnboardingStackParamList,
  OnboardingStackRoutes,
} from '@app/screens/WelcomeStack/OnboardingStack';

export const OnboardingRepeatPinScreen = observer(() => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<
    OnboardingStackParamList,
    OnboardingStackRoutes.OnboardingRepeatPin
  >();

  const onSetPin = useCallback(
    (pin: string) => {
      const {nextScreen, ...params} = route.params;
      app.setPin(pin).then(async () => {
        if (route.params.provider) {
          await route.params.provider.updatePin(pin);
        }

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

  const onError = useCallback(
    (errorText: string) => {
      navigation.navigate('onboardingSetupPin', {errorText, ...route.params});
    },
    [navigation, route.params],
  );

  return <OnboardingRepeatPin onSetPin={onSetPin} onError={onError} />;
});
