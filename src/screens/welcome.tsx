import React, {memo} from 'react';

import {Welcome} from '@app/components/welcome';
import {useTypedNavigation} from '@app/hooks';
import {WelcomeStackRoutes} from '@app/screens/WelcomeStack';

export const WelcomeScreen = memo(() => {
  const navigation = useTypedNavigation();

  const onPressSignup = () =>
    navigation.navigate(WelcomeStackRoutes.SignUp, {
      next: WelcomeStackRoutes.Create,
    });
  const onPressLedger = () => navigation.navigate(WelcomeStackRoutes.Ledger);
  const onPressSignIn = () =>
    navigation.navigate(WelcomeStackRoutes.SignIn, {
      next: WelcomeStackRoutes.Restore,
    });

  return (
    <Welcome
      onPressSignup={onPressSignup}
      onPressLedger={onPressLedger}
      onPressSignIn={onPressSignIn}
    />
  );
});
