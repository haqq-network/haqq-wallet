import React, {memo, useCallback} from 'react';

import {ProviderMnemonicBase} from '@haqq/rn-wallet-providers';
import {utils} from 'ethers';

import {SignInRestore} from '@app/components/singin-restore-wallet';
import {app} from '@app/contexts';
import {useTypedNavigation} from '@app/hooks';
import {SecureValue} from '@app/modifiers/secure-value';
import {SignInStackParamList, SignInStackRoutes} from '@app/route-types';
import {makeID} from '@app/utils';

export const SignInRestoreScreen = memo(() => {
  const navigation = useTypedNavigation<SignInStackParamList>();

  const onDoneTry = useCallback(
    async (seed: string) => {
      const nextScreen = app.onboarded
        ? SignInStackRoutes.SigninStoreWallet
        : SignInStackRoutes.OnboardingSetupPin;

      if (
        utils.isHexString(seed.trim()) ||
        utils.isHexString(`0x${seed}`.trim())
      ) {
        const pk = seed.trim();

        navigation.push(nextScreen, {
          type: 'privateKey',
          privateKey: new SecureValue<string>(
            pk.startsWith('0x') ? pk : `0x${pk}`,
          ),
        });

        return;
      }

      if (utils.isValidMnemonic(seed.trim().toLowerCase())) {
        const generatedPassword = String(makeID(10));
        const passwordPromise = () => Promise.resolve(generatedPassword);

        const provider = await ProviderMnemonicBase.initialize(
          seed.trim().toLowerCase(),
          app.onboarded ? app.getPassword.bind(app) : passwordPromise,
          {},
        );

        navigation.push(SignInStackRoutes.SigninChooseAccount, {
          provider,
          type: 'mnemonic',
          mnemonic: new SecureValue<string>(seed.trim().toLowerCase()),
        });

        return;
      }

      throw new Error('unknown key');
    },
    [navigation, app.getPassword, app.onboarded],
  );

  return <SignInRestore onDoneTry={onDoneTry} testID="signin_restore" />;
});
