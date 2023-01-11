import React, {useCallback, useEffect, useRef, useState} from 'react';

import {Device, scanDevices} from '@haqq/provider-ledger-react-native';

import {LedgerScan} from '@app/components/ledger-scan';
import {useTypedNavigation} from '@app/hooks';

export const LedgerScanScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const scan = useRef(scanDevices()).current;

  useEffect(() => {
    setRefreshing(true);
    const onDevice = (device: Device) => {
      console.log('onDevice', device);
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
    (item: Device) => {
      navigation.navigate('ledgerAccounts', {
        deviceId: item.id,
        deviceName: `Ledger ${item.name}`,
      });
    },
    [navigation],
  );

  return (
    <LedgerScan devices={devices} onSelect={onPress} refreshing={refreshing} />
  );
};
