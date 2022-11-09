import AppEth from '@ledgerhq/hw-app-eth';
import type Transport from '@ledgerhq/hw-transport';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import {BleManager, State} from 'react-native-ble-plx';

import {sleep} from '../utils';

const connectOptions = {
  requestMTU: 156,
  connectionPriority: 1,
};

export const runUntil = (
  deviceId: string,
  command: (eth: AppEth) => Promise<any>,
) => {
  console.log('runUntil');
  const bleManager = new BleManager();
  let result: any = null;
  let transport: Transport | null = null;
  let eth: AppEth | null = null;
  let aborted = false;

  function resetTransport() {
    if (transport) {
      transport = null;
    }
  }

  return {
    next: async () => {
      if (aborted) {
        return {
          done: true,
          value: null,
        };
      }
      try {
        if (!transport) {
          const state = await bleManager.state();

          if (state !== State.PoweredOn) {
            throw new Error(`not_connected ${state}`);
          }

          const device = await bleManager.connectToDevice(
            deviceId,
            connectOptions,
          );

          const isConnected = await device.isConnected();

          if (!isConnected) {
            await device.connect();
          }

          transport = await TransportBLE.open(device);

          if (transport) {
            transport.on('disconnect', resetTransport);
            eth = new AppEth(transport);
          }
        }

        if (!eth) {
          throw new Error('eth_not_found');
        }

        result = await command(eth);

        if (result) {
          return {
            value: result,
            done: true,
          };
        }
      } catch (e) {
        console.log('e', new Date(), e);
      }
      await sleep(500);
      return {
        value: null,
        done: false,
      };
    },
    abort: async () => {
      console.log('abort');
      if (transport) {
        aborted = true;
        await transport.close();
      }
    },
  };
};
