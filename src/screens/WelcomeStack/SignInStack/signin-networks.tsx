import React, {memo, useCallback} from 'react';

import {METADATA_URL} from '@env';
import {ITEM_KEY} from '@haqq/provider-sss-react-native/dist/constants';
import {accountInfo} from '@haqq/provider-web3-utils';
import {getMetadataValue} from '@haqq/shared-react-native';
import EncryptedStorage from 'react-native-encrypted-storage';

import {SigninNetworks} from '@app/components/signin-networks';
import {app} from '@app/contexts';
import {SssError} from '@app/helpers/sss-error';
import {verifyCloud} from '@app/helpers/verify-cloud';
import {useTypedNavigation} from '@app/hooks';
import {
  SignInStackParamList,
  SignInStackRoutes,
} from '@app/screens/WelcomeStack/SignInStack';
import {Cloud} from '@app/services/cloud';
import {
  SssProviders,
  onLoginApple,
  onLoginGoogle,
} from '@app/services/provider-sss';
import {RemoteConfig} from '@app/services/remote-config';

export const SignInNetworksScreen = memo(() => {
  const navigation = useTypedNavigation<SignInStackParamList>();

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
        case SssProviders.custom:
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
            navigation.navigate(SignInStackRoutes.SigninCloudProblems, {
              sssProvider: provider,
              onNext: () => onLogin(provider, true),
            });
            return;
          }
        }

        const cloudShare = await cloud.getItem(
          `haqq_${account.address.toLowerCase()}`,
        );

        const localShare = await EncryptedStorage.getItem(
          `${ITEM_KEY}_${account.address.toLowerCase()}`,
        );

        if (!cloudShare) {
          if (!localShare) {
            throw new SssError('signinSharesNotFound');
          }
          throw new SssError('signinNotRecovery');
        }

        const nextScreen = app.onboarded
          ? SignInStackRoutes.SigninStoreWallet
          : SignInStackRoutes.OnboardingSetupPin;

        navigation.navigate(nextScreen, {
          type: 'sss',
          sssPrivateKey: creds.privateKey,
          token: creds.token,
          verifier: creds.verifier,
          sssCloudShare: cloudShare,
          sssLocalShare: null,
        });
      } catch (e) {
        Logger.log('error', e, e instanceof SssError);
        if (e instanceof SssError) {
          // TODO: Missing screens
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
    navigation.navigate(SignInStackRoutes.SigninAgreement);
  }, [navigation]);

  return (
    <SigninNetworks
      onLogin={onLogin}
      onSkip={onSkip}
      isAppleSupported={app.isAppleSigninSupported}
      isGoogleSupported={app.isGoogleSigninSupported}
      isCustomSupported={app.isCustomSigninSupported}
    />
  );
});
