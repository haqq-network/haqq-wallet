import React from 'react';

import {utils} from 'ethers';

import {SignInRestore} from '@app/components/singin-restore-wallet';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const SignInRestoreScreen = () => {
  const navigation = useTypedNavigation();
  const {nextScreen} = useTypedRoute<'restorePhrase'>().params;

  const onDoneTry = (seed: string) => {
    let privateKey =
      utils.isHexString(seed.trim()) || utils.isHexString(`0x${seed}`.trim())
        ? seed.trim()
        : false;

    if (privateKey && !privateKey.startsWith('0x')) {
      privateKey = `0x${privateKey}`;
    }

    const mnemonic = utils.isValidMnemonic(seed.trim().toLowerCase())
      ? seed.trim().toLowerCase()
      : false;

    navigation.push(nextScreen ?? 'onboardingSetupPin', {
      mnemonic,
      privateKey,
    });
  };

  return <SignInRestore onDoneTry={onDoneTry} />;
};
