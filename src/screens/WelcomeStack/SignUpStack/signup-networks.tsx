import React, {memo, useCallback} from 'react';

import {accountInfo} from '@haqq/provider-web3-utils';
import {constants} from '@haqq/rn-wallet-providers';
import {Alert} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';

import {SignupNetworks} from '@app/components/signup-networks';
import {app} from '@app/contexts';
import {getProviderStorage} from '@app/helpers/get-provider-storage';
import {verifyCloud} from '@app/helpers/verify-cloud';
import {getMetadataValueWrapped} from '@app/helpers/wrappers/get-metadata-value';
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
import {GoogleDrive} from '@app/services/google-drive';
import {
  Creds,
  SssProviders,
  onLoginApple,
  onLoginCustom,
  onLoginGoogle,
} from '@app/services/provider-sss';
import {RemoteConfig} from '@app/services/remote-config';

const logger = Logger.create('SignupNetworksScreen', {
  enabled: __DEV__ || app.isTesterMode || AppStore.isDeveloperModeEnabled,
});

export const SignupNetworksScreen = memo(() => {
  logger.log('Defining SignupNetworksScreen component');
  const navigation = useTypedNavigation<SignUpStackParamList>();
  logger.log('Initializing navigation with useTypedNavigation');

  const restoreAccount = useCallback(
    async (provider: SssProviders, creds?: Creds | null) => {
      let nextScreen: string = '';

      if (!creds?.privateKey) {
        return;
      }

      const sssProvider = provider === 'apple' ? Cloud : GoogleDrive;
      const cloud = await getProviderStorage('', provider);
      const supported = await sssProvider.isEnabled();

      if (!supported) {
        nextScreen = SignUpStackRoutes.SignUpPin;
      }

      const account = await accountInfo(creds.privateKey);

      const cloudShare = await cloud.getItem(
        `haqq_${account.address.toLowerCase()}`,
      );

      const localShare = await EncryptedStorage.getItem(
        `${
          constants.ITEM_KEYS[constants.WalletType.sss]
        }_${account.address.toLowerCase()}`,
      );

      if (!cloudShare && !localShare) {
        // @ts-ignore
        navigation.navigate(WelcomeStackRoutes.SignIn, {
          screen: SignInStackRoutes.SigninSharesNotFound,
        });
        return;
      }

      if (!cloudShare) {
        nextScreen = SignUpStackRoutes.SignUpPin;
      } else {
        nextScreen = AppStore.isOnboarded
          ? SignUpStackRoutes.SignupStoreWallet
          : SignUpStackRoutes.OnboardingSetupPin;
      }

      if (nextScreen === SignUpStackRoutes.SignupStoreWallet) {
        //@ts-ignore
        navigation.navigate(SignInStackRoutes.SigninStoreWallet, {
          type: 'sss',
          sssPrivateKey: creds?.privateKey,
          token: creds?.token,
          verifier: creds?.verifier,
          sssCloudShare: cloudShare,
          sssLocalShare: localShare,
        });
        return;
      }

      //@ts-ignore
      navigation.navigate(nextScreen, {
        type: 'sss',
        sssPrivateKey: creds?.privateKey,
        token: creds?.token,
        verifier: creds?.verifier,
        sssCloudShare: cloudShare,
        sssLocalShare: localShare,
        action: 'restore',
      });
    },
    [navigation],
  );

  const onLogin = useCallback(
    async (provider: SssProviders, skipCheck: boolean = false) => {
      logger.log('onLogin callback function called', {provider, skipCheck});
      try {
        let creds: Creds | null | undefined;
        logger.log('Initializing creds variable');
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
          ErrorHandler.handle('sssLimitReached', err);
          return;
        }

        if (creds) {
          logger.log('Credentials obtained successfully');
          let nextScreen = AppStore.isOnboarded
            ? SignUpStackRoutes.SignupStoreWallet
            : SignUpStackRoutes.OnboardingSetupPin;
          logger.log('Determined next screen:', nextScreen);

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

          if (creds.privateKey) {
            logger.log('Private key exists, checking wallet info');
            const walletInfo = await getMetadataValueWrapped(
              RemoteConfig.get('sss_metadata_url')!,
              creds.privateKey,
              'socialShareIndex',
            );

            if (walletInfo) {
              logger.log('Wallet info found, restoring account');
              await restoreAccount(provider, creds);
            }
          }

          const onNext = () => {
            logger.log('Navigating to next screen:', nextScreen);
            //@ts-ignore
            navigation.navigate(nextScreen, {
              type: 'sss',
              sssPrivateKey: creds?.privateKey,
              token: creds?.token,
              verifier: creds?.verifier,
              sssCloudShare: null,
              provider,
              sssLocalShare: null,
            });
          };

          if (
            [
              SignUpStackRoutes.SignupStoreWallet,
              SignUpStackRoutes.OnboardingSetupPin,
            ].includes(nextScreen)
          ) {
            logger.log('Navigating to SignupImportantInfo');
            navigation.navigate(SignUpStackRoutes.SignupImportantInfo, {
              onNext,
            });
          } else {
            logger.log('Proceeding to next screen');
            onNext();
          }
        }
      } catch (err) {
        logger.error('Error in onLogin:', err);
        Alert.alert(
          getText(I18N.verifyCloudProblemsTitle),
          getText(I18N.verifyCloudProblemsRestartPhone),
        );
      }
    },
    [navigation, restoreAccount],
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
