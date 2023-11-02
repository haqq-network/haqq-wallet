import React, {memo, useCallback} from 'react';

import {SigninNotExists} from '@app/components/signin-not-exists';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {WelcomeStackRoutes} from '@app/screens/WelcomeStack';
import {
  SignInStackParamList,
  SignInStackRoutes,
} from '@app/screens/WelcomeStack/SignInStack';
import {SignUpStackRoutes} from '@app/screens/WelcomeStack/SignUpStack';

export const SigninNotExistsScreen = memo(() => {
  const navigation = useTypedNavigation<SignInStackParamList>();
  const {provider, email, ...params} = useTypedRoute<
    SignInStackParamList,
    SignInStackRoutes.SigninNotExists
  >().params;

  const onPressCreate = useCallback(() => {
    if (app.onboarded) {
      navigation.replace(WelcomeStackRoutes.SignUp, {
        screen: SignUpStackRoutes.SignupStoreWallet,
        params,
      });
      return;
    }
    navigation.replace(SignInStackRoutes.OnboardingSetupPin, params);
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
});
