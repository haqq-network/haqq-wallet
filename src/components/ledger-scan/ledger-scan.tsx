import React, {useCallback, useEffect, useState} from 'react';
import {FlatList} from 'react-native';
import {Device} from 'react-native-ble-plx';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import {Observable} from 'rxjs';
import {PopupContainer} from '../ui';
import {OnScanEvent} from '../../services/ledger';
import {LedgerScanRow} from './ledger-scan-row';
import {LedgerScanHeader} from './ledger-scan-header';
import {useApp} from '../../contexts/app';
import {LedgerScanEmpty} from './ledger-scan-empty';

export type LedgerScanProps = {
  onSelect: (device: Device) => void;
};

export const LedgerScan = ({onSelect}: LedgerScanProps) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const app = useApp();

  const subscription = useCallback((event: OnScanEvent) => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const {refreshing, device} = event;
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
  }, []);

  useEffect(() => {
    let sub;
    try {
      sub = new Observable(TransportBLE.listen).subscribe({
        complete: () => {
          subscription({refreshing: false});
        },
        next: event => {
          if (event.type === 'add') {
            subscription({device: event.descriptor});
          }
        },
        error: e => {
          console.log('error', e);
          subscription({refreshing: false, error: e});
        },
      });
    } catch (e) {
      console.log('err', e);
    }

    return () => {
      sub?.unsubscribe();
    };
  }, [app, subscription]);

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
        ListEmptyComponent={LedgerScanEmpty}
        ListHeaderComponent={LedgerScanHeader}
        renderItem={({item}) => <LedgerScanRow item={item} onPress={onPress} />}
        refreshing={refreshing}
      />
    </PopupContainer>
  );
};
