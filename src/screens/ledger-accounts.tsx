import React, {useCallback} from 'react';

import {LedgerAccounts} from '@app/components/ledger-accounts';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';

export const LedgerAccountsScreen = () => {
  const navigation = useTypedNavigation();
  const {deviceId, deviceName} = useTypedRoute<'ledgerAccounts'>().params;

  const onPressAdd = useCallback(
    (address: string) => {
      navigation.navigate('ledgerVerify', {
        nextScreen: 'ledgerStoreWallet',
        address,
        deviceId,
        deviceName,
      });
    },
    [navigation, deviceId, deviceName],
  );

  return <LedgerAccounts deviceId={deviceId} onAdd={onPressAdd} />;
};
