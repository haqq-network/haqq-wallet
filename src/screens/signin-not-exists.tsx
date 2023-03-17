import React, {useCallback} from 'react';

import {SigninNotExists} from '@app/components/signin-not-exists';
import {useTypedNavigation, useTypedRoute, useUser} from '@app/hooks';

export const SigninNotExistsScreen = () => {
  const user = useUser();
  const navigation = useTypedNavigation();
  const {provider, email, ...params} =
    useTypedRoute<'signinNotExists'>().params;

  const onPressCreate = useCallback(() => {
    const nextScreen = user.onboarded
      ? 'signupStoreWallet'
      : 'onboardingSetupPin';

    navigation.replace(nextScreen, params);
  }, [navigation, params, user.onboarded]);

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
