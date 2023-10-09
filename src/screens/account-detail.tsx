import React from 'react';

import {observer} from 'mobx-react';

import {AccountDetail} from '@app/components/account-detail';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {Wallet} from '@app/models/wallet';

export const AccountDetailScreen = observer(() => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'accountDetail'>();

  const wallet = Wallet.getById(route.params.address);

  const onCloseBottomSheet = () => {
    navigation.canGoBack() && navigation.goBack();
  };

  if (!wallet) {
    return null;
  }

  return <AccountDetail wallet={wallet} onClose={onCloseBottomSheet} />;
});
