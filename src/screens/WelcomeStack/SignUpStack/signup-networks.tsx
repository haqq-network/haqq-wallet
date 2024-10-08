import React, {memo, useCallback} from 'react';

import {Alert} from 'react-native';

import {SignupNetworks} from '@app/components/signup-networks';
import {app} from '@app/contexts';
import {verifyCloud} from '@app/helpers/verify-cloud';
import {getMetadataValueWrapped} from '@app/helpers/wrappers/get-metadata-value';
import {useTypedNavigation} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {ErrorHandler} from '@app/models/error-handler';
import {SignUpStackParamList, SignUpStackRoutes} from '@app/route-types';
import {
  Creds,
  SssProviders,
  onLoginApple,
  onLoginCustom,
  onLoginGoogle,
} from '@app/services/provider-sss';
import {RemoteConfig} from '@app/services/remote-config';

export const SignupNetworksScreen = memo(() => {
  const navigation = useTypedNavigation<SignUpStackParamList>();

  const onLogin = useCallback(
    async (provider: SssProviders, skipCheck: boolean = false) => {
      try {
        let creds: Creds | null | undefined;
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

        if (creds) {
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
              RemoteConfig.get('sss_metadata_url')!,
              creds.privateKey,
              'socialShareIndex',
            );

            if (walletInfo) {
              nextScreen = SignUpStackRoutes.SignUpNetworkExists;
            }
          }

          const onNext = () => {
            //@ts-ignore
            navigation.navigate(nextScreen, {
              type: 'sss',
              sssPrivateKey: creds?.privateKey,
              token: creds?.token,
              verifier: creds?.verifier,
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
            navigation.navigate(SignUpStackRoutes.SignupImportantInfo, {
              onNext,
            });
          } else {
            onNext();
          }
        }
      } catch (err) {
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
          text: getText(I18N.cancel),
        },
        {
          text: getText(I18N.accept),
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
      isCustomSupported={app.isCustomSigninSupported}
    />
  );
});
