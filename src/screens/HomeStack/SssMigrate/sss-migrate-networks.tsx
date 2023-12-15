import React, {memo, useCallback} from 'react';

import {METADATA_URL} from '@env';

import {SssMigrateNetworks} from '@app/components/sss-migrate-networks';
import {getMetadataValueWrapped} from '@app/helpers/wrappers/getMetadataValue';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {
  SssMigrateStackParamList,
  SssMigrateStackRoutes,
} from '@app/screens/HomeStack/SssMigrate';
import {
  SssProviders,
  onLoginApple,
  onLoginGoogle,
} from '@app/services/provider-sss';
import {RemoteConfig} from '@app/services/remote-config';

export const SssMigrateNetworksScreen = memo(() => {
  const navigation = useTypedNavigation<SssMigrateStackParamList>();
  const route = useTypedRoute<
    SssMigrateStackParamList,
    SssMigrateStackRoutes.SssMigrateNetworks
  >();

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
      }
      if (creds.privateKey) {
        const walletInfo = await getMetadataValueWrapped(
          RemoteConfig.get_env('sss_metadata_url', METADATA_URL) as string,
          creds.privateKey,
          'socialShareIndex',
        );

        const nextScreen = walletInfo
          ? SssMigrateStackRoutes.SssMigrateRewrite
          : SssMigrateStackRoutes.SssMigrateStore;

        navigation.navigate(nextScreen, {
          accountId: route.params.accountId,
          privateKey: creds.privateKey,
          token: creds.token,
          verifier: creds.verifier,
          provider,
          email: '',
        });
      } else {
        navigation.navigate(SssMigrateStackRoutes.SssMigrateStore, {
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
});
