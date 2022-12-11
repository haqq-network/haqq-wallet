import React, {useCallback} from 'react';

import {Device} from 'react-native-ble-plx';

import {LedgerScan} from '@app/components/ledger-scan';
import {useTypedNavigation} from '@app/hooks';

export const LedgerScanScreen = () => {
  const navigation = useTypedNavigation();

  const onPress = useCallback(
    (item: Device) => {
      navigation.navigate('ledgerAccounts', {
        deviceId: item.id,
        deviceName: `Ledger ${item.name}`,
      });
    },
    [navigation],
  );

  return <LedgerScan onSelect={onPress} />;
};
