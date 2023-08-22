import React, {memo, useCallback, useMemo, useRef, useState} from 'react';

import {TransactionAddress} from '@app/components/transaction-address';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute, useWalletsVisible} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {Contact} from '@app/models/contact';
import {
  TransactionStackParamList,
  TransactionStackRoutes,
} from '@app/screens/HomeStack/TransactionStack';

export const TransactionSumAddressScreen = memo(() => {
  const navigation = useTypedNavigation<TransactionStackParamList>();
  useAndroidBackHandler(() => {
    navigation.goBack();
    return true;
  }, [navigation]);
  const route = useTypedRoute<
    TransactionStackParamList,
    TransactionStackRoutes.TransactionSumAddress
  >();
  const wallets = useWalletsVisible();
  const contacts = useRef(Contact.getAll().snapshot()).current;

  const [address, setAddress] = useState(route.params?.to || '');
  const filteredWallets = useMemo(() => {
    if (!wallets || !wallets.length) {
      return;
    }

    if (!address) {
      return wallets.snapshot();
    }

    return wallets
      .filtered('address CONTAINS[c] $0 or name CONTAINS[c] $0', address)
      .snapshot();
  }, [address, wallets]);

  const onDone = useCallback(
    (result: string) => {
      app.emit(route.params.event, result);
      navigation.goBack();
    },
    [navigation, route.params.event],
  );

  return (
    <TransactionAddress
      address={address}
      setAddress={setAddress}
      filteredWallets={filteredWallets}
      contacts={contacts}
      onAddress={onDone}
    />
  );
});
