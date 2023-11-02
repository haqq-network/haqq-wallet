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
  const accountId = route.params?.accountId;

  const onPressPharse = useCallback(() => {
    navigation.navigate(HomeStackRoutes.Backup, {accountId});
  }, [accountId, navigation]);

  const onPressSocial = useCallback(() => {
    navigation.navigate(HomeStackRoutes.SssMigrate, {accountId});
  }, [accountId, navigation]);

  return (
    <WalletProtection
      onPressPharse={onPressPharse}
      onPressSocial={onPressSocial}
    />
  );
});
