import React from 'react';

import {Welcome} from '@app/components/welcome';
import {useTypedNavigation} from '@app/hooks';

export const WelcomeScreen = () => {
  const navigation = useTypedNavigation();

  const onPressSignup = () => navigation.navigate('signup', {next: 'create'});
  const onPressLedger = () => navigation.navigate('ledger');
  const onPressSignIn = () => navigation.navigate('signin', {next: 'restore'});
  return (
    <Welcome
      onPressSignup={onPressSignup}
      onPressLedger={onPressLedger}
      onPressSignIn={onPressSignIn}
    />
  );
};
