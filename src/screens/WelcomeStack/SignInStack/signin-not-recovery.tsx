import React, {memo, useCallback} from 'react';

import {SigninNotRecovery} from '@app/components/signin-not-recovery';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {
  SignInStackParamList,
  SignInStackRoutes,
} from '@app/screens/WelcomeStack/SignInStack';

export const SigninNotRecoveryScreen = memo(() => {
  const navigation = useTypedNavigation<SignInStackParamList>();
  const route = useTypedRoute<
    SignInStackParamList,
    SignInStackRoutes.SigninNotRecovery
  >();

  const onPressOldPin = useCallback(() => {
    navigation.navigate(SignInStackRoutes.SigninPin, route.params);
  }, [navigation, route.params]);

  const onPressChange = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <SigninNotRecovery
      onPressOldPin={onPressOldPin}
      onPressChange={onPressChange}
    />
  );
});
