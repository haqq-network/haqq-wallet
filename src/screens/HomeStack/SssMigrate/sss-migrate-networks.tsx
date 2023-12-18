import React, {memo, useCallback} from 'react';

import {METADATA_URL} from '@env';

import {SssMigrateNetworks} from '@app/components/sss-migrate-networks';
import {getMetadataValueWrapped} from '@app/helpers/wrappers/get-metadata-value';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {ErrorHandler} from '@app/models/error-handler';
import {
  SssMigrateStackParamList,
  SssMigrateStackRoutes,
} from '@app/screens/HomeStack/SssMigrate';
import {
  Creds,
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
      let creds: Creds;
      try {
        switch (provider) {
          case SssProviders.apple:
            creds = await onLoginApple();
            break;
          case SssProviders.google:
            creds = await onLoginGoogle();
            break;
        }
      } catch (err) {
        ErrorHandler.handle('sssLimitReached');
        return;
      }
      if (creds.privateKey) {
        const walletInfo = await getMetadataValueWrapped(
          RemoteConfig.get_env('sss_metadata_url', METADATA_URL) as string,
          creds.privateKey,
          'socialShareIndex',
        );

        const onNext = () => {
          const nextScreen = walletInfo
            ? SssMigrateStackRoutes.SssMigrateRewrite
            : SssMigrateStackRoutes.SssMigrateStore;

          //@ts-ignore
          navigation.navigate(nextScreen, {
            accountId: route.params.accountId,
            privateKey: creds.privateKey,
            token: creds.token,
            verifier: creds.verifier,
            provider,
            email: '',
          });
        };

        if (walletInfo) {
          onNext();
        } else {
          navigation.navigate(
            SssMigrateStackRoutes.SSSMigrateSignupImportantInfo,
            {
              onNext,
            },
          );
        }
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
