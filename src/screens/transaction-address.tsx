import React, {useCallback} from 'react';

import {TransactionAddress} from '@app/components/transaction-address';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const TransactionAddressScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'transactionAddress'>();

  const onDone = useCallback(
    (address: string) => {
      navigation.navigate('transactionSum', {
        from: route.params.from,
        to: address,
      });
    },
    [navigation, route],
  );

  return <TransactionAddress initial={route.params?.to} onAddress={onDone} />;
};
