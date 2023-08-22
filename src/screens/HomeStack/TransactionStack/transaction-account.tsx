import React, {memo, useCallback} from 'react';

import {TransactionAccount} from '@app/components/transaction-account';
import {useTypedNavigation, useTypedRoute, useWalletsList} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/screens/HomeStack/TransactionStack';

export const TransactionAccountScreen = memo(() => {
  const navigation = useTypedNavigation<TransactionStackParamList>();
  useAndroidBackHandler(() => {
    navigation.goBack();
    return true;
  }, [navigation]);
  const route = useTypedRoute<
    TransactionStackParamList,
    TransactionStackRoutes.TransactionAccount
  >();
  const wallets = useWalletsList();
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
