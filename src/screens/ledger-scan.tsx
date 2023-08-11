import React, {memo, useCallback, useEffect, useRef, useState} from 'react';

import {
  Device,
  ProviderLedgerReactNative,
  scanDevices,
} from '@haqq/provider-ledger-react-native';
import {suggestApp} from '@haqq/provider-ledger-react-native/src/commands/suggest-app';

import {LedgerScan} from '@app/components/ledger-scan';
import {app} from '@app/contexts';
import {hideModal, showModal} from '@app/helpers';
import {awaitForBluetooth} from '@app/helpers/await-for-bluetooth';
import {useTypedNavigation} from '@app/hooks';
import {
  LedgerStackParamList,
  LedgerStackRoutes,
} from '@app/screens/WelcomeStack/LedgerStack';
import {generateUUID} from '@app/utils';
import {LEDGER_APP} from '@app/variables/common';

export const LedgerScanScreen = memo(() => {
  const [refreshing, setRefreshing] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const scan = useRef(scanDevices()).current;
  const ledgerProvidersMap = useRef<
    Record<string, {taskId: string; provider: ProviderLedgerReactNative}>
  >({}).current;
  const [devicesLoadingMap, setDevicesLoadingMap] = useState<
    Record<string, boolean>
  >({});
  const [devicesErrorMap, setDevicesErrorMap] = useState<
    Record<string, string | undefined>
  >({});

  const setDeviceError = useCallback((device: Device, error?: Error | null) => {
    setDevicesErrorMap(prev => ({
      ...prev,
      [device.id]: error?.message,
    }));
  }, []);

  const setDeviceLoading = useCallback((device: Device, loading: boolean) => {
    setDevicesLoadingMap(prev => ({
      ...prev,
      [device.id]: loading,
    }));
  }, []);

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
      Object.values(ledgerProvidersMap).forEach(({provider, taskId}) => {
        provider?.emit?.(`stop-task-${taskId}`);
      });
    };
  }, [ledgerProvidersMap, scan]);

  const navigation = useTypedNavigation<LedgerStackParamList>();

  useEffect(() => {
    awaitForBluetooth().then(() => {
      Logger.log('connected');
    });
  }, []);

  const tryToConnect = useCallback(
    async (item: Device) => {
      setDeviceError(item, null);
      setDeviceLoading(item, true);
      const provider = new ProviderLedgerReactNative({
        getPassword: app.getPassword.bind(app),
        deviceId: item.id,
        appName: LEDGER_APP,
      });
      const taskId = generateUUID();

      ledgerProvidersMap[item.id] = {taskId, provider};

      const transport = await provider.awaitForTransport(item.id, taskId);

      if (!transport) {
        throw new Error('can_not_connected');
      }

      try {
        await suggestApp(transport, LEDGER_APP);
        hideModal('ledgerNoApp');
        navigation.navigate(LedgerStackRoutes.LedgerAccounts, {
          deviceId: item.id,
          deviceName: `Ledger ${item.name}`,
        });
        setDeviceError(item, null);
      } catch (err) {
        if (err instanceof Error) {
          setDeviceError(item, err);
          // @ts-ignore
          switch (err.statusCode) {
            case 26631:
              throw new Error('app_not_found');
            case 21761:
              throw new Error('user_refused_on_device');
          }
        }
      } finally {
        setDeviceLoading(item, false);
      }
    },
    [ledgerProvidersMap, navigation, setDeviceError, setDeviceLoading],
  );

  const onRetry = useCallback(
    async (item: Device) => {
      try {
        await tryToConnect(item);
      } catch (err) {
        Logger.error('ledgerScan:onRetry', item.name, err);

        if (err instanceof Error) {
          switch (err.message) {
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
      } catch (err) {
        Logger.error('ledgerScan:onPress', item.name, err);

        if (err instanceof Error) {
          switch (err.message) {
            case 'user_refused_on_device':
            case 'can_not_connected':
              break;
            case 'app_not_found':
              showModal('ledgerNoApp', {
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
    <LedgerScan
      devicesLoadingMap={devicesLoadingMap}
      devicesErrorMap={devicesErrorMap}
      devices={devices}
      onSelect={onPress}
      refreshing={refreshing}
    />
  );
});
