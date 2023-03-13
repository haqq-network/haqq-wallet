import React, {useCallback, useEffect} from 'react';

import {MpcNetworks} from '@app/components/mpc-networks/mpc-networks';
import {useTypedNavigation} from '@app/hooks';
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

  return <MpcNetworks onLogin={onLogin} />;
};
