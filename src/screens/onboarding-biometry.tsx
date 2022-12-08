import React, {useCallback} from 'react';

import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import { OnboardingBiometry } from '@app/components/onboarding-biometry';

export const OnboardingBiometryScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'onboardingBiometry'>();
  const {biometryType} = route.params;

  const onClickSkip = useCallback(() => {
    requestAnimationFrame(() => {
      const {nextScreen, ...params} = route.params;
      navigation.navigate(nextScreen ?? 'signupStoreWallet', params);
    });
  }, [route, navigation]);

  return <OnboardingBiometry onClickSkip={onClickSkip} biometryType={biometryType} />
};