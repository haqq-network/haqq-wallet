import React, {useCallback, useEffect} from 'react';

import CustomAuth from '@toruslabs/customauth-react-native-sdk';

import {MpcNetworks} from '@app/components/mpc-networks/mpc-networks';
import {useTypedNavigation} from '@app/hooks';
import {
  MpcProviders,
  customAuthInit,
  verifierMap,
} from '@app/services/provider-mpc';

export const MpcNetworksScreen = () => {
  const navigation = useTypedNavigation();

  useEffect(() => {
    customAuthInit();
  }, []);

  const onLogin = useCallback(
    async (provider: MpcProviders) => {
      try {
        const loginDetails = await CustomAuth.triggerLogin(
          verifierMap[provider],
        );

        navigation.navigate('mpcBackup', {
          privateKey: loginDetails.privateKey,
        });
      } catch (e) {
        if (e instanceof Error) {
          console.log(e.message, e);
        }
      }
    },
    [navigation],
  );

  const onPressLoginGithub = useCallback(async () => {
    await onLogin(MpcProviders.auth0);
  }, [onLogin]);

  return <MpcNetworks onLoginAuth0={onPressLoginGithub} />;
};
