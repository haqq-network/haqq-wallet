import React, {memo} from 'react';

import {Welcome} from '@app/components/welcome';
import {useTypedNavigation} from '@app/hooks';
import {WelcomeStackRoutes} from '@app/route-types';

export const WelcomeScreen = memo(() => {
  const navigation = useTypedNavigation();

  const onPressSignup = () => navigation.navigate(WelcomeStackRoutes.SignUp);
  const onPressHardwareWallet = () =>
    navigation.navigate(WelcomeStackRoutes.Device);
  const onPressSignIn = () => navigation.navigate(WelcomeStackRoutes.SignIn);

  return (
    <Welcome
      onPressSignup={onPressSignup}
      onPressHardwareWallet={onPressHardwareWallet}
      onPressSignIn={onPressSignIn}
    />
  );
});
