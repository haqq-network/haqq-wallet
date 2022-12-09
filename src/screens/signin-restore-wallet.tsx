import React from 'react';

import {utils} from 'ethers';

import {SignInRestore} from '@app/components/singin-restore-wallet';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const SignInRestoreScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'restorePhrase'>();

  const onDoneTry = (seed: string) => {
    navigation.push(route.params.nextScreen ?? 'onboardingSetupPin', {
      mnemonic: utils.isValidMnemonic(seed.trim()) && seed.trim(),
      privateKey: utils.isHexString(seed.trim()) && seed.trim(),
    });
  };

  return <SignInRestore onDoneTry={onDoneTry} />;
};
