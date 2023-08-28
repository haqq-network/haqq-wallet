import React from 'react';

import {AccountDetail} from '@app/components/account-detail';
import {useTypedNavigation, useTypedRoute, useWallet} from '@app/hooks';

export const AccountDetailScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'accountDetail'>();

  const wallet = useWallet(route.params?.address);

  const onCloseBottomSheet = () => {
    navigation.canGoBack() && navigation.goBack();
  };

  if (!wallet) {
    return null;
  }

  return <AccountDetail wallet={wallet} onClose={onCloseBottomSheet} />;
};
