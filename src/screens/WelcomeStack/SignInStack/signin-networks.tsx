import React, {memo, useCallback} from 'react';

import {accountInfo} from '@haqq/provider-web3-utils';
import {constants} from '@haqq/rn-wallet-providers';
import EncryptedStorage from 'react-native-encrypted-storage';

import {SigninNetworks} from '@app/components/signin-networks';
import {app} from '@app/contexts';
import {showModal} from '@app/helpers';
import {getProviderStorage} from '@app/helpers/sss';
import {getMetadataValueWrapped} from '@app/helpers/sss';
import {SssError} from '@app/helpers/sss-error';
import {verifyCloud} from '@app/helpers/verify-cloud';
import {useTypedNavigation} from '@app/hooks';
import {AppStore} from '@app/models/app';
import {ErrorHandler} from '@app/models/error-handler';
import {Wallet} from '@app/models/wallet';
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
import {ModalType} from '@app/types';

const logger = Logger.create('SignInNetworksScreen', {
  enabled: __DEV__ || app.isTesterMode || app.isDeveloper,
});

export const SignInNetworksScreen = memo(() => {
  logger.log('Rendering SignInNetworksScreen component');

  const navigation = useTypedNavigation<
    SignInStackParamList & HomeStackParamList
  >();
  logger.log('Initialized navigation with useTypedNavigation');

  const onLogin = useCallback(
    async (provider: SssProviders, skipCheck: boolean = false) => {
      logger.log(
        'onLogin callback called with provider:',
        provider,
        'and skipCheck:',
        skipCheck,
      );
      let creds;
      try {
        logger.log('Attempting to login based on provider');
        switch (provider) {
          case SssProviders.apple:
            logger.log('Logging in with Apple');
            creds = await onLoginApple();
            break;
          case SssProviders.google:
            logger.log('Logging in with Google');
            creds = await onLoginGoogle();
            break;
          case SssProviders.custom:
            logger.log('Logging in with Custom provider');
            creds = await onLoginCustom();
            break;
        }
      } catch (err) {
        logger.error('Error during login:', err);
        ErrorHandler.handle('sss3X', err);
        return;
      }

      try {
        logger.log('Checking if credentials were obtained');
        if (creds) {
          logger.log('Credentials obtained:', creds);
          if (!creds.privateKey) {
            logger.warn('Private key not found in credentials');
            throw new SssError('signinNotExists');
          }

          logger.log('Fetching wallet info from metadata');
          const walletInfo = await getMetadataValueWrapped(
            RemoteConfig.get('sss_metadata_url')!,
            creds.privateKey,
            'socialShareIndex',
          );

          if (!walletInfo) {
            logger.warn('Wallet info not found');
            throw new SssError('signinNotExists');
          }

          logger.log('Getting provider storage');
          const cloud = await getProviderStorage('', provider);
          logger.log('Checking if Cloud is enabled');
          const supported = await Cloud.isEnabled();

          if (!supported) {
            logger.warn('Cloud not supported');
            throw new SssError('signinNotExists');
          }

          logger.log('Fetching account info');
          const account = await accountInfo(creds.privateKey as string);

          if (!skipCheck) {
            logger.log('Verifying cloud permissions');
            const hasPermissions = await verifyCloud(provider);
            if (!hasPermissions) {
              logger.log(
                'Cloud permissions not granted, navigating to SigninCloudProblems',
              );
              navigation.navigate(SignInStackRoutes.SigninCloudProblems, {
                sssProvider: provider,
                onNext: () => onLogin(provider, true),
              });
              return;
            }
          }

          logger.log('Fetching cloud share');
          const cloudShare = await cloud.getItem(
            `haqq_${account.address.toLowerCase()}`,
          );

          logger.log('Fetching local share');
          const localShare = await EncryptedStorage.getItem(
            `${
              constants.ITEM_KEYS[constants.WalletType.sss]
            }_${account.address.toLowerCase()}`,
          );

          if (!cloudShare) {
            logger.warn('Cloud share not found');
            if (!localShare) {
              logger.error('Local share also not found');
              throw new SssError('signinSharesNotFound');
            }
            throw new SssError('signinNotRecovery');
          }

          logger.log('Determining next screen');
          const nextScreen = AppStore.isOnboarded
            ? SignInStackRoutes.SigninStoreWallet
            : SignInStackRoutes.OnboardingSetupPin;

          logger.log('Navigating to next screen:', nextScreen);
          //@ts-ignore
          navigation.navigate(nextScreen, {
            type: 'sss',
            sssPrivateKey: creds.privateKey,
            token: creds.token,
            verifier: creds.verifier,
            sssCloudShare: cloudShare,
            sssLocalShare: null,
            provider,
          });
        }
      } catch (e) {
        logger.error('Error during login process:', e);
        Logger.log('error', e, e instanceof SssError);
        if (e instanceof SssError) {
          try {
            const hasPermissions = await verifyCloud(provider);
            if (hasPermissions) {
              logger.log('Navigating to error screen:', e.message);
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
            } else {
              navigation.navigate(SignInStackRoutes.SigninCloudProblems, {
                sssProvider: provider,
                onNext: () => onLogin(provider, true),
              });
              return;
            }
          } catch (err) {
            logger.error('Error during error handling:', err);
            showModal(ModalType.error, {
              message: e.message,
            });
          }
        }
      }
    },
    [navigation],
  );

  const onSkip = useCallback(() => {
    logger.log('Skip button pressed, navigating to SigninAgreement');
    if (!app.onboarded) {
      Wallet.removeAll();
    }
    navigation.navigate(SignInStackRoutes.SigninAgreement);
  }, [navigation]);

  const onPressHardwareWallet = useCallback(() => {
    logger.log('Hardware wallet button pressed');
    navigation.replace(
      AppStore.isOnboarded ? HomeStackRoutes.Device : WelcomeStackRoutes.Device,
    );
  }, [navigation]);

  logger.log('Rendering SigninNetworks component');
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
