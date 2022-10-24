import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import type Transport from '@ledgerhq/hw-transport';
import AppEth from '@ledgerhq/hw-app-eth';
import {sleep} from '../utils';

export const runUntil = (
  deviceId: string,
  command: (eth: AppEth) => Promise<any>,
) => {
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
          transport = await TransportBLE.open(deviceId);
          if (transport) {
            // @ts-ignore
            const device = transport.device;
            const isConnected = await device.isConnected();

            if (!isConnected) {
              await device.connect();
            }

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
      if (transport) {
        aborted = true;
        await transport.close();
      }
    },
  };
};
