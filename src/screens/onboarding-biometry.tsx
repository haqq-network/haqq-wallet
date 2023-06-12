import React, {useCallback, useState} from 'react';

import {OnboardingBiometry} from '@app/components/onboarding-biometry';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const OnboardingBiometryScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'onboardingBiometry'>();
  const [error, setError] = useState('');
  const {biometryType} = route.params;

  const onClickSkip = useCallback(() => {
    requestAnimationFrame(() => {
      const {nextScreen, ...params} = route.params;
      navigation.navigate(nextScreen ?? 'signupStoreWallet', params);
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
};
