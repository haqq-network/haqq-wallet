import React, {useCallback, useEffect, useState} from 'react';

import {TransactionAccount} from '@app/components/transaction-account';
import {useTypedNavigation, useTypedRoute, useWallets} from '@app/hooks';

export const TransactionAccountScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'transactionAccount'>();
  const wallets = useWallets();
  const onPressRow = useCallback(
    (address: string) => {
      navigation.navigate('transactionAddress', {
        ...route.params,
        from: address,
      });
    },
    [navigation, route.params],
  );

  const [rows, setRows] = useState(wallets.getWallets());

  useEffect(() => {
    setRows(wallets.getWallets());

    const callback = () => {
      setRows(wallets.getWallets());
    };

    wallets.on('wallets', callback);
    return () => {
      wallets.off('wallets', callback);
    };
  }, [wallets]);

  return <TransactionAccount rows={rows} onPressRow={onPressRow} />;
};
