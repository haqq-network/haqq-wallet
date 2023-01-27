import React, {useCallback, useEffect, useRef, useState} from 'react';

import {
  Device,
  ProviderLedgerReactNative,
  scanDevices,
} from '@haqq/provider-ledger-react-native';
import {suggestApp} from '@haqq/provider-ledger-react-native/src/commands/suggest-app';

import {LedgerScan} from '@app/components/ledger-scan';
import {hideModal, showModal} from '@app/helpers';
import {awaitForBluetooth} from '@app/helpers/await-for-bluetooth';
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

  useEffect(() => {
    awaitForBluetooth().then(() => {
      console.log('connected');
    });
  }, []);

  const tryToConnect = useCallback(
    async (item: Device) => {
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

      try {
        await suggestApp(transport, LEDGER_APP);
        hideModal('ledger-no-app');
      } catch (e) {
        // @ts-ignore
        if (e instanceof Error && e.statusCode === 26631) {
          throw new Error('app_not_found');
        }
      }
      navigation.navigate('ledgerAccounts', {
        deviceId: item.id,
        deviceName: `Ledger ${item.name}`,
      });
    },
    [navigation],
  );

  const onRetry = useCallback(
    async (item: Device) => {
      try {
        await tryToConnect(item);
      } catch (e) {
        if (e instanceof Error) {
          switch (e.message) {
            case 'can_not_connected':
              break;
            case 'app_not_found':
              break;
          }
        }
      }
    },
    [tryToConnect],
  );

  const onPress = useCallback(
    async (item: Device) => {
      try {
        await tryToConnect(item);
      } catch (e) {
        if (e instanceof Error) {
          switch (e.message) {
            case 'can_not_connected':
              break;
            case 'app_not_found':
              showModal('ledger-no-app', {
                onRetry: () => {
                  return onRetry(item);
                },
              });
              break;
          }
        }
      }
    },
    [onRetry, tryToConnect],
  );

  return (
    <LedgerScan devices={devices} onSelect={onPress} refreshing={refreshing} />
  );
};
