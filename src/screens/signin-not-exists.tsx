import React, {useCallback} from 'react';

import {SigninNotExists} from '@app/components/signin-not-exists';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const SigninNotExistsScreen = () => {
  const navigation = useTypedNavigation();
  const {provider, email, ...params} =
    useTypedRoute<'signinNotExists'>().params;

  const onPressCreate = useCallback(() => {
    const nextScreen = app.onboarded
      ? 'signupStoreWallet'
      : 'onboardingSetupPin';

    navigation.replace(nextScreen, params);
  }, [navigation, params]);

  const onPressChoice = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <SigninNotExists
      onPressCreate={onPressCreate}
      onPressChoice={onPressChoice}
      provider={provider}
      email={email}
    />
  );
};
