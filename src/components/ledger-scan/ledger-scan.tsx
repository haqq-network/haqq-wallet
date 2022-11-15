import React, {useCallback, useEffect, useRef, useState} from 'react';

import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import {FlatList} from 'react-native';
import {BleManager, Device} from 'react-native-ble-plx';
import {Observable, Subscription} from 'rxjs';

import {useApp} from '@app/hooks';

import {LedgerScanEmpty} from './ledger-scan-empty';
import {LedgerScanHeader} from './ledger-scan-header';
import {LedgerScanRow} from './ledger-scan-row';

import {captureException} from '../../helpers';
import {OnScanEvent} from '../../services/ledger';
import {PopupContainer} from '../ui';

export type LedgerScanProps = {
  onSelect: (device: Device) => void;
};

export const LedgerScan = ({onSelect}: LedgerScanProps) => {
  const transport = useRef<null | Subscription>(null);
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

  const listen = useCallback(() => {
    try {
      if (transport.current) {
        transport.current?.unsubscribe();
      }
      console.log('listen');
      transport.current = new Observable(TransportBLE.listen).subscribe({
        complete: () => {
          subscription({refreshing: false});
        },
        next: e => {
          if (e.type === 'add') {
            subscription({device: e.descriptor});
          }
        },
        error: e => {
          console.log('error', e);
          subscription({refreshing: false, error: e});
        },
      });
    } catch (e) {
      captureException(e, 'LedgerScan listen');
    }
  }, [subscription, transport]);

  useEffect(() => {
    /**
     * these variable needs to correct work of ledger scan
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _manager = new BleManager();
    let previousAvailable: boolean = false;
    const sub = new Observable<{available: boolean}>(
      TransportBLE.observeState,
    ).subscribe(e => {
      if (e.available !== previousAvailable) {
        console.log(e);
        previousAvailable = e.available;
        if (e.available) {
          listen();
        }
      }
    });

    listen();

    return () => {
      sub.unsubscribe();
      if (transport.current) {
        transport.current.unsubscribe();
      }
    };
  }, [app, listen, subscription, transport]);

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
