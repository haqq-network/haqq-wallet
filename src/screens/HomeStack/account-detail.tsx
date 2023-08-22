import React, {memo} from 'react';

import {AccountDetail} from '@app/components/account-detail';
import {useTypedNavigation, useTypedRoute, useWallet} from '@app/hooks';
import {HomeStackParamList, HomeStackRoutes} from '@app/screens/HomeStack';

export const AccountDetailScreen = memo(() => {
  const navigation = useTypedNavigation<HomeStackParamList>();
  const route = useTypedRoute<
    HomeStackParamList,
    HomeStackRoutes.AccountDetail
  >();

  const wallet = useWallet(route.params.address);

  const onCloseBottomSheet = () => {
    navigation.goBack();
  };

  if (!wallet) {
    return null;
  }

  return <AccountDetail wallet={wallet} onClose={onCloseBottomSheet} />;
});
