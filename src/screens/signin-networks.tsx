import React, {useCallback} from 'react';

import {accountInfo} from '@haqq/provider-web3-utils';
import {getMetadataValue} from '@haqq/shared-react-native';

import {SigninNetworks} from '@app/components/signin-networks';
import {MpcError} from '@app/helpers/mpc-error';
import {useTypedNavigation, useUser} from '@app/hooks';
import {Cloud} from '@app/services/cloud';
import {
  MpcProviders,
  onLoginApple,
  onLoginCustom,
  onLoginGoogle,
} from '@app/services/provider-mpc';
import {METADATA_URL} from '@app/variables/common';

export const SignInNetworksScreen = () => {
  const navigation = useTypedNavigation();
  const user = useUser();

  const onLogin = useCallback(
    async (provider: MpcProviders) => {
      let creds;
      switch (provider) {
        case MpcProviders.apple:
          creds = await onLoginApple();
          break;
        case MpcProviders.google:
          creds = await onLoginGoogle();
          break;
        case MpcProviders.custom:
          creds = await onLoginCustom();
          break;
      }

      try {
        if (!creds.privateKey) {
          throw new MpcError('signinNotExists');
        }

        const walletInfo = await getMetadataValue(
          METADATA_URL,
          creds.privateKey,
          'socialShareIndex',
        );

        if (!walletInfo) {
          throw new MpcError('signinNotExists');
        }

        const supported = await Cloud.isEnabled();
        if (!supported) {
          throw new MpcError('signinNotExists');
        }

        const cloud = new Cloud();

        const account = await accountInfo(creds.privateKey as string);

        const share = await cloud.getItem(
          `haqq_${account.address.toLowerCase()}`,
        );

        if (!share) {
          throw new MpcError('signinNotRecovery');
        }

        const nextScreen = user.onboarded
          ? 'signinStoreWallet'
          : 'onboardingSetupPin';

        navigation.navigate(nextScreen, {
          type: 'mpc',
          mpcPrivateKey: creds.privateKey,
          token: creds.token,
          verifier: creds.verifier,
          mpcCloudShare: share,
        });
      } catch (e) {
        console.log('error', e, e instanceof MpcError);
        if (e instanceof MpcError) {
          // @ts-ignore
          navigation.navigate(e.message, {
            type: 'mpc',
            mpcPrivateKey: creds.privateKey,
            token: creds.token,
            verifier: creds.verifier,
            mpcCloudShare: null,
          });
        }
      }
    },
    [navigation, user.onboarded],
  );

  const onSkip = useCallback(() => {
    navigation.navigate('signinAgreement');
  }, [navigation]);

  return <SigninNetworks onLogin={onLogin} onSkip={onSkip} />;
};
