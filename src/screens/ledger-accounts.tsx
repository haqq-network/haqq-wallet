import React, {useCallback} from 'react';

import {LedgerAccounts} from '@app/components/ledger-accounts';
import {useTypedNavigation, useTypedRoute, useUser} from '@app/hooks';

export const LedgerAccountsScreen = () => {
  const user = useUser();
  const navigation = useTypedNavigation();
  const {deviceId, deviceName} = useTypedRoute<'ledgerAccounts'>().params;
  const nextScreen = user.onboarded
    ? 'ledgerStoreWallet'
    : 'onboardingSetupPin';

  const onPressAdd = useCallback(
    (address: string) => {
      navigation.navigate('ledgerVerify', {
        nextScreen: nextScreen,
        address,
        deviceId: deviceId,
        deviceName: deviceName,
      });
    },
    [navigation, deviceId, deviceName, nextScreen],
  );

  return <LedgerAccounts deviceId={deviceId} onAdd={onPressAdd} />;
};
