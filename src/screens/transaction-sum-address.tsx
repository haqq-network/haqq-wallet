import React, {useCallback, useMemo, useRef, useState} from 'react';

import {observer} from 'mobx-react';

import {TransactionAddress} from '@app/components/transaction-address';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {Contact} from '@app/models/contact';
import {Wallet} from '@app/models/wallet';

export const TransactionSumAddressScreen = observer(() => {
  const navigation = useTypedNavigation();
  useAndroidBackHandler(() => {
    navigation.goBack();
    return true;
  }, [navigation]);
  const route = useTypedRoute<'transactionSumAddress'>();
  const wallets = Wallet.getAllVisible();
  const contacts = useRef(Contact.getAll()).current;

  const [address, setAddress] = useState(route.params?.to || '');
  const filteredWallets = useMemo(() => {
    if (!wallets || !wallets.length) {
      return;
    }

    if (!address) {
      return wallets;
    }

    return wallets.filter(
      w => w.address.includes(address) || w.name.includes(address),
    );
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
