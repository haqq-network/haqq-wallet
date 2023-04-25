import React, {useCallback} from 'react';

import {METADATA_URL} from '@env';
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
          METADATA_URL,
          creds.privateKey,
          'socialShareIndex',
        );

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
      } else {
        navigation.navigate('mpcMigrateStore', {
          accountId: route.params.accountId,
          privateKey: null,
          token: creds.token,
          verifier: creds.verifier,
        });
      }
    },
    [navigation, route.params.accountId],
  );

  return <MpcMigrateNetworks onLogin={onLogin} />;
};
