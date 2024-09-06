import React, {memo, useCallback} from 'react';

import {SssMigrateNetworks} from '@app/components/sss-migrate-networks';
import {app} from '@app/contexts';
import {getMetadataValueWrapped} from '@app/helpers/wrappers/get-metadata-value';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {ErrorHandler} from '@app/models/error-handler';
import {
  SssMigrateStackParamList,
  SssMigrateStackRoutes,
} from '@app/route-types';
import {
  Creds,
  SssProviders,
  onLoginApple,
  onLoginCustom,
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
      let creds: Creds | null | undefined;
      try {
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
      } catch (err) {
        ErrorHandler.handle('sssLimitReached', err);
        return;
      }
      if (creds) {
        if (creds.privateKey) {
          const walletInfo = await getMetadataValueWrapped(
            RemoteConfig.get('sss_metadata_url')!,
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
              privateKey: creds?.privateKey,
              token: creds?.token,
              verifier: creds?.verifier,
              provider,
              email: '',
            });
          };

          if (walletInfo) {
            onNext();
          } else {
            navigation.navigate(
              SssMigrateStackRoutes.SssMigrateSignupImportantInfo,
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
      }
    },
    [navigation, route.params.accountId],
  );

  return (
    <SssMigrateNetworks
      onLogin={onLogin}
      isAppleSupported={app.isAppleSigninSupported}
      isGoogleSupported={app.isGoogleSigninSupported}
      isCustomSupported={app.isCustomSigninSupported}
    />
  );
});
