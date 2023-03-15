import React, {useCallback} from 'react';

import {initializeTKey} from '@haqq/provider-mpc-react-native';
import {Alert} from 'react-native';

import {SignupNetworks} from '@app/components/signup-networks';
import {useTypedNavigation, useUser} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {
  MpcProviders,
  onLoginApple,
  onLoginGoogle,
  serviceProviderOptions,
  storageLayerOptions,
} from '@app/services/provider-mpc';

export const SignupNetworksScreen = () => {
  const navigation = useTypedNavigation();
  const user = useUser();

  const onLogin = useCallback(
    async (provider: MpcProviders) => {
      let privateKey: string | null = null;
      switch (provider) {
        case MpcProviders.apple:
          privateKey = await onLoginApple();
          break;
        case MpcProviders.google:
          privateKey = await onLoginGoogle();
          break;
      }
      if (privateKey) {
        try {
          const {securityQuestionsModule} = await initializeTKey(
            privateKey,
            serviceProviderOptions as any,
            storageLayerOptions,
          );

          securityQuestionsModule.getSecurityQuestions();
          navigation.navigate('signupNetworksExists', {
            type: 'mpc',
            mpcPrivateKey: privateKey,
            mpcSecurityQuestion: null,
            mpcCloudShare: null,
          });
        } catch (e) {
          const nextScreen = user.onboarded
            ? 'signupStoreWallet'
            : 'onboardingSetupPin';

          navigation.navigate(nextScreen, {
            type: 'mpc',
            mpcPrivateKey: privateKey,
            mpcSecurityQuestion: null,
            mpcCloudShare: null,
          });
        }
      }
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
