import {BleManager, Device, State} from 'react-native-ble-plx';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';

import {EventEmitter} from 'events';
import {createContext, useContext} from 'react';
import {Observable, Subscription} from 'rxjs';
import AppEth from '@ledgerhq/hw-app-eth';
import {sleep} from '../utils';

if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

export type OnScanEvent = {
  refreshing?: boolean;
  error?: string;
  device: Device | null;
};

const path = "44'/60'/0'/0/0"; // HD derivation path

class Ledger extends EventEmitter {
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
        this.emit('onScan', {refreshing: true});
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

    let stop = false;

    transport.on('disconnect', () => {
      stop = true;
    });

    let address = null;

    while (!address && !stop) {
      try {
        const eth = new AppEth(transport);
        const resp = await eth.getAddress(path, validate);
        address = resp.address;
      } catch (error) {
        console.log('error', error);
      }
      await sleep(500);
    }

    return address;
  }
}

export const ledger = new Ledger();

export const LedgerContext = createContext(ledger);

export function useLedger() {
  const context = useContext(LedgerContext);

  return context;
}
