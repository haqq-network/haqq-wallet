import React, {memo, useCallback, useState} from 'react';

import {OnboardingBiometry} from '@app/components/onboarding-biometry';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {
  OnboardingStackParamList,
  OnboardingStackRoutes,
} from '@app/screens/WelcomeStack/OnboardingStack';
import {AdjustTrackingAuthorizationStatus} from '@app/types';
import {getAppTrackingAuthorizationStatus} from '@app/utils';

export const OnboardingBiometryScreen = memo(() => {
  const navigation = useTypedNavigation<OnboardingStackParamList>();
  const route = useTypedRoute<
    OnboardingStackParamList,
    OnboardingStackRoutes.OnboardingBiometry
  >();
  const [error, setError] = useState('');
  const {biometryType} = route.params;

  const onClickSkip = useCallback(() => {
    requestAnimationFrame(async () => {
      const {nextScreen, ...params} = route.params;
      const status = await getAppTrackingAuthorizationStatus();
      if (status === AdjustTrackingAuthorizationStatus.userNotAsked) {
        navigation.navigate(
          OnboardingStackRoutes.OnboardingTrackUserActivity,
          route.params,
        );
      } else {
        // TODO: Найти типы
        // @ts-ignore
        navigation.navigate(nextScreen, params);
      }
    });
  }, [route, navigation]);

  const onClickEnable = useCallback(async () => {
    try {
      await app.biometryAuth();
      app.biometry = true;
      onClickSkip();
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      }
    }
  }, [onClickSkip]);

  return (
    <OnboardingBiometry
      onClickSkip={onClickSkip}
      onClickEnable={onClickEnable}
      error={error}
      biometryType={biometryType}
    />
  );
});
