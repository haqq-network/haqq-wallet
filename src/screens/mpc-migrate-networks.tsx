import React, {useCallback} from 'react';

import {getMetadataValue} from '@haqq/shared-react-native';

import {MpcMigrateNetworks} from '@app/components/mpc-migrate-networks';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {
  MpcProviders,
  onLoginApple,
  onLoginCustom,
  onLoginGoogle,
} from '@app/services/provider-mpc';

export const MpcMigrateNetworksScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'mpcMigrateNetworks'>();

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
      if (creds.privateKey) {
        const walletInfo = await getMetadataValue(
          'https://localhost:8069',
          creds.privateKey,
          'walletInfo',
        );

        console.log('walletInfo', JSON.stringify(walletInfo));

        const nextScreen = walletInfo ? 'mpcMigrateRewrite' : 'mpcMigrateStore';

        // @ts-ignore
        navigation.navigate(nextScreen, {
          accountId: route.params.accountId,
          privateKey: creds.privateKey,
          token: creds.token,
          verifier: creds.verifier,
          provider,
          email: '',
        });
      }
    },
    [navigation, route.params.accountId],
  );

  return <MpcMigrateNetworks onLogin={onLogin} />;
};
