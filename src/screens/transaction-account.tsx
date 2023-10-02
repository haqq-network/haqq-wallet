import React, {useCallback} from 'react';

import {observer} from 'mobx-react';

import {TransactionAccount} from '@app/components/transaction-account';
import {useTypedNavigation, useTypedRoute, useWalletsList} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';

export const TransactionAccountScreen = observer(() => {
  const navigation = useTypedNavigation();
  useAndroidBackHandler(() => {
    navigation.goBack();
    return true;
  }, [navigation]);
  const route = useTypedRoute<'transactionAccount'>();
  const wallets = useWalletsList();
  const onPressRow = useCallback(
    (address: string) => {
      navigation.navigate('transactionAddress', {
        ...route.params,
        from: address,
      });
    },
    [navigation, route.params],
  );

  return <TransactionAccount rows={wallets} onPressRow={onPressRow} />;
});
