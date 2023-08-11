import React, {memo, useCallback} from 'react';

import {utils} from 'ethers';

import {SignInRestore} from '@app/components/singin-restore-wallet';
import {app} from '@app/contexts';
import {useTypedNavigation} from '@app/hooks';
import {SignInStackParamList} from '@app/screens/WelcomeStack/SignInStack';

export const SignInRestoreScreen = memo(() => {
  const navigation = useTypedNavigation<SignInStackParamList>();

  const onDoneTry = useCallback(
    (seed: string) => {
      const nextScreen = app.onboarded
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
    [navigation],
  );

  return <SignInRestore onDoneTry={onDoneTry} testID="signin_restore" />;
});
