import React, {useCallback, useEffect, useRef, useState} from 'react';

import {
  Device,
  ProviderLedgerReactNative,
  scanDevices,
} from '@haqq/provider-ledger-react-native';

import {LedgerScan} from '@app/components/ledger-scan';
import {mockForWallet} from '@app/helpers/mockForWallet';
import {useTypedNavigation} from '@app/hooks';
import {LEDGER_APP} from '@app/variables/common';

export const LedgerScanScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const scan = useRef(scanDevices()).current;

  useEffect(() => {
    setRefreshing(true);
    const onDevice = (device: Device) => {
      setDevices(devicesList =>
        devicesList.some(d => d.id === device.id)
          ? devicesList
          : devicesList.concat(device),
      );
    };

    const onComplete = () => {
      setRefreshing(false);
    };

    scan.on('device', onDevice);
    scan.on('complete', onComplete);
    scan.on('error', onComplete);

    scan.start();

    return () => {
      scan.stop();
      scan.off('device', onDevice);
      scan.off('complete', onComplete);
      scan.off('error', onComplete);
    };
  }, [scan]);

  const navigation = useTypedNavigation();

  const onPress = useCallback(
    async (item: Device) => {
      try {
        const provider = new ProviderLedgerReactNative(mockForWallet, {
          cosmosPrefix: 'haqq',
          deviceId: item.id,
          hdPath: '',
          appName: LEDGER_APP,
        });

        const transport = await provider.awaitForTransport(item.id);

        if (!transport) {
          throw new Error('can_not_connected');
        }
        await transport.send(0xe0, 0x01, 0x00, 0x00);

        navigation.navigate('ledgerAccounts', {
          deviceId: item.id,
          deviceName: `Ledger ${item.name}`,
        });
      } catch (e) {}
    },
    [navigation],
  );

  return (
    <LedgerScan devices={devices} onSelect={onPress} refreshing={refreshing} />
  );
};
