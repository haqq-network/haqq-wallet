import React, {useCallback} from 'react';

import {useTypedNavigation, useUser} from '@app/hooks';

import {LedgerBluetooth} from '../components/ledger-bluetooth';

export const LedgerBluetoothScreen = () => {
  const user = useUser();
  const navigation = useTypedNavigation();
  const onDone = useCallback(async () => {
    user.bluetooth = true;
    navigation.navigate('ledgerScan');
  }, [navigation, user]);

  return <LedgerBluetooth onDone={onDone} user={user} />;
};
