import React, {useCallback} from 'react';

import {utils} from 'ethers';

import {SignInRestore} from '@app/components/singin-restore-wallet';
import {useTypedNavigation, useUser} from '@app/hooks';

export const SignInRestoreScreen = () => {
  const navigation = useTypedNavigation();
  const user = useUser();

  const onDoneTry = useCallback(
    (seed: string) => {
      const nextScreen = user.onboarded
        ? 'signinStoreWallet'
        : 'onboardingSetupPin';

      if (
        utils.isHexString(seed.trim()) ||
        utils.isHexString(`0x${seed}`.trim())
      ) {
        const pk = seed.trim();

        navigation.push(nextScreen, {
          type: 'privateKey',
          privateKey: pk.startsWith('0x') ? pk : `0x${pk}`,
        });

        return;
      }

      if (utils.isValidMnemonic(seed.trim().toLowerCase())) {
        navigation.push(nextScreen, {
          type: 'mnemonic',
          mnemonic: seed.trim().toLowerCase(),
        });

        return;
      }

      throw new Error('unknown key');
    },
    [navigation, user.onboarded],
  );

  return <SignInRestore onDoneTry={onDoneTry} />;
};
