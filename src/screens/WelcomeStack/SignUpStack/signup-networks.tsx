import React, {memo, useCallback} from 'react';

import {METADATA_URL} from '@env';
import {Alert} from 'react-native';

import {SignupNetworks} from '@app/components/signup-networks';
import {app} from '@app/contexts';
import {verifyCloud} from '@app/helpers/verify-cloud';
import {getMetadataValueWrapped} from '@app/helpers/wrappers/get-metadata-value';
import {useTypedNavigation} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {ErrorHandler} from '@app/models/error-handler';
import {
  SignUpStackParamList,
  SignUpStackRoutes,
} from '@app/screens/WelcomeStack/SignUpStack';
import {
  Creds,
  SssProviders,
  onLoginApple,
  onLoginGoogle,
} from '@app/services/provider-sss';
import {RemoteConfig} from '@app/services/remote-config';

export const SignupNetworksScreen = memo(() => {
  const navigation = useTypedNavigation<SignUpStackParamList>();

  const onLogin = useCallback(
    async (provider: SssProviders, skipCheck: boolean = false) => {
      try {
        let creds: Creds;
        try {
          switch (provider) {
            case SssProviders.apple:
              creds = await onLoginApple();
              break;
            case SssProviders.google:
              creds = await onLoginGoogle();
              break;
          }
        } catch (err) {
          ErrorHandler.handle('sssLimitReached', err);
          return;
        }

        let nextScreen = app.onboarded
          ? SignUpStackRoutes.SignupStoreWallet
          : SignUpStackRoutes.OnboardingSetupPin;

        if (!skipCheck) {
          const hasPermissions = await verifyCloud(provider);
          if (!hasPermissions) {
            navigation.navigate(SignUpStackRoutes.SignupCloudProblems, {
              sssProvider: provider,
              onNext: () => onLogin(provider, true),
            });
            return;
          }
        }

        if (creds.privateKey) {
          const walletInfo = await getMetadataValueWrapped(
            RemoteConfig.get_env('sss_metadata_url', METADATA_URL) as string,
            creds.privateKey,
            'socialShareIndex',
          );

          if (walletInfo) {
            nextScreen = SignUpStackRoutes.SignUpNetworkExists;
          } else {
            // Logger.log('SSS_PRIVATE_KEY_NOT_FOUND', creds);
          }
        }

        const onNext = () => {
          //@ts-ignore
          navigation.navigate(nextScreen, {
            type: 'sss',
            sssPrivateKey: creds.privateKey,
            token: creds.token,
            verifier: creds.verifier,
            sssCloudShare: null,
            provider: provider,
            sssLocalShare: null,
          });
        };

        if (
          [
            SignUpStackRoutes.SignupStoreWallet,
            SignUpStackRoutes.OnboardingSetupPin,
          ].includes(nextScreen)
        ) {
          navigation.navigate(SignUpStackRoutes.SignupImportantInfo, {onNext});
        } else {
          onNext();
        }
      } catch (err) {
        // Logger.log('SSS_ON_LOGIN', err);
        Alert.alert(
          getText(I18N.verifyCloudProblemsTitle),
          getText(I18N.verifyCloudProblemsRestartPhone),
        );
      }
    },
    [navigation],
  );

  const onLoginLaterPress = useCallback(() => {
    Alert.alert(
      getText(I18N.sssLoginLaterTitle),
      getText(I18N.sssLoginLaterDescription),
      [
        {
          text: 'Cancel',
        },
        {
          text: 'Accept',
          style: 'destructive',
          onPress() {
            navigation.navigate(SignUpStackRoutes.OnboardingSetupPin, {
              type: 'empty',
            });
          },
        },
      ],
    );
  }, [navigation]);

  return (
    <SignupNetworks
      onLogin={onLogin}
      onLoginLaterPress={onLoginLaterPress}
      isAppleSupported={app.isAppleSigninSupported}
      isGoogleSupported={app.isGoogleSigninSupported}
    />
  );
});
