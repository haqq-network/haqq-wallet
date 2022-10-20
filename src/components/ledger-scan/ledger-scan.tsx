import React, {useCallback, useEffect, useState} from 'react';
import {FlatList} from 'react-native';
import {Device} from 'react-native-ble-plx';
import {PopupContainer} from '../ui';
import {Ledger, OnScanEvent} from '../../services/ledger';
import {LedgerScanRow} from './ledger-scan-row';
import {LedgerScanHeader} from './ledger-scan-header';

export type LedgerScanProps = {
  onSelect: (device: Device) => void;
  ledgerService: Ledger;
};

export const LedgerScan = ({onSelect, ledgerService}: LedgerScanProps) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const subscription = (event: OnScanEvent) => {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const {refreshing, device, error} = event;
      if (refreshing) {
        setRefreshing(refreshing);
      }

      if (device) {
        setDevices(devicesList =>
          devicesList.some(d => d.id === device.id)
            ? devicesList
            : devicesList.concat(device),
        );
      }

      if (error) {
        setError(error);
      }
    };

    ledgerService.on('onScan', subscription);
    ledgerService.scan();
    return () => {
      ledgerService.off('onScan', subscription);
    };
  }, [ledgerService]);

  const onPress = useCallback(
    (item: Device) => {
      onSelect(item);
    },
    [onSelect],
  );

  return (
    <PopupContainer>
      <FlatList
        data={devices}
        ListHeaderComponent={() => (
          <LedgerScanHeader ledgerService={ledgerService} />
        )}
        renderItem={({item}) => <LedgerScanRow item={item} onPress={onPress} />}
        refreshing={refreshing}
      />
    </PopupContainer>
  );
};
