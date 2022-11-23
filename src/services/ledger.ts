import {EventEmitter} from 'events';

import AppEth from '@ledgerhq/hw-app-eth';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import {BleManager, Device, State} from 'react-native-ble-plx';
import {Observable, Subscription} from 'rxjs';

import {sleep} from '../utils';
import {ETH_HD_PATH} from '../variables';

export type OnScanEvent = {
  refreshing?: boolean;
  error?: string;
  device?: Device;
};

export const CLA = 0x55;
export const INS = {
  GET_VERSION: 0x00,
  INS_PUBLIC_KEY_SECP256K1: 0x01, // Obsolete
  SIGN_SECP256K1: 0x02,
  GET_ADDR_SECP256K1: 0x04,
};

export const P1_VALUES = {
  ONLY_RETRIEVE: 0x00,
  SHOW_ADDRESS_IN_DEVICE: 0x01,
};

export const ERROR_CODE = {
  NoError: 0x9000,
};

export function serializePath(path: number[]) {
  if (!path || path.length !== 5) {
    throw new Error('Invalid path.');
  }

  const buf = Buffer.alloc(20);
  buf.writeUInt32LE(0x80000000 + path[0], 0);
  buf.writeUInt32LE(0x80000000 + path[1], 4);
  buf.writeUInt32LE(0x80000000 + path[2], 8);
  buf.writeUInt32LE(path[3], 12);
  buf.writeUInt32LE(path[4], 16);

  return buf;
}

export function serializeHRP(hrp: string) {
  if (hrp == null || hrp.length < 3 || hrp.length > 83) {
    throw new Error('Invalid HRP');
  }
  const buf = Buffer.alloc(1 + hrp.length);
  buf.writeUInt8(hrp.length, 0);
  buf.write(hrp, 1);
  return buf;
}

export class Ledger extends EventEmitter {
  private bleManager: BleManager;
  private _state: State;
  private sub: Subscription | undefined;
  private _device: Device | undefined;

  constructor() {
    super();

    this.bleManager = new BleManager();
    this.bleManager.onStateChange(this.onStateChange);

    this._state = State.Unknown;
  }

  async init() {
    this.state = await this.bleManager.state();
  }

  private onStateChange(newState: State) {
    this.state = newState;
  }

  set state(newValue) {
    this._state = newValue;
    this.emit('stateChange', this._state);
  }

  get state() {
    return this._state;
  }

  set device(value) {
    this._device = value;
  }

  get device() {
    return this._device;
  }

  scan() {
    this.sub = new Observable(TransportBLE.listen).subscribe({
      complete: () => {
        this.emit('onScan', {refreshing: false});
      },
      next: e => {
        if (e.type === 'add') {
          this.emit('onScan', {device: e.descriptor});
        }
      },
      error: error => {
        this.emit('onScan', {refreshing: false, error});
      },
    });
  }

  getAddress() {
    let stop = false;
    requestAnimationFrame(async () => {
      let address = null;

      while (!address && !stop) {
        try {
          address = await this.getAddressTransport(this.device!, false);
          if (address) {
            this.emit('onAddress', address);
          }
        } catch (e) {
          console.log('e', e);
        }
      }
    });

    return () => {
      stop = true;
    };
  }

  async getAddressTransport(device: Device, validate: boolean) {
    const isConnected = await device.isConnected();

    if (!isConnected) {
      await device.connect();
    }

    const transport = await TransportBLE.open(device);
    transport.isConnected();
    let stop = false;

    transport.on('disconnect', () => {
      stop = true;
    });

    let address = null;
    const eth = new AppEth(transport);

    while (!address && !stop) {
      try {
        const resp = await eth.getAddress(ETH_HD_PATH, validate);
        address = resp.address;
      } catch (error) {
        console.log('error', error);
      }
      await sleep(500);
    }

    return address;
  }
}
