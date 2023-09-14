import React, {useCallback} from 'react';

import {METADATA_URL} from '@env';
import {accountInfo} from '@haqq/provider-web3-utils';
import {getMetadataValue} from '@haqq/shared-react-native';

import {SigninNetworks} from '@app/components/signin-networks';
import {app} from '@app/contexts';
import {SssError} from '@app/helpers/sss-error';
import {verifyCloud} from '@app/helpers/verify-cloud';
import {useTypedNavigation} from '@app/hooks';
import {Cloud} from '@app/services/cloud';
import {
  SssProviders,
  onLoginApple,
  onLoginGoogle,
} from '@app/services/provider-sss';
import {RemoteConfig} from '@app/services/remote-config';

export const SignInNetworksScreen = () => {
  const navigation = useTypedNavigation();

  const onLogin = useCallback(
    async (provider: SssProviders, skipCheck: boolean = false) => {
      let creds;
      switch (provider) {
        case SssProviders.apple:
          creds = await onLoginApple();
          break;
        case SssProviders.google:
          creds = await onLoginGoogle();
          break;
      }

      try {
        if (!creds.privateKey) {
          throw new SssError('signinNotExists');
        }

        const walletInfo = await getMetadataValue(
          RemoteConfig.get_env('sss_metadata_url', METADATA_URL) as string,
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

        if (!skipCheck) {
          const hasPermissions = await verifyCloud(provider);
          if (!hasPermissions) {
            navigation.navigate('cloudProblems', {
              sssProvider: provider,
              onNext: () => onLogin(provider, true),
            });
            return;
          }
        }

        const share = await cloud.getItem(
          `haqq_${account.address.toLowerCase()}`,
        );

        if (!share) {
          throw new SssError('signinNotRecovery');
        }

        const nextScreen = app.onboarded
          ? 'signinStoreWallet'
          : 'onboardingSetupPin';

        navigation.navigate(nextScreen, {
          type: 'sss',
          sssPrivateKey: creds.privateKey,
          token: creds.token,
          verifier: creds.verifier,
          sssCloudShare: share,
          sssLocalShare: null,
        });
      } catch (e) {
        Logger.log('error', e, e instanceof SssError);
        if (e instanceof SssError) {
          // @ts-ignore
          navigation.navigate(e.message, {
            type: 'sss',
            sssPrivateKey: creds.privateKey,
            token: creds.token,
            verifier: creds.verifier,
            sssCloudShare: null,
            sssLocalShare: null,
          });
        }
      }
    },
    [navigation],
  );

  const onSkip = useCallback(() => {
    navigation.navigate('signinAgreement');
  }, [navigation]);

  return <SigninNetworks onLogin={onLogin} onSkip={onSkip} />;
};
