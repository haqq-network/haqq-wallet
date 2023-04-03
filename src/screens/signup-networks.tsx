import React, {useCallback} from 'react';

import {METADATA_URL} from '@env';
import {getMetadataValue} from '@haqq/shared-react-native';
import {Alert} from 'react-native';

import {SignupNetworks} from '@app/components/signup-networks';
import {useTypedNavigation, useUser} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {
  MpcProviders,
  onLoginApple,
  onLoginCustom,
  onLoginGoogle,
} from '@app/services/provider-mpc';

export const SignupNetworksScreen = () => {
  const navigation = useTypedNavigation();
  const user = useUser();

  const onLogin = useCallback(
    async (provider: MpcProviders) => {
      let creds;
      switch (provider) {
        case MpcProviders.apple:
          creds = await onLoginApple();
          break;
        case MpcProviders.google:
          creds = await onLoginGoogle();
          break;
        case MpcProviders.custom:
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
        type: 'mpc',
        mpcPrivateKey: creds.privateKey,
        token: creds.token,
        verifier: creds.verifier,
        mpcCloudShare: null,
        provider: provider,
      });
    },
    [navigation, user.onboarded],
  );

  const onLoginLaterPress = useCallback(() => {
    Alert.alert(
      getText(I18N.mpcLoginLaterTitle),
      getText(I18N.mpcLoginLaterDescription),
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
    <SignupNetworks onLogin={onLogin} onLoginLaterPress={onLoginLaterPress} />
  );
};
