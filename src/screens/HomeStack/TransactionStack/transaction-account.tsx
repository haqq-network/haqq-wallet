import React, {useCallback, useMemo} from 'react';

import {computed} from 'mobx';
import {observer} from 'mobx-react';

import {TransactionAccount} from '@app/components/transaction-account';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {Wallet} from '@app/models/wallet';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/route-types';

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
  const wallets = useMemo(() => {
    return computed(() =>
      Wallet.getAllVisible().filter(
        item =>
          item.address.toLowerCase() !== route?.params?.to?.toLowerCase?.(),
      ),
    );
  }, [route.params]).get();

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
