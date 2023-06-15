import React, {useCallback} from 'react';

import {METADATA_URL} from '@env';
import {accountInfo} from '@haqq/provider-web3-utils';
import {getMetadataValue} from '@haqq/shared-react-native';

import {SigninNetworks} from '@app/components/signin-networks';
import {SssError} from '@app/helpers/sss-error';
import {useTypedNavigation, useUser} from '@app/hooks';
import {Cloud} from '@app/services/cloud';
import {
  SssProviders,
  onLoginApple,
  onLoginCustom,
  onLoginGoogle,
} from '@app/services/provider-sss';

export const SignInNetworksScreen = () => {
  const navigation = useTypedNavigation();
  const user = useUser();

  const onLogin = useCallback(
    async (provider: SssProviders) => {
      let creds;
      switch (provider) {
        case SssProviders.apple:
          creds = await onLoginApple();
          break;
        case SssProviders.google:
          creds = await onLoginGoogle();
          break;
        case SssProviders.custom:
          creds = await onLoginCustom();
          break;
      }

      try {
        if (!creds.privateKey) {
          throw new SssError('signinNotExists');
        }

        const walletInfo = await getMetadataValue(
          METADATA_URL,
          creds.privateKey,
          'socialShareIndex',
        );

        if (!walletInfo) {
          throw new SssError('signinNotExists');
        }

        const supported = await Cloud.isEnabled();
        if (!supported) {
          throw new SssError('signinNotExists');
        }

        const cloud = new Cloud();

        const account = await accountInfo(creds.privateKey as string);

        const share = await cloud.getItem(
          `haqq_${account.address.toLowerCase()}`,
        );

        if (!share) {
          throw new SssError('signinNotRecovery');
        }

        const nextScreen = user.onboarded
          ? 'signinStoreWallet'
          : 'onboardingSetupPin';

        navigation.navigate(nextScreen, {
          type: 'sss',
          sssPrivateKey: creds.privateKey,
          token: creds.token,
          verifier: creds.verifier,
          sssCloudShare: share,
        });
      } catch (e) {
        console.log('error', e, e instanceof SssError);
        if (e instanceof SssError) {
          // @ts-ignore
          navigation.navigate(e.message, {
            type: 'sss',
            sssPrivateKey: creds.privateKey,
            token: creds.token,
            verifier: creds.verifier,
            sssCloudShare: null,
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
