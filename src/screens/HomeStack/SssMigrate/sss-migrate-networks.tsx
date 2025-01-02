import React, {memo, useCallback} from 'react';

import {SssMigrateNetworks} from '@app/components/sss-migrate-networks';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {ErrorHandler} from '@app/models/error-handler';
import {SecureValue} from '@app/modifiers/secure-value';
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
        ErrorHandler.handle('sss2X', err);
        return;
      }
      if (creds) {
        if (creds.privateKey) {
          const onNext = () => {
            navigation.navigate(SssMigrateStackRoutes.SssMigrateStore, {
              accountId: route.params.accountId,
              privateKey: new SecureValue<string | null>(creds!.privateKey),
              token: creds!.token,
              verifier: creds!.verifier,
              provider,
              email: '',
            });
          };

          navigation.navigate(
            SssMigrateStackRoutes.SssMigrateSignupImportantInfo,
            {
              onNext,
            },
          );
        } else {
          navigation.navigate(SssMigrateStackRoutes.SssMigrateStore, {
            accountId: route.params.accountId,
            privateKey: new SecureValue<string | null>(null),
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
