import React from 'react';

import {Welcome} from '@app/components/welcome';
import {useTypedNavigation} from '@app/hooks';

export const WelcomeScreen = () => {
  const navigation = useTypedNavigation();

  const naviagteToSignup = () =>
    navigation.navigate('signup', {next: 'create'});
  const naviagteToLedger = () => 'ledger';
  const naviagteToSignin = () =>
    navigation.navigate('signin', {next: 'restore'});
  return (
    <Welcome
      naviagteToSignup={naviagteToSignup}
      naviagteToLedger={naviagteToLedger}
      naviagteToSignin={naviagteToSignin}
    />
  );
};
