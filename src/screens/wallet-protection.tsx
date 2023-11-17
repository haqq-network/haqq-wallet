import React, {memo, useCallback} from 'react';

import {WalletProtection} from '@app/components/wallet-protection';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {HomeStackParamList, HomeStackRoutes} from '@app/screens/HomeStack';

export const WalletProtectionScreen = memo(() => {
  const navigation = useTypedNavigation<HomeStackParamList>();
  const route = useTypedRoute<
    HomeStackParamList,
    HomeStackRoutes.WalletProtectionPopup
  >();
  const wallet = route.params.wallet;
  const accountId = wallet?.accountId;

  const onPressPharse = useCallback(() => {
    navigation.navigate(HomeStackRoutes.Backup, {wallet});
  }, [accountId, navigation]);

  const onPressSocial = useCallback(() => {
    if (accountId) {
      navigation.navigate(HomeStackRoutes.SssMigrate, {accountId});
    }
  }, [accountId, navigation]);

  return (
    <WalletProtection
      onPressPharse={onPressPharse}
      onPressSocial={onPressSocial}
    />
  );
});
