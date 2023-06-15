import React, {useCallback} from 'react';

import {METADATA_URL} from '@env';
import {getMetadataValue} from '@haqq/shared-react-native';
import {Alert} from 'react-native';

import {SignupNetworks} from '@app/components/signup-networks';
import {app} from '@app/contexts';
import {useTypedNavigation, useUser} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {
  SssProviders,
  onLoginApple,
  onLoginCustom,
  onLoginGoogle,
} from '@app/services/provider-sss';

export const SignupNetworksScreen = () => {
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

      let nextScreen = user.onboarded
        ? 'signupStoreWallet'
        : 'onboardingSetupPin';

      if (creds.privateKey) {
        const walletInfo = await getMetadataValue(
          METADATA_URL,
          creds.privateKey,
          'socialShareIndex',
        );

        if (walletInfo) {
          nextScreen = 'signupNetworkExists';
        }
      }
      // @ts-ignore
      navigation.navigate(nextScreen, {
        type: 'sss',
        sssPrivateKey: creds.privateKey,
        token: creds.token,
        verifier: creds.verifier,
        sssCloudShare: null,
        provider: provider,
      });
    },
    [navigation, user.onboarded],
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
            navigation.navigate('onboardingSetupPin', {
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
      isDeveloper={user.isDeveloper || false}
      isAppleSupported={app.isAppleSigninSupported}
      isGoogleSupported={app.isGoogleSigninSupported}
    />
  );
};
