import React from 'react';

import {observer} from 'mobx-react';

import {AccountDetail} from '@app/components/account-detail';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {Wallet} from '@app/models/wallet';
import {HomeStackParamList, HomeStackRoutes} from '@app/route-types';

export const AccountDetailScreen = observer(() => {
  const navigation = useTypedNavigation<HomeStackParamList>();
  const route = useTypedRoute<HomeStackParamList, HomeStackRoutes.Receive>();

  const wallet = Wallet.getById(route.params.address);

  const onCloseBottomSheet = () => {
    navigation.goBack();
  };

  if (!wallet) {
    return null;
  }

  return <AccountDetail wallet={wallet} onClose={onCloseBottomSheet} />;
});
