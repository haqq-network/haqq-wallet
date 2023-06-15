import React, {useCallback} from 'react';

import {METADATA_URL} from '@env';
import {getMetadataValue} from '@haqq/shared-react-native';

import {SssMigrateNetworks} from '@app/components/sss-migrate-networks';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {
  SssProviders,
  onLoginApple,
  onLoginCustom,
  onLoginGoogle,
} from '@app/services/provider-sss';

export const SssMigrateNetworksScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'sssMigrateNetworks'>();

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
      if (creds.privateKey) {
        const walletInfo = await getMetadataValue(
          METADATA_URL,
          creds.privateKey,
          'socialShareIndex',
        );

        const nextScreen = walletInfo ? 'sssMigrateRewrite' : 'sssMigrateStore';

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
        navigation.navigate('sssMigrateStore', {
          accountId: route.params.accountId,
          privateKey: null,
          token: creds.token,
          verifier: creds.verifier,
        });
      }
    },
    [navigation, route.params.accountId],
  );

  return <SssMigrateNetworks onLogin={onLogin} />;
};
