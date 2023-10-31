import React, {useCallback} from 'react';

import {observer} from 'mobx-react';

import {TransactionAccount} from '@app/components/transaction-account';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {Wallet} from '@app/models/wallet';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/screens/HomeStack/TransactionStack';

export const TransactionAccountScreen = observer(() => {
  const navigation = useTypedNavigation<TransactionStackParamList>();
  useAndroidBackHandler(() => {
    navigation.goBack();
    return true;
  }, [navigation]);
  const route = useTypedRoute<
    TransactionStackParamList,
    TransactionStackRoutes.TransactionAccount
  >();
  const wallets = Wallet.getAll();
  const onPressRow = useCallback(
    (address: string) => {
      navigation.navigate(TransactionStackRoutes.TransactionAddress, {
        ...route.params,
        from: address,
      });
    },
    [navigation, route.params],
  );

  return <TransactionAccount rows={wallets} onPressRow={onPressRow} />;
});
