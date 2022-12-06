import React, {useCallback} from 'react';
import {LedgerAccounts} from '@app/components/ledger-accounts';
import { useTypedNavigation, useTypedRoute, useUser } from '@app/hooks';

export const LedgerAccountsScreen = () => {
  const navigation = useTypedNavigation();
  const user = useUser();
  const {deviceId, deviceName} = useTypedRoute<'ledgerAccounts'>().params;

  const onPressAdd = useCallback(
    (address: string) => {
      navigation.navigate('ledgerVerify', {
        nextScreen: user.onboarded
        ? 'ledgerStoreWallet'
        : 'onboardingSetupPin',
        address,
        deviceId: deviceId,
        deviceName: deviceName,
      });
    },
    [navigation, deviceId, deviceName],
  );

  return <LedgerAccounts deviceId={deviceId} onAdd={onPressAdd} />;
};
