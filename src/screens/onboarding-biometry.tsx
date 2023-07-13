import React, {useCallback, useState} from 'react';

import {OnboardingBiometry} from '@app/components/onboarding-biometry';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {AdjustTrackingAuthorizationStatus} from '@app/types';
import {getAppTrackingAuthorizationStatus} from '@app/utils';

export const OnboardingBiometryScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'onboardingBiometry'>();
  const [error, setError] = useState('');
  const {biometryType} = route.params;

  const onClickSkip = useCallback(() => {
    requestAnimationFrame(async () => {
      const {nextScreen, ...params} = route.params;
      const status = await getAppTrackingAuthorizationStatus();
      if (status === AdjustTrackingAuthorizationStatus.userNotAsked) {
        navigation.navigate('onboardingTrackUserActivity', params);
      } else {
        navigation.navigate(nextScreen ?? 'signupStoreWallet', params);
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
};
