import React, {useCallback} from 'react';

import {accountInfo} from '@haqq/provider-web3-utils';
import {constants} from '@haqq/rn-wallet-providers';
import {observer} from 'mobx-react';
import {Alert} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';

import {SignupNetworks} from '@app/components/signup-networks';
import {app} from '@app/contexts';
import {getProviderStorage, showModal} from '@app/helpers';
import {getMetadataValueWrapped} from '@app/helpers/sss';
import {SssError} from '@app/helpers/sss-error';
import {verifyCloud} from '@app/helpers/verify-cloud';
import {useTypedNavigation} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {AppStore} from '@app/models/app';
import {ErrorHandler} from '@app/models/error-handler';
import {
  SignInStackRoutes,
  SignUpStackParamList,
  SignUpStackRoutes,
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

const logger = Logger.create('SignupNetworksScreen', {
  enabled: AppStore.isLogsEnabled,
});

export const SignupNetworksScreen = observer(() => {
  logger.log('Defining SignupNetworksScreen component');
  const navigation = useTypedNavigation<SignUpStackParamList>();
  logger.log('Initializing navigation with useTypedNavigation');

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
                'Cloud permissions not granted, navigating to SignupCloudProblems',
              );
              navigation.navigate(SignUpStackRoutes.SignupCloudProblems, {
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

          const nextStack = cloudShare
            ? WelcomeStackRoutes.SignIn
            : WelcomeStackRoutes.SignUp;
          const onboardedSignScreen = cloudShare
            ? SignInStackRoutes.SigninStoreWallet
            : SignUpStackRoutes.SignupStoreWallet;
          const signScreen = cloudShare
            ? SignInStackRoutes.OnboardingSetupPin
            : SignUpStackRoutes.OnboardingSetupPin;

          logger.log('Determining next screen');
          const nextScreen = AppStore.isOnboarded
            ? onboardedSignScreen
            : signScreen;

          logger.log('Navigating to next screen:', nextScreen);
          //@ts-ignore
          navigation.replace(nextStack, {
            screen: nextScreen,
            params: {
              type: 'sss',
              sssPrivateKey: creds.privateKey,
              token: creds.token,
              verifier: creds.verifier,
              sssCloudShare: cloudShare,
              sssLocalShare: localShare,
              provider,
            },
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
              navigation.navigate(SignUpStackRoutes.SignupCloudProblems, {
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

  const onLoginLaterPress = useCallback(() => {
    logger.log('onLoginLaterPress called');
    Alert.alert(
      getText(I18N.sssLoginLaterTitle),
      getText(I18N.sssLoginLaterDescription),
      [
        {
          text: getText(I18N.cancel),
        },
        {
          text: getText(I18N.accept),
          style: 'destructive',
          onPress() {
            logger.log('Navigating to OnboardingSetupPin');
            navigation.navigate(SignUpStackRoutes.OnboardingSetupPin, {
              type: 'empty',
            });
          },
        },
      ],
    );
  }, [navigation]);

  logger.log('Rendering SignupNetworks component');
  return (
    <SignupNetworks
      onLogin={onLogin}
      onLoginLaterPress={onLoginLaterPress}
      isAppleSupported={app.isAppleSigninSupported}
      isGoogleSupported={app.isGoogleSigninSupported}
      isCustomSupported={app.isCustomSigninSupported}
    />
  );
});
