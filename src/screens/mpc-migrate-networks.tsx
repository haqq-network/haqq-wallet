import React, {useCallback} from 'react';

import {initializeTKey} from '@haqq/provider-mpc-react-native';

import {MpcMigrateNetworks} from '@app/components/mpc-migrate-networks';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {
  MpcProviders,
  onLoginApple,
  onLoginCustom,
  onLoginGoogle,
  serviceProviderOptions,
  storageLayerOptions,
} from '@app/services/provider-mpc';

export const MpcMigrateNetworksScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'mpcMigrateNetworks'>();

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
        case MpcProviders.custom:
          privateKey = await onLoginCustom();
          break;
      }
      if (privateKey) {
        try {
          const {securityQuestionsModule} = await initializeTKey(
            privateKey,
            serviceProviderOptions as any,
            storageLayerOptions,
          );

          securityQuestionsModule.getSecurityQuestions();
          navigation.navigate('mpcMigrateRewrite', {
            accountId: route.params.accountId,
            privateKey,
            provider,
            email: '',
          });
        } catch (e) {
          navigation.navigate('mpcMigrateStore', {
            accountId: route.params.accountId,
            privateKey,
          });
        }
      }
    },
    [navigation, route.params.accountId],
  );

  return <MpcMigrateNetworks onLogin={onLogin} />;
};
