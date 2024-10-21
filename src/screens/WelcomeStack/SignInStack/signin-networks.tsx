import React, {memo, useCallback} from 'react';

import {accountInfo} from '@haqq/provider-web3-utils';
import {constants} from '@haqq/rn-wallet-providers';
import EncryptedStorage from 'react-native-encrypted-storage';

import {SigninNetworks} from '@app/components/signin-networks';
import {app} from '@app/contexts';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {SssError} from '@app/helpers/sss-error';
import {verifyCloud} from '@app/helpers/verify-cloud';
import {getMetadataValueWrapped} from '@app/helpers/wrappers/get-metadata-value';
import {useTypedNavigation} from '@app/hooks';
import {ErrorHandler} from '@app/models/error-handler';
import {
  HomeStackParamList,
  HomeStackRoutes,
  SignInStackParamList,
  SignInStackRoutes,
  WelcomeStackRoutes,
} from '@app/route-types';
import {Cloud} from '@app/services/cloud';
import {
  SssProviders,
  onLoginApple,
  onLoginCustom,
  onLoginGoogle,
} from '@app/services/provider-sss';
import {RemoteConfig} from '@app/services/remote-config';

export const SignInNetworksScreen = memo(() => {
  const navigation = useTypedNavigation<
    SignInStackParamList & HomeStackParamList
  >();

  const onLogin = useCallback(
    async (provider: SssProviders, skipCheck: boolean = false) => {
      let creds;
      try {
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
      } catch (err) {
        ErrorHandler.handle('sssLimitReached', err);
        return;
      }

      try {
        if (creds) {
          if (!creds.privateKey) {
            throw new SssError('signinNotExists');
          }

          const walletInfo = await getMetadataValueWrapped(
            RemoteConfig.get('sss_metadata_url')!,
            creds.privateKey,
            'socialShareIndex',
          );

          if (!walletInfo) {
            throw new SssError('signinNotExists');
          }

          const cloud = await getProviderStorage('', provider);
          const supported = await Cloud.isEnabled();

          if (!supported) {
            throw new SssError('signinNotExists');
          }

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
            `${
              constants.ITEM_KEYS[constants.WalletType.sss]
            }_${account.address.toLowerCase()}`,
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

          //@ts-ignore
          navigation.navigate(nextScreen, {
            type: 'sss',
            sssPrivateKey: creds.privateKey,
            token: creds.token,
            verifier: creds.verifier,
            sssCloudShare: cloudShare,
            sssLocalShare: null,
            sssProvider: provider,
          });
        }
      } catch (e) {
        Logger.log('error', e, e instanceof SssError);
        if (e instanceof SssError) {
          // @ts-ignore
          navigation.navigate(e.message, {
            type: 'sss',
            sssPrivateKey: creds?.privateKey,
            token: creds?.token,
            verifier: creds?.verifier,
            sssCloudShare: null,
            sssLocalShare: null,
            provider,
          });
        }
      }
    },
    [navigation],
  );

  const onSkip = useCallback(() => {
    navigation.navigate(SignInStackRoutes.SigninAgreement);
  }, [navigation]);

  const onPressHardwareWallet = useCallback(() => {
    navigation.replace(
      // @ts-ignore
      app.onboarded ? HomeStackRoutes.Device : WelcomeStackRoutes.Device,
    );
  }, [navigation]);

  return (
    <SigninNetworks
      onLogin={onLogin}
      onSkip={onSkip}
      isAppleSupported={app.isAppleSigninSupported}
      isGoogleSupported={app.isGoogleSigninSupported}
      isCustomSupported={app.isCustomSigninSupported}
      onPressHardwareWallet={onPressHardwareWallet}
    />
  );
});
