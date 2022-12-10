import React, {useCallback} from 'react';

import {TransactionAccount} from '@app/components/transaction-account';
import {useTypedNavigation, useTypedRoute, useWalletsList} from '@app/hooks';

export const TransactionAccountScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'transactionAccount'>();
  const rows = useWalletsList();
  const onPressRow = useCallback(
    (address: string) => {
      navigation.navigate('transactionAddress', {
        ...route.params,
        from: address,
      });
    },
    [navigation, route.params],
  );

  return <TransactionAccount rows={rows.wallets} onPressRow={onPressRow} />;
};
