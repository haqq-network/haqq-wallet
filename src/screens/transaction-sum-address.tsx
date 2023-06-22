import React, {useCallback, useRef} from 'react';

import {TransactionAddress} from '@app/components/transaction-address';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute, useWalletsVisible} from '@app/hooks';
import {Contact} from '@app/models/contact';

export const TransactionSumAddressScreen = () => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'transactionSumAddress'>();
  const wallets = useWalletsVisible();
  const contacts = useRef(Contact.getAll().snapshot()).current;

  const onDone = useCallback(
    (address: string) => {
      app.emit(route.params.event, address);
      navigation.goBack();
    },
    [navigation, route.params.event],
  );

  return (
    <TransactionAddress
      wallets={wallets}
      contacts={contacts}
      initial={route.params.to}
      onAddress={onDone}
    />
  );
};
