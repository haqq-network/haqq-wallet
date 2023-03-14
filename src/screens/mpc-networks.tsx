import React, {useCallback, useEffect} from 'react';

import {Alert} from 'react-native';

import {MpcNetworks} from '@app/components/mpc-networks/mpc-networks';
import {useTypedNavigation} from '@app/hooks';
import {I18N, getText} from '@app/i18n';
import {
  MpcProviders,
  customAuthInit,
  onLoginApple,
  onLoginGoogle,
} from '@app/services/provider-mpc';

export const MpcNetworksScreen = () => {
  const navigation = useTypedNavigation();

  useEffect(() => {
    customAuthInit();
  }, []);

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
        navigation.navigate('mpcBackup', {
          privateKey,
        });
      }
    },
    [navigation],
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
            navigation.navigate('onboardingSetupPin', {});
          },
        },
      ],
    );
  }, [navigation]);

  return (
    <MpcNetworks onLogin={onLogin} onLoginLaterPress={onLoginLaterPress} />
  );
};
