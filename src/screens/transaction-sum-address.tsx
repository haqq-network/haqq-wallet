import React, {useCallback} from 'react';

import {TransactionAddress} from '@app/components/transaction-address';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const TransactionSumAddressScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'transactionSumAddress'>();

  const onDone = useCallback(
    (address: string) => {
      app.emit(route.params.event, address);
      navigation.goBack();
    },
    [navigation, route.params.event],
  );

  return <TransactionAddress initial={route.params.to} onAddress={onDone} />;
};
